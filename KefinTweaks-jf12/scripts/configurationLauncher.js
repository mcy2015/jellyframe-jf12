// KefinTweaks configuration launcher (jf12 fork)
// The configuration UI (configuration.js plus ~1.6 MB of dependencies, mostly the home screen editors) used to load on every page for
// every user. This file is what the page loads instead: for admins it registers the same entry points (the "KefinTweaks" item in the
// user menu, #kefintweaks-config) and loads the full UI the first time one of them is used, or when an admin opens the dashboard or the
// preferences page (where configuration.js adds its own buttons). Nothing is written to the server here.
(function () {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks Config Launcher]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks Config Launcher]', ...args);
    const CONFIG_HASH = '#kefintweaks-config';

    let loading = null;

    function load() {
        if (window.KefinTweaksConfiguration && typeof window.KefinTweaksConfiguration.openConfigurationModal === 'function') {
            return Promise.resolve(true);
        }
        if (!loading) {
            const loader = window.KefinTweaksLoader;
            if (!loader || typeof loader.loadConfigurationUi !== 'function') {
                return Promise.reject(new Error('KefinTweaksLoader.loadConfigurationUi unavailable'));
            }
            LOG('Loading the configuration UI');
            loading = loader.loadConfigurationUi().then((ok) => {
                if (!ok) throw new Error('some configuration files failed to load');
                return true;
            }).catch((err) => {
                loading = null;
                throw err;
            });
        }
        return loading;
    }

    async function open(event) {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
            event.stopPropagation();
        }
        try {
            await load();
            return window.KefinTweaksConfiguration.openConfigurationModal();
        } catch (err) {
            ERR('Could not open the KefinTweaks configuration:', err);
        }
    }

    async function isAdmin() {
        try {
            const user = window.ApiClient && await window.ApiClient.getCurrentUser();
            return !!(user && user.Policy && user.Policy.IsAdministrator === true);
        } catch (e) {
            return false;
        }
    }

    function handleConfigHash() {
        if (window.location.hash !== CONFIG_HASH) return;
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        open();
    }

    async function loadAdminOnlyFeatures() {
        try {
            const loader = window.KefinTweaksLoader;
            if (!loader || typeof loader.getAdminOnlyScriptNames !== 'function') return;
            let major = window.KefinTweaks && window.KefinTweaks._jellyfinMajorVersion;
            if (major == null && window.KefinTweaks && typeof window.KefinTweaks.getJellyfinMajorVersion === 'function') major = await window.KefinTweaks.getJellyfinMajorVersion();
            const names = loader.getAdminOnlyScriptNames(window.KefinTweaksConfig, major);
            if (!names.length) return;
            const ok = await loader.loadScriptsOnDemand(names, window.KefinTweaksConfig);
            if (ok) LOG('Loaded for administrators:', names.join(', '));
            else ERR('Some files of', names.join(', '), 'failed to load');
        } catch (err) {
            ERR('Could not load the administrator features:', err);
        }
    }

    async function initialize() {
        if (!window.ApiClient || !window.ApiClient._loggedIn || !window.KefinTweaksUtils) {
            setTimeout(initialize, 1000);
            return;
        }
        window.addEventListener('hashchange', handleConfigHash);
        if (!(await isAdmin())) return;
        handleConfigHash();
        // the admin entry point configuration.js used to add on every page load (same name, icon and placement)
        window.KefinTweaksUtils.addCustomMenuLink('KefinTweaks', 'build', '', false, {
            userMenu: true,
            isAdminLink: true,
            action: 'KefinTweaksConfigLauncher.open'
        });
        // features only administrators use (User Manager hooks the Dashboard's user pages): loaded here, after the admin check, so that a
        // regular user's page never downloads them
        loadAdminOnlyFeatures();
        // the dashboard and preferences pages get configuration.js's own buttons: load the UI there
        window.KefinTweaksUtils.onViewPage((view, element, hash) => {
            const h = String(hash || '');
            if (view === 'dashboard' || view === 'configurationpage' || /dashboard|configurationpage|mypreferencesmenu|userpreferences/.test(h)) {
                load().catch((err) => ERR('Could not load the configuration UI:', err));
            }
        }, { pages: [] });
        LOG('Admin entry points registered (the configuration UI loads when it is opened)');
    }

    window.KefinTweaksConfigLauncher = { open, load };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
