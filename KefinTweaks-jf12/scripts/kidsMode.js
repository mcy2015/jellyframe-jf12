// KefinTweaks Kids Mode (jf12 fork): a simpler Jellyfin for children, driven by the server's own user policy, so a parent sets nothing extra.
// A user is a kid when Jellyfin limits them to some libraries (Policy.EnableAllFolders = false) or to a maximum parental rating
// (Policy.MaxParentalRating); administrators never are. An admin can force it on or off per user in the plugin page
// (KefinTweaksConfig.kidsMode.users = { <user id>: 'on' | 'off' }). For a kid: bigger tiles, no search (the button is hidden and #/search goes
// home), no "Request on Seerr" button and no Watch Together (both modules ask window.KefinTweaksKids.ready before they show anything).
(function () {
    'use strict';
    const LOG = (...a) => console.log('[KefinTweaks KidsMode]', ...a);

    function decide(user, users) {
        if (!user) return false;
        const forced = (users || {})[user.Id];
        if (forced === 'on') return true;
        if (forced === 'off') return false;
        const p = user.Policy || {};
        if (p.IsAdministrator) return false;
        return p.EnableAllFolders === false || (p.MaxParentalRating !== null && p.MaxParentalRating !== undefined);
    }

    // shortcut: decided once per page load; a different user signing in without a reload keeps the first answer until the next reload
    const ready = (async () => {
        while (!(window.ApiClient && ApiClient.getCurrentUserId && ApiClient.getCurrentUserId())) await new Promise((r) => setTimeout(r, 1000));      // the sign-in page: wait for a user
        try { return decide(await ApiClient.getCurrentUser(), window.KefinTweaksConfig?.kidsMode?.users) } catch (e) { return false }
    })();
    window.KefinTweaksKids = { ready, active: false, decide };

    const style = document.createElement('style');
    style.id = 'kefin-kids-css';
    // :not(#kefin-id-weight) gives the hide rule an id's weight, so a theme's !important toolbar rules cannot show the button again
    style.textContent = `
html.kefin-kids :is(.headerSearchButton, button[aria-label="Search"], a[href="#/search"], .MuiToolbar-root a[href*="/search"]):not(#kefin-id-weight) { display: none !important; }
html.kefin-kids .scrollSlider > .card { zoom: 1.3; }
html.kefin-kids .itemsContainer.vertical-wrap > .card.portraitCard { width: 25%; }
html.kefin-kids .itemsContainer.vertical-wrap > .card.backdropCard, html.kefin-kids .itemsContainer.vertical-wrap > .card.squareCard { width: 33.333%; }
@media (max-width: 800px) { html.kefin-kids .itemsContainer.vertical-wrap > .card.portraitCard { width: 50%; } html.kefin-kids .itemsContainer.vertical-wrap > .card.backdropCard { width: 100%; } }
html.kefin-kids .cardText { font-size: 1.15em; }`;

    ready.then((kid) => {
        window.KefinTweaksKids.active = kid;
        LOG(kid ? 'on for this user' : 'off for this user');
        if (!kid) return;
        document.head.appendChild(style);
        document.documentElement.classList.add('kefin-kids');
        const noSearch = () => { if (/^#\/search/.test(location.hash)) location.replace('#/home') };
        window.addEventListener('hashchange', noSearch);
        noSearch();
    });
})();
