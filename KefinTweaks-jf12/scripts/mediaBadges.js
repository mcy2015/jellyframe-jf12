// KefinTweaks Media Info Badges (jf12 fork): small 4K / 1080p, HDR / DV and audio badges on library cards and on the item page,
// read from the item's MediaStreams. Lazy: only cards that come into view are asked for, in batches (one /Items?Ids= request for up to
// BATCH ids), never more than MAX_CONCURRENT requests at once, and each answer is kept for the session (also "nothing to show").
// Config: KefinTweaksConfig.mediaBadges = { resolution: true, hdr: true, audio: true }.
(function () {
    'use strict';
    const LOG = (...a) => console.log('[KefinTweaks MediaBadges]', ...a);
    const ERR = (...a) => console.error('[KefinTweaks MediaBadges]', ...a);

    const BATCH = 40, MAX_CONCURRENT = 2;
    const TYPES = new Set(['Movie', 'Episode', 'Video', 'MusicVideo']);
    const cfg = () => Object.assign({ resolution: true, hdr: true, audio: true }, window.KefinTweaksConfig?.mediaBadges || {});
    const cache = new Map();          // item id -> [labels] (empty = nothing to show)
    const waiting = new Map();        // item id -> [card elements] waiting for an answer
    const queue = [];
    let running = 0, timer = 0;

    // ---------- what the badges say ----------
    const CODECS = { truehd: 'TrueHD', eac3: 'DD+', ac3: 'DD', dts: 'DTS', aac: 'AAC', flac: 'FLAC', opus: 'Opus', mp3: 'MP3' };
    function resolutionOf(w, h) {
        if (w >= 3800 || h >= 2100) return '4K';
        if (w >= 1900 || h >= 1000) return '1080p';
        if (w >= 1260 || h >= 700) return '720p';
        return h ? 'SD' : '';
    }
    function rangeOf(video) {
        const range = String(video.VideoRangeType || video.VideoRange || '');
        if (/DOVI/i.test(range)) return 'DV';
        if (/HDR10Plus/i.test(range)) return 'HDR10+';
        if (/HDR|HLG/i.test(range)) return 'HDR';
        return '';
    }
    function audioOf(audio) {
        const title = String(audio.DisplayTitle || '') + ' ' + String(audio.Profile || '');
        const codec = String(audio.Codec || '').toLowerCase();
        let name = CODECS[codec] || codec.toUpperCase();
        if (/atmos/i.test(title)) name = 'Atmos';
        else if (codec === 'dts' && /DTS-HD MA|\bMA\b/i.test(audio.Profile || '')) name = 'DTS-HD';
        const n = audio.Channels || 0;
        let ch = '';
        if (n >= 8) ch = '7.1';
        else if (n >= 6) ch = '5.1';
        else if (n === 2) ch = '2.0';
        else if (n === 1) ch = '1.0';
        else if (n) ch = n + 'ch';
        return [name, ch].filter(Boolean).join(' ');
    }
    function labelsFor(item) {
        const source = (item.MediaSources && item.MediaSources[0]) || {};
        const streams = source.MediaStreams || item.MediaStreams || [];
        const video = streams.find((s) => s.Type === 'Video');
        const audio = streams.find((s) => s.Type === 'Audio' && s.IsDefault) || streams.find((s) => s.Type === 'Audio');
        const c = cfg();
        const out = [
            video && c.resolution ? resolutionOf(video.Width || 0, video.Height || 0) : '',
            video && c.hdr ? rangeOf(video) : '',
            audio && c.audio ? audioOf(audio) : ''
        ];
        return out.filter(Boolean);
    }

    function badgeEl(labels, cls) {
        const box = document.createElement('div');
        box.className = cls;
        for (const l of labels) { const b = document.createElement('span'); b.className = 'kefin-badge'; b.textContent = l; box.appendChild(b); }
        return box;
    }

    function paint(card, labels) {
        if (!labels.length || card.querySelector('.kefin-card-badges')) return;
        const host = card.querySelector('.cardImageContainer') || card.querySelector('.cardScalable');
        if (host) host.appendChild(badgeEl(labels, 'kefin-card-badges'));
    }

    // ---------- requests: batched, at most MAX_CONCURRENT at a time ----------
    function want(id, card) {
        if (cache.has(id)) { paint(card, cache.get(id)); return }
        if (waiting.has(id)) { waiting.get(id).push(card); return }
        waiting.set(id, [card]); queue.push(id);
        if (!timer) timer = setTimeout(() => { timer = 0; pump() }, 50);       // cards come into view one callback at a time: collect them first
    }
    function pump() {
        while (running < MAX_CONCURRENT && queue.length) {
            const ids = queue.splice(0, BATCH);
            running++;
            ApiClient.getItems(ApiClient.getCurrentUserId(), { Ids: ids.join(','), Fields: 'MediaStreams,MediaSources', EnableImages: false, EnableUserData: false })
                .then((r) => { for (const it of (r && r.Items) || []) cache.set(it.Id, labelsFor(it)) })
                .catch((e) => ERR('could not read media info', e))
                .finally(() => {
                    for (const id of ids) { const labels = cache.get(id) || []; cache.set(id, labels); (waiting.get(id) || []).forEach((c) => paint(c, labels)); waiting.delete(id) }
                    running--; if (queue.length) pump();
                });
        }
    }

    // ---------- cards: only the ones that come into view ----------
    const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (!e.isIntersecting) continue;
            io.unobserve(e.target);
            want(e.target.dataset.id, e.target);
        }
    }, { rootMargin: '200px' });

    function scanCards() {
        document.querySelectorAll('.card[data-id]:not([data-kefin-badges])').forEach((card) => {
            card.setAttribute('data-kefin-badges', '');
            if (TYPES.has(card.dataset.type)) io.observe(card);
        });
    }

    // ---------- the item page ----------
    async function paintDetails() {
        const m = /[#&?]id=([0-9a-f]{32})/i.exec(location.hash);
        if (!/^#\/details/.test(location.hash) || !m) return;
        const page = document.querySelector('.itemDetailPage:not(.hide)');
        const row = page && page.querySelector('.itemMiscInfo-primary');
        if (!row || row.querySelector('.kefin-detail-badges')) return;
        const id = m[1];
        if (!cache.has(id)) {
            try { cache.set(id, labelsFor(await ApiClient.getItem(ApiClient.getCurrentUserId(), id))) } catch (e) { cache.set(id, []) }
        }
        const labels = cache.get(id);
        if (labels.length && !row.querySelector('.kefin-detail-badges') && location.hash.includes(id)) row.appendChild(badgeEl(labels, 'kefin-detail-badges mediaInfoItem'));
    }

    const style = document.createElement('style');
    style.id = 'kefin-media-badges-css';
    style.textContent = `
.kefin-card-badges { position: absolute; left: .35em; bottom: .35em; display: flex; gap: .25em; flex-wrap: wrap; z-index: 2; pointer-events: none; max-width: calc(100% - .7em); }
.kefin-badge { font: 600 .68em/1 system-ui, sans-serif; letter-spacing: .02em; padding: .25em .4em; border-radius: .3em; background: rgba(0,0,0,.72); color: #fff; white-space: nowrap; }
.kefin-detail-badges { display: inline-flex; gap: .35em; vertical-align: middle; }
.kefin-detail-badges .kefin-badge { font-size: .8em; }
.card:hover .kefin-card-badges { opacity: 0; transition: opacity .15s; }`;
    document.head.appendChild(style);

    let scheduled = false;
    const tick = () => { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; if (!window.ApiClient || !ApiClient.getCurrentUserId()) return; scanCards(); paintDetails() }) };
    new MutationObserver(tick).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', tick);
    tick();
    window.KefinTweaksMediaBadges = { labelsFor };
    LOG('ready');
})();
