// KefinTweaks "Request it" (jf12 fork): a "Request on Seerr" button that opens the configured Seerr / Jellyseerr / Overseerr in a new tab
//   - on the search page when the search finds nothing or little (fewer than FEW results): Seerr's own search, with the query filled in
//   - on the page of an item that has no media: a missing movie or episode (LocationType Virtual) or a collection (to request the rest of it):
//     Seerr's page of that movie / show / collection when the item has a TMDb id, else Seerr's search for its name
// Config: KefinTweaksConfig.requestSeerr = { url: 'https://seerr.example.com', onSearch: true, onItem: true }. No URL = nothing shown.
// Not for Kids Mode users. It only links: no Seerr API call, no key, nothing written anywhere.
(function () {
    'use strict';
    const LOG = (...a) => console.log('[KefinTweaks RequestSeerr]', ...a);
    const FEW = 6;
    const cfg = () => Object.assign({ url: '', onSearch: true, onItem: true }, window.KefinTweaksConfig?.requestSeerr || {});
    const base = () => { const u = String(cfg().url || '').trim().replace(/\/+$/, ''); return /^https?:\/\//i.test(u) ? u : '' };
    const kid = () => window.KefinTweaksKids ? window.KefinTweaksKids.ready : Promise.resolve(false);

    function button(href, label, cls) {
        const a = document.createElement('a');
        a.className = cls; a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.innerHTML = '<span class="material-icons" aria-hidden="true">add_circle_outline</span><span></span>';
        a.lastChild.textContent = label;
        return a;
    }

    // ---------- search ----------
    function paintSearch() {
        const old = document.querySelector('.kefin-seerr-search');
        if (!cfg().onSearch || !/^#\/search/.test(location.hash)) { if (old) old.remove(); return }
        const q = (new URLSearchParams(location.hash.split('?')[1] || '').get('query') || '').trim();
        const page = document.querySelector('.page:not(.hide)');
        const results = page ? page.querySelectorAll('.card').length : 0;
        if (!q || !page || results >= FEW) { if (old) old.remove(); return }
        const href = `${base()}/search?query=${encodeURIComponent(q)}`;
        if (old && old.getAttribute('href') === href && page.contains(old)) return;
        if (old) old.remove();
        const b = button(href, results ? `Not what you want? Request "${q}" on Seerr` : `Nothing here. Request "${q}" on Seerr`, 'kefin-seerr-search emby-button raised');
        const fields = page.querySelector('.searchFields');
        if (fields) fields.after(b); else page.prepend(b);
    }

    // ---------- item page ----------
    const seerrPath = { Movie: 'movie', Series: 'tv', BoxSet: 'collection' };
    async function itemHref(item) {
        let target = item;
        if ((item.Type === 'Episode' || item.Type === 'Season') && item.SeriesId) {
            try { target = await ApiClient.getItem(ApiClient.getCurrentUserId(), item.SeriesId) } catch (e) { target = { Name: item.SeriesName } }
        }
        const tmdb = target.ProviderIds && (target.ProviderIds.Tmdb || target.ProviderIds.TmdbCollection);
        const path = seerrPath[target.Type] || (item.Type === 'Episode' || item.Type === 'Season' ? 'tv' : null);
        return tmdb && path ? `${base()}/${path}/${tmdb}` : `${base()}/search?query=${encodeURIComponent(target.Name || item.Name || '')}`;
    }
    const hrefs = new Map();          // item id -> Promise<link | null> (null: the item has media, no button)
    async function paintItem() {
        const m = /[#&?]id=([0-9a-f]{32})/i.exec(location.hash);
        if (!cfg().onItem || !/^#\/details/.test(location.hash) || !m) return;
        const page = document.querySelector('.itemDetailPage:not(.hide)');
        const buttons = page && page.querySelector('.mainDetailButtons');
        if (!buttons || buttons.querySelector('.kefin-seerr-item')) return;
        const id = m[1];
        if (!hrefs.has(id)) hrefs.set(id, ApiClient.getItem(ApiClient.getCurrentUserId(), id).then((item) => item && (item.LocationType === 'Virtual' || item.Type === 'BoxSet') ? itemHref(item).then((href) => ({ href, boxset: item.Type === 'BoxSet' })) : null).catch(() => null));
        const r = await hrefs.get(id);
        if (!r || !location.hash.includes(id) || buttons.querySelector('.kefin-seerr-item') || !buttons.isConnected) return;
        buttons.appendChild(button(r.href, r.boxset ? 'Request the rest on Seerr' : 'Request on Seerr', 'kefin-seerr-item button-flat detailButton emby-button'));
    }

    const style = document.createElement('style');
    style.id = 'kefin-seerr-css';
    style.textContent = `
.kefin-seerr-search { display: inline-flex; align-items: center; gap: .5em; margin: 1em auto; padding: .6em 1.2em; text-decoration: none; }
.page > .kefin-seerr-search, .searchFields + .kefin-seerr-search { display: flex; width: fit-content; }
.kefin-seerr-item { display: inline-flex; align-items: center; gap: .4em; text-decoration: none; }`;

    kid().then((isKid) => {
        if (isKid || !base()) { LOG(isKid ? 'Kids Mode: off for this user' : 'no Seerr URL configured: nothing to show'); return }
        document.head.appendChild(style);
        let scheduled = false;
        const tick = () => { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; if (!window.ApiClient || !ApiClient.getCurrentUserId()) return; paintSearch(); paintItem() }) };
        new MutationObserver(tick).observe(document.body, { childList: true, subtree: true });
        window.addEventListener('hashchange', tick);
        tick();
        LOG('ready');
    });
})();
