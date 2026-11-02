// KefinTweaks Jump Bar (jf12 fork): an A-Z (and #) rail on the Movies, TV and Music library grids. A letter scrolls to the first item that
// sorts under it. When that item is not loaded yet it loads more (Infinite Scroll's own loading when that feature is on, else Jellyfin's
// Next page button) until the letter shows up, with a spinner, and stops after MAX_LOADS rounds. Only shown while the grid is sorted by name.
(function () {
    'use strict';
    const LOG = (...a) => console.log('[KefinTweaks JumpBar]', ...a);
    const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    const MAX_LOADS = 25;
    const ROUTE = /^#\/(movies|tv|music)\?/;
    let bar = null, busy = false;

    const params = () => new URLSearchParams(location.hash.split('?')[1] || '');
    const article = /^(the|a|an)\s+/i;                       // Jellyfin's default SortRemoveWords
    function letterOf(name) {
        const c = String(name || '').trim().replace(article, '').charAt(0).toUpperCase();
        return c >= 'A' && c <= 'Z' ? c : '#';
    }
    const rank = (l) => LETTERS.indexOf(l);

    // the main grid of the page (the view picked in the toolbar must be the first one: Movies / Shows / Albums)
    function grid() {
        if (!ROUTE.test(location.hash) || +(params().get('tab') || 0) !== 0) return null;
        const page = document.querySelector('.libraryPage:not(.hide), .page:not(.hide)');
        const g = page && page.querySelector('.itemsContainer.vertical-wrap, .itemsContainer');
        return g && g.querySelector('.card[data-id]') ? g : null;
    }
    // sorted by name, ascending? Jellyfin 12 keeps the view settings under "<view> - <library id>"; nothing stored = its default (SortName)
    function sortedByName() {
        const id = params().get('topParentId') || params().get('parentId');
        for (const view of ['movies', 'tvshows', 'series', 'musicalbums', 'music']) {
            try {
                const s = JSON.parse(localStorage.getItem(`${view} - ${id}`) || 'null');
                if (!s) continue;
                const by = Array.isArray(s.SortBy) ? s.SortBy[0] : String(s.SortBy || 'SortName').split(',')[0];
                return /^(SortName|Name)$/i.test(by) && (s.SortOrder || 'Ascending') === 'Ascending' && !s.NameStartsWith;
            } catch (e) { /* unreadable: treat as the default */ }
        }
        return true;
    }
    const nameOf = (card) => (card.querySelector('.cardText-first, .cardText') || {}).textContent || card.getAttribute('aria-label') || '';

    function firstAtOrAfter(g, letter) {
        for (const card of g.querySelectorAll('.card[data-id]')) if (rank(letterOf(nameOf(card))) >= rank(letter)) return card;
        return null;
    }
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    async function loadMore(g) {
        const before = g.querySelectorAll('.card[data-id]').length;
        const next = document.querySelector('.page:not(.hide) .btnNextPage:not([disabled])');
        // Infinite Scroll (on unless switched off; Movies and TV only) loads one viewport before the end; otherwise Jellyfin's own Next page
        const infinite = window.KefinTweaksConfig?.scripts?.infiniteScroll !== false && /^#\/(movies|tv)\?/.test(location.hash);
        const toEnd = () => window.scrollTo(0, document.documentElement.scrollHeight);
        if (infinite) toEnd();
        else if (next) next.click();
        else return false;
        for (let t = 0; t < 40; t++) {                                              // up to 6 s for the next page
            await sleep(150);
            if (infinite && t % 8 === 7) { window.scrollBy(0, -1); toEnd() }        // Infinite Scroll ignores a scroll within 1 s of its last load: nudge again
            const g2 = grid();
            if (!g2) return false;
            if (g2.querySelectorAll('.card[data-id]').length !== before || g2 !== g) return true;
        }
        return false;
    }

    async function jump(letter) {
        if (busy) return;
        busy = true; bar.classList.add('kefin-jump-busy');
        try {
            for (let round = 0; round <= MAX_LOADS; round++) {
                const g = grid();
                if (!g) return;
                const card = firstAtOrAfter(g, letter);
                if (card) { card.scrollIntoView({ block: 'center' }); card.querySelector('a, button')?.focus({ preventScroll: true }); return }
                if (round === MAX_LOADS || !(await loadMore(g))) {
                    const cards = g.querySelectorAll('.card[data-id]');
                    if (cards.length) cards[cards.length - 1].scrollIntoView({ block: 'center' });
                    return;
                }
            }
        } finally { busy = false; bar && bar.classList.remove('kefin-jump-busy') }
    }

    function build() {
        const b = document.createElement('nav');
        b.className = 'kefin-jump-bar';
        b.setAttribute('aria-label', 'Jump to letter');
        for (const l of LETTERS) {
            const a = document.createElement('button');
            a.type = 'button'; a.textContent = l; a.dataset.letter = l; a.title = l === '#' ? 'Numbers and symbols' : 'Jump to ' + l;
            b.appendChild(a);
        }
        b.addEventListener('click', (e) => { const l = e.target.closest('button')?.dataset.letter; if (l) jump(l) });
        const spin = document.createElement('span'); spin.className = 'kefin-jump-spinner'; spin.setAttribute('aria-hidden', 'true'); b.appendChild(spin);
        return b;
    }

    function update() {
        const show = !!grid() && sortedByName();
        if (show && !bar) { bar = build(); document.body.appendChild(bar) }
        if (bar) bar.hidden = !show;
    }

    const style = document.createElement('style');
    style.id = 'kefin-jump-bar-css';
    style.textContent = `
.kefin-jump-bar { position: fixed; right: 2px; top: 50%; transform: translateY(-50%); z-index: 900; display: flex; flex-direction: column; align-items: center; padding: .3em .1em; border-radius: 1em; background: rgba(0,0,0,.35); }
.kefin-jump-bar[hidden] { display: none; }
.kefin-jump-bar button { all: unset; cursor: pointer; font: 600 11px/1.35 system-ui, sans-serif; width: 1.6em; text-align: center; color: rgba(255,255,255,.85); border-radius: .4em; }
.kefin-jump-bar button:hover, .kefin-jump-bar button:focus-visible { background: rgba(255,255,255,.2); color: #fff; }
.kefin-jump-spinner { display: none; width: 12px; height: 12px; margin-top: .3em; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: kefin-jump-spin .8s linear infinite; }
.kefin-jump-busy .kefin-jump-spinner { display: block; }
.kefin-jump-busy button { opacity: .5; pointer-events: none; }
@keyframes kefin-jump-spin { to { transform: rotate(360deg); } }
@media (max-height: 560px) { .kefin-jump-bar button { line-height: 1.05; font-size: 9px; } }`;
    document.head.appendChild(style);

    let scheduled = false;
    const tick = () => { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; update() }) };
    new MutationObserver(tick).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', tick);
    tick();
    window.KefinTweaksJumpBar = { jump, letterOf };
    LOG('ready');
})();
