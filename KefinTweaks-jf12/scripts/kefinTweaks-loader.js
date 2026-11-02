// KefinTweaks Loader — shared catalog, load plan, and KefinTweaks-injector script builder
(function () {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks Loader]', ...args);
    const WARN = (...args) => console.warn('[KefinTweaks Loader]', ...args);

    const KEFIN_INJECTOR_ENTRY_NAME = 'KefinTweaks-injector';
    const KEFIN_CONFIG_ENTRY_NAME = 'KefinTweaks-Config';

    // jf12 fork: attribution only. Nothing is ever fetched from the upstream project; every file comes from
    // KefinTweaksConfig.kefinTweaksRoot (a commit-pinned URL or a self-hosted folder). MIT licence: see LICENSE.
    const VERSION = '0.5.0-jf12.1';          // jf12 fork release (the installed folder is still named after the commit)
    const UPSTREAM = {
        name: 'KefinTweaks',
        author: 'ranaldsgift',
        repository: 'https://github.com/ranaldsgift/KefinTweaks',
        license: 'MIT',
        forkedFrom: 'experimental @ e74bcbd'
    };

    // jf12 fork defaults: modules that duplicate Jellyfin 12 / Jellyfin Enhanced / Home Screen Sections / Media Bar / Playback
    // Reporting, target Jellyfin 10.x only, override native pages, or write to the server on their own are off; see docs/JF12-FORK.md.
    const DEFAULT_ENABLED_SCRIPTS = {
        watchlist: true,
        homeScreen: false,
        search: false,
        headerTabs: false,
        customMenuLinks: false,
        hamburgerMenu: false,
        updoot: false,
        backdropLeakFix: false,
        dashboardButtonFix: false,
        infiniteScroll: true,
        removeContinue: false,
        subtitleSearch: true,
        playlist: true,
        itemDetailsCollections: false,
        flattenSingleSeasonShows: true,
        seriesInfo: true,
        versionPreferences: true,
        collections: true,
        skinManager: false,
        thumbnailScrubber: false,
        watchTogether: false,
        userManager: false,
        games: false,
        mediaBadges: true,         // jf12 fork: small, lazy, read-only (batched /Items?Ids= GETs for the cards in view)
        requestSeerr: false,
        jumpBar: false,
        kidsMode: false
    };

    const THIRD_PARTY_SCRIPTS = {
        pickr: {
            js: [
                'thirdparty/pickr/pickr.min.js'
            ],
            css: [
                'thirdparty/pickr/pickr-nano.min.css'
            ]
        },
        chartjs: {
            js: [
                'thirdparty/chartjs/chart.js'
            ],
            css: []
        }
    };

    const SCRIPT_DEFINITIONS = [
        {
            name: 'utils',
            script: 'utils.js',
            css: null,
            dependencies: [],
            description: 'Common utilities for page view management and MutationObserver conversion'
        },
        {
            name: 'skinConfigLegacyDefaults',
            script: 'skinConfig-0.3.5-defaults.js',
            css: null,
            dependencies: [],
            description: 'Legacy skin defaults (v0.3.5) for duplicate detection'
        },
        {
            name: 'skinConfig',
            script: 'skinConfig.js',
            css: null,
            dependencies: [],
            description: 'Default skin configuration for KefinTweaks'
        },
        {
            name: 'ui',
            script: 'ui.js',
            css: null,
            dependencies: [],
            description: 'UI helper functions for KefinTweaks'
        },
        {
            name: 'homeScreenConfig',
            script: 'homeScreenConfig.js',
            css: null,
            dependencies: [],
            description: 'Default home screen configuration for KefinTweaks'
        },
        {
            name: 'homeScreenConfig2',
            script: 'homeScreenConfig2.js',
            css: null,
            dependencies: [],
            description: 'Default home screen configuration for KefinTweaks'
        },
        {
            name: 'homeScreen-migration',
            script: '../configuration/homeScreen-migration.js',
            css: null,
            dependencies: [],
            description: 'Home screen migration for KefinTweaks'
        },
        {
            name: 'homeScreen-user-configuration',
            script: '../configuration/homeScreen-user-configuration.js',
            css: null,
            dependencies: ['ui', 'utils'],
            description: 'User home screen section preferences and bulk order editor'
        },
        {
            name: 'homeScreenSectionConfigure',
            script: 'homeScreenSectionConfigure.js',
            css: null,
            dependencies: ['homeScreen-user-configuration', 'modal', 'ui', 'cardBuilder'],
            thirdParty: ['pickr'],
            description: 'Inline configure popover for user home screen sections'
        },
        {
            name: 'homeScreenPin',
            script: 'homeScreenPin.js',
            css: null,
            dependencies: ['homeScreen-user-configuration', 'modal', 'utils'],
            description: 'Pin items to the home screen from context menus'
        },
        {
            name: 'homeScreenCustomItemsEditor',
            script: '../configuration/homeScreenCustomItemsEditor.js',
            css: null,
            dependencies: [],
            description: 'Shared custom items editor (wizard + advanced)'
        },
        {
            name: 'homeScreenSectionEditor',
            script: '../configuration/homeScreenSectionEditor.js',
            css: '../configuration/homeScreenSectionEditor.css',
            dependencies: ['modal', 'toaster', 'utils', 'cardBuilder', 'ui', 'homeScreenCustomItemsEditor', 'homeScreenAdvancedEditor'],
            description: 'Home screen section editor (wizard + advanced)'
        },
        {
            name: 'homeScreenEditorProfiles',
            script: '../configuration/homeScreenEditorProfiles.js',
            css: null,
            dependencies: [],
            description: 'Editor profile registry for home screen section editor'
        },
        {
            name: 'homeScreenAdvancedEditor',
            script: '../configuration/homeScreenAdvancedEditor.js',
            css: '../configuration/homeScreenAdvancedEditor.css',
            dependencies: ['ui', 'homeScreenCustomItemsEditor', 'homeScreenEditorProfiles'],
            thirdParty: ['pickr'],
            description: 'Advanced section editor UI for custom sections'
        },
        {
            name: 'homescreenBenchmark',
            script: '../configuration/homescreenBenchmark.js',
            css: null,
            dependencies: ['apiHelper'],
            description: 'Home screen section query benchmarks for admin config'
        },
        {
            name: 'homeScreen-configuration',
            script: '../configuration/homeScreen-configuration.js',
            css: '../configuration/homeScreen-configuration.css',
            dependencies: ['modal', 'toaster', 'utils', 'cardBuilder', 'ui', 'homeScreenCustomItemsEditor', 'homeScreenSectionEditor', 'homescreenBenchmark', 'sectionHelper'],
            description: 'Home screen configuration for KefinTweaks'
        },
        {
            name: 'search-configuration',
            script: '../configuration/search-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Search configuration for KefinTweaks'
        },
        {
            name: 'seriesEpisodes-configuration',
            script: '../configuration/seriesEpisodes-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Series episodes configuration for KefinTweaks'
        },
        {
            name: 'seriesInfo-configuration',
            script: '../configuration/seriesInfo-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Series info configuration for KefinTweaks'
        },
        {
            name: 'versionPreferences-configuration',
            script: '../configuration/versionPreferences-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Item version preferences configuration for KefinTweaks'
        },
        {
            name: 'skinManager-configuration',
            script: '../configuration/skinManager-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Skin manager configuration for KefinTweaks'
        },
        {
            name: 'customMenuLinks-configuration',
            script: '../configuration/customMenuLinks-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Custom menu links configuration for KefinTweaks'
        },
        {
            name: 'homeScreenConfigCommunity',
            script: 'homeScreenConfig-community.js',
            css: null,
            dependencies: [],
            description: 'Community home screen sections for KefinTweaks'
        },
        {
            name: 'peopleCache',
            script: 'peopleCache.js',
            css: null,
            dependencies: ['libraryCacheUtils', 'userHelper', 'moviesCache', 'seriesCache', 'indexedDBCache', 'apiHelper'],
            description: 'People cache for KefinTweaks'
        },
        {
            name: 'studiosCache',
            script: 'studiosCache.js',
            css: null,
            dependencies: [],
            description: 'Studios cache for KefinTweaks'
        },
        {
            name: 'libraryCacheUtils',
            script: 'libraryCacheUtils.js',
            css: null,
            dependencies: [],
            description: 'Shared strip/provider helpers for library caches'
        },
        {
            name: 'moviesCache',
            script: 'moviesCache.js',
            css: null,
            dependencies: ['libraryCacheUtils', 'userHelper', 'indexedDBCache', 'apiHelper'],
            description: 'Movies library cache for KefinTweaks'
        },
        {
            name: 'seriesCache',
            script: 'seriesCache.js',
            css: null,
            dependencies: ['libraryCacheUtils', 'userHelper', 'indexedDBCache', 'apiHelper'],
            description: 'Series library cache for KefinTweaks'
        },
        {
            name: 'libraryCache',
            script: 'libraryCache.js',
            css: null,
            dependencies: ['moviesCache', 'seriesCache'],
            description: 'Library cache facade for KefinTweaks'
        },
        {
            name: 'externalList',
            script: 'externalList.js',
            css: null,
            dependencies: ['libraryCache', 'libraryCacheUtils', 'apiHelper'],
            description: 'MDBList external list matching for home sections'
        },
        {
            name: 'skinManager',
            script: 'skinManager.js',
            css: 'defaultSkin.css',
            dependencies: ['utils', 'skinConfigLegacyDefaults', 'skinConfig', 'modal', 'apiHelper'],
            priority: true, // Load immediately after dependencies to reduce UI disruption
            description: 'Adds skin selection dropdown to display preferences page and manages skin CSS loading'
        },
        {
            name: 'apiHelper',
            script: 'apiHelper.js',
            css: null,
            dependencies: ['dataHelper'],
            description: 'API helper functions for common Jellyfin operations'
        },
        {
            name: 'sectionHelper',
            script: 'sectionHelper.js',
            css: null,
            dependencies: ['apiHelper', 'cardBuilder', 'peopleCache', 'studiosCache', 'moviesCache', 'seriesCache', 'libraryCache', 'homeScreenConfig2', 'dataHelper'],
            description: 'Section loading and progressive discovery resolve helpers'
        },
        {
            name: 'cardBuilder',
            script: 'cardBuilder.js',
            css: 'cardBuilder.css',
            dependencies: ['apiHelper', 'userHelper'],
            description: 'Core card building functionality (required by other scripts)'
        },
        {
            name: 'localStorageCache',
            script: 'localStorageCache.js',
            css: null,
            dependencies: [],
            description: 'localStorage-based caching layer with 24-hour TTL and manual refresh'
        },
        {
            name: 'indexedDBCache',
            script: 'indexedDBCache.js',
            css: null,
            dependencies: [],
            description: 'IndexedDB-based caching layer for large datasets with TTL support'
        },
        {
            name: 'modal',
            script: 'modal.js',
            css: 'modal.css',
            dependencies: [],
            description: 'Generic modal system for Jellyfin-style dialogs'
        },
        {
            name: 'userHelper',
            script: 'userHelper.js',
            css: null,
            dependencies: [],
            description: 'User helper functions for Jellyfin operations'
        },
        {
            name: 'dataHelper',
            script: '../helpers/dataHelper.js',
            css: null,
            dependencies: [],
            description: 'Data helper functions for Jellyfin operations'
        },
        {
            name: 'websocketHelper',
            script: '../helpers/websocketHelper.js',
            css: null,
            dependencies: [],
            description: 'WebSocket helper functions for Jellyfin operations'
        },
        {
            name: 'kidsMode',
            script: 'kidsMode.js',
            css: null,
            dependencies: [],
            description: 'Kids Mode: a simpler Jellyfin for users the server limits to some libraries or a parental rating (before Watch Together and Request it, which ask it)'
        },
        {
            name: 'extras-configuration',
            script: '../configuration/extras-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Settings of Request it (Seerr), Media Info Badges and Kids Mode'
        },
        {
            name: 'watchTogether-configuration',
            script: '../configuration/watchTogether-configuration.js',
            css: null,
            dependencies: ['modal', 'ui'],
            description: 'Configuration UI for Watch Together'
        },
        {
            name: 'watchTogether',
            script: 'watchTogether.js',
            css: null,
            dependencies: ['utils', 'modal', 'apiHelper', 'userHelper', 'websocketHelper', 'ui', 'toaster', 'watchTogether-configuration'],
            description: 'Watch Together: sync watched/in-progress state to selected group accounts'
        },
        {
            name: 'userManager-configuration',
            script: '../configuration/userManager-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils', 'apiHelper', 'ui'],
            description: 'Configuration UI for User Manager templates'
        },
        {
            name: 'userManager',
            script: 'userManager.js',
            css: 'userManager.css',
            dependencies: ['utils', 'modal', 'apiHelper', 'userHelper', 'toaster', 'userManager-configuration'],
            adminOnly: true, // jf12 fork: never part of the page-load plan; configurationLauncher.js loads it for administrators only
            description: 'User Manager: apply policy templates on new user creation and bulk-edit existing users'
        },
        {
            name: 'toaster',
            script: 'toaster.js',
            css: null,
            dependencies: [],
            description: 'Toast notification system using Jellyfin\'s existing toast functionality'
        },
        {
            name: 'statistics',
            script: 'statistics.js',
            css: null,
            dependencies: [],
            thirdParty: ['chartjs'],
            description: 'Watchlist statistics charts and activity analytics (jf12 fork: loaded on demand)'
        },
        {
            name: 'watchlist-configuration',
            script: '../configuration/watchlist-configuration.js',
            css: null,
            dependencies: ['modal', 'ui'],
            description: 'Configuration UI for Watchlist menu placements'
        },
        {
            name: 'watchlist',
            script: 'watchlist.js',
            css: 'watchlist.css',
            dependencies: ['cardBuilder', 'localStorageCache', 'modal', 'utils', 'websocketHelper'],
            description: 'Adds watchlist functionality throughout Jellyfin interface (statistics + Chart.js load on demand; its settings dialog comes with the configuration UI)'
        },
        {
            name: 'homeScreen',
            script: 'homeScreen3.js',
            css: 'homeScreen.css',
            dependencies: ['cardBuilder', 'localStorageCache', 'utils', 'userHelper', 'homeScreenConfig2', 'homeScreen-configuration', 'peopleCache', 'studiosCache', 'moviesCache', 'seriesCache', 'libraryCache', 'libraryCacheUtils', 'externalList', 'indexedDBCache', 'homeScreenConfigCommunity', 'dataHelper', 'apiHelper', 'sectionHelper', 'homeScreen-migration', 'homeScreen-user-configuration', 'homeScreenSectionConfigure', 'homeScreenPin'],
            priority: true, // Load immediately after dependencies to reduce UI disruption
            description: 'Adds custom home screen sections'
        },
        {
            name: 'search',
            script: 'search.js',
            css: 'search.css',
            dependencies: ['cardBuilder', 'utils'],
            description: 'Enhanced search functionality'
        },
        {
            name: 'headerTabs',
            script: 'headerTabs.js',
            css: null,
            dependencies: ['apiHelper'],
            description: 'Header tab improvements'
        },
        {
            name: 'customMenuLinks',
            script: 'customMenuLinks.js',
            css: null,
            dependencies: ['utils'],
            description: 'Load and add custom menu links from configuration'
        },
        {
            name: 'hamburgerMenu',
            script: 'hamburgerMenu.js',
            css: null,
            dependencies: ['utils'],
            versions: [12],
            description: 'Desktop hamburger button that opens a v12-style left navigation drawer'
        },
        {
            name: 'games',
            script: 'games.js',
            css: null,
            dependencies: ['utils'],
            description: 'Adds a Games sidebar link to the games hub page'
        },
        {
            name: 'backdropLeakFix',
            script: 'backdropLeakFix.js',
            css: null,
            dependencies: [],
            versions: [10, 11],
            description: 'Fixes issue that causes backdrop images to be continuously added to the page if the tab isn\'t focused.'
        },
        {
            name: 'updoot',
            script: 'updoot.js',
            css: null,
            dependencies: [],
            description: 'Upvote functionality provided by https://github.com/BobHasNoSoul/jellyfin-updoot'
        },
        {
            name: 'dashboardButtonFix',
            script: 'dashboardButtonFix.js',
            css: null,
            dependencies: [],
            versions: [10, 11],
            description: 'Fixes the dashboard button to redirect to the home page when the back button is clicked and there is no history to go back to'
        },
        {
            name: 'thumbnailScrubber-configuration',
            script: '../configuration/thumbnailScrubber-configuration.js',
            css: null,
            dependencies: ['modal', 'toaster', 'utils'],
            description: 'Thumbnail scrubber configuration for KefinTweaks'
        },
        {
            name: 'thumbnailScrubber',
            script: 'thumbnailScrubber.js',
            css: null,
            dependencies: ['thumbnailScrubber-configuration', 'apiHelper'],
            description: 'Shows trickplay thumbnail preview when hovering in the bottom 20px of a video card for 2+ seconds'
        },
        {
            name: 'infiniteScroll',
            script: 'infiniteScroll.js',
            css: null,
            dependencies: ['cardBuilder'],
            description: 'Adds infinite scroll functionality to media library pages'
        },
        {
            name: 'removeContinue',
            script: 'removeContinue.js',
            css: null,
            dependencies: ['apiHelper'],
            description: 'Adds remove from continue watching functionality to cards with data-position-ticks'
        },
        {
            name: 'subtitleSearch',
            script: 'subtitleSearch.js',
            css: 'subtitleSearch.css',
            dependencies: ['toaster', 'apiHelper'],
            description: 'Adds subtitle search functionality to the video OSD, allowing users to search and download subtitles from remote sources'
        },
        {
            name: 'breadcrumbs',
            script: 'breadcrumbs.js',
            css: 'breadcrumbNav.css',
            dependencies: ['utils', 'apiHelper'],
            description: 'Adds breadcrumb navigation to item detail pages for Movies, Series, Seasons, Episodes, Music Artists, and Music Albums'
        },
        {
            name: 'playlist',
            script: 'playlist.js',
            css: null,
            dependencies: ['cardBuilder', 'utils', 'modal'],
            description: 'Modifies playlist view page behavior to navigate to item details instead of playing, adds play button to playlist items, and adds sorting functionality'
        },
        {
            name: 'itemDetailsCollections',
            script: 'itemDetailsCollections.js',
            css: null,
            dependencies: ['indexedDBCache', 'utils', 'cardBuilder'],
            versions: [10, 11],
            description: 'Adds related collections to item details pages showing which collections contain the current item'
        },
        {
            name: 'flattenSingleSeasonShows',
            script: 'seriesEpisodes.js',
            css: 'seriesEpisodes.css',
            dependencies: ['cardBuilder', 'utils'],
            description: 'Displays episodes directly on series page with season selection. Works for both single and multi-season shows when enabled.'
        },
        {
            name: 'seriesInfo',
            script: 'seriesInfo.js',
            css: null,
            dependencies: ['utils', 'apiHelper'],
            description: 'Adds series and season information (seasons count, episodes count, end time) to details pages'
        },
        {
            name: 'versionPreferences',
            script: 'versionPreferences.js',
            css: null,
            dependencies: ['utils'],
            description: 'Reorders and sanitizes media source version/edition options on item details pages'
        },
        {
            name: 'collections',
            script: 'collections.js',
            css: null,
            dependencies: ['utils', 'modal'],
            description: 'Adds sorting functionality to collection pages'
        },
        {
            name: 'mediaBadges',
            script: 'mediaBadges.js',
            css: null,
            dependencies: [],
            description: 'Resolution, HDR / Dolby Vision and audio badges on library cards and the item page, from the media streams'
        },
        {
            name: 'requestSeerr',
            script: 'requestSeerr.js',
            css: null,
            dependencies: [],
            description: 'A "Request on Seerr" button on searches that find little and on items without media (missing episodes, collections)'
        },
        {
            name: 'jumpBar',
            script: 'jumpBar.js',
            css: null,
            dependencies: [],
            description: 'An A-Z rail on the Movies, TV and Music grids that jumps to a letter, loading more until it is there'
        },
    ];

    const CONFIG_DEPENDENCY_NAMES = [
        'modal', 'toaster', 'utils', 'homeScreenConfig2', 'ui', 'homeScreen-migration',
        'homeScreen-configuration', 'search-configuration', 'seriesEpisodes-configuration',
        'seriesInfo-configuration', 'versionPreferences-configuration', 'skinManager-configuration',
        'customMenuLinks-configuration', 'thumbnailScrubber-configuration',
        'watchTogether-configuration', 'watchlist-configuration', 'userManager-configuration', 'extras-configuration', 'apiHelper',
        'sectionHelper'
    ];

    const CONFIGURATION_FILES = { script: 'configuration.js', css: 'configuration.css' };
    // jf12 fork: the configuration UI (configuration.js and its ~1.6 MB of dependencies, mostly the home screen editors) is not part of
    // the page-load plan any more. This small launcher registers the admin entry points and loads the UI the first time it is opened.
    const CONFIGURATION_LAUNCHER = { script: 'configurationLauncher.js', name: 'configurationLauncher' };

    function parseMajorVersion(version) {
        if (!version || typeof version !== 'string') return null;
        const versionParts = version.split('.');
        if (versionParts[0] !== '10') {
            const majorVersion = parseInt(versionParts[0], 10);
            return Number.isNaN(majorVersion) ? null : majorVersion;
        }
        if (versionParts.length >= 2) {
            const majorVersion = parseInt(versionParts[1], 10);
            if (!Number.isNaN(majorVersion)) return majorVersion;
        }
        return null;
    }

    function isScriptCompatible(scriptDef, majorVersion) {
        if (!scriptDef || !scriptDef.versions || !scriptDef.versions.length) return true;
        if (majorVersion == null) return false;
        return scriptDef.versions.includes(majorVersion);
    }

    function definitionsByName() {
        const map = new Map();
        SCRIPT_DEFINITIONS.forEach((d) => map.set(d.name, d));
        return map;
    }

    function mergeEnabledScripts(config) {
        const enabled = Object.assign({}, DEFAULT_ENABLED_SCRIPTS, (config && config.scripts) || {});
        let iterations = 0;
        while (iterations < 10) {
            let changed = false;
            SCRIPT_DEFINITIONS.forEach((script) => {
                if (!enabled[script.name]) return;
                if (script.adminOnly) return; // its dependencies are loaded on demand with it, not for everybody
                (script.dependencies || []).forEach((dep) => {
                    if (!enabled[dep]) {
                        enabled[dep] = true;
                        changed = true;
                    }
                });
            });
            if (!changed) break;
            iterations++;
        }
        return enabled;
    }

    function collectAllDependencies(scriptDef, enabled, byName, collected, visited) {
        collected = collected || new Set();
        visited = visited || new Set();
        if (visited.has(scriptDef.name)) return collected;
        visited.add(scriptDef.name);
        for (const depName of scriptDef.dependencies || []) {
            if (!enabled[depName]) continue;
            const depScript = byName.get(depName);
            if (!depScript) continue;
            if (!collected.has(depScript.name)) {
                collected.add(depScript.name);
                collectAllDependencies(depScript, enabled, byName, collected, visited);
            }
        }
        return collected;
    }

    function topoSortScriptNames(names, byName) {
        const nameSet = new Set(names);
        const indegree = new Map();
        const edges = new Map();
        names.forEach((n) => {
            indegree.set(n, 0);
            edges.set(n, []);
        });
        names.forEach((n) => {
            const def = byName.get(n);
            (def && def.dependencies || []).forEach((dep) => {
                if (!nameSet.has(dep)) return;
                edges.get(dep).push(n);
                indegree.set(n, (indegree.get(n) || 0) + 1);
            });
        });
        const orderIndex = new Map(names.map((n, i) => [n, i]));
        const queue = names.filter((n) => (indegree.get(n) || 0) === 0);
        queue.sort((a, b) => orderIndex.get(a) - orderIndex.get(b));
        const result = [];
        while (queue.length) {
            const n = queue.shift();
            result.push(n);
            const nexts = edges.get(n) || [];
            nexts.sort((a, b) => orderIndex.get(a) - orderIndex.get(b));
            nexts.forEach((m) => {
                indegree.set(m, indegree.get(m) - 1);
                if (indegree.get(m) === 0) queue.push(m);
            });
            queue.sort((a, b) => orderIndex.get(a) - orderIndex.get(b));
        }
        if (result.length !== names.length) {
            WARN('Topo sort incomplete; appending remaining names');
            names.forEach((n) => { if (!result.includes(n)) result.push(n); });
        }
        return result;
    }

    function normalizeRoot(root) {
        if (!root || typeof root !== 'string') return '';
        return root.endsWith('/') ? root : root + '/';
    }

    /**
     * jf12 fork: the configured kefinTweaksRoot is the only source of truth. kefinTweaksRootResolved (written by
     * upstream's auto-update) is ignored, so a stale value can never redirect the load to another host or version.
     */
    function getResolvedKefinRoot(config) {
        const cfg = config || {};
        return normalizeRoot(cfg.kefinTweaksRoot || '');
    }

    /**
     * A root that can change under you: a jsDelivr GitHub URL on a branch (or without a ref), a raw.githubusercontent
     * branch URL, or GitHub Pages. A 40-hex commit SHA (or a vX.Y.Z tag) counts as pinned; a self-hosted folder is the
     * owner's own copy. Nothing is resolved over the network: an unpinned root only earns a console warning.
     * @returns {string|null} why the root is unpinned, or null when it is pinned / self-hosted
     */
    function describeUnpinnedRoot(root) {
        const r = String(root || '').trim();
        const jsd = r.match(/^https?:\/\/(?:cdn|fastly|gcore)\.jsdelivr\.net\/gh\/[^/]+\/[^/@]+(?:@([^/]+))?(?:\/|$)/i);
        if (jsd) {
            const ref = jsd[1] || '';
            if (/^[0-9a-f]{40}$/i.test(ref) || /^v?\d+\.\d+\.\d+[\w.-]*$/.test(ref)) return null;
            return ref ? `jsDelivr ref "@${ref}" is a branch, not a commit SHA` : 'jsDelivr URL without an @commit ref';
        }
        const raw = r.match(/^https?:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/(?:refs\/heads\/)?([^/]+)\//i);
        if (raw) return /^[0-9a-f]{40}$/i.test(raw[1]) ? null : `raw.githubusercontent.com branch "${raw[1]}"`;
        if (/^https?:\/\/[^/]+\.github\.io\//i.test(r)) return 'GitHub Pages always serves the latest commit';
        return null;
    }

    function resolveAssetUrl(root, relativePath) {
        if (!relativePath) return null;
        if (/^https?:\/\//i.test(relativePath)) return relativePath;

        const normalizedRoot = normalizeRoot(root);
        const base = normalizedRoot + 'scripts/';
        const joined = (base + relativePath).replace(/\\/g, '/');

        // Absolute http(s) root — use URL so .. segments resolve correctly
        if (/^https?:\/\//i.test(normalizedRoot)) {
            try {
                return new URL(relativePath, base).href;
            } catch (e) {
                /* fall through */
            }
        }

        // Site-absolute or relative path — collapse . / .. while preserving a leading "/"
        const isSiteAbsolute = joined.charAt(0) === '/';
        const parts = joined.split('/');
        const stack = [];
        for (const p of parts) {
            if (!p || p === '.') continue;
            if (p === '..') {
                stack.pop();
                continue;
            }
            stack.push(p);
        }
        const resolved = stack.join('/');
        return isSiteAbsolute ? '/' + resolved : resolved;
    }

    function expandScriptToAssets(scriptDef, root, urlSuffix, thirdParty) {
        const assets = [];
        const suffix = urlSuffix || '';
        const pushRel = (kind, relativePath, name) => {
            if (!relativePath) return;
            if (/^https?:\/\//i.test(relativePath)) {
                assets.push({ kind: kind, url: relativePath, name: name });
                return;
            }
            const url = resolveAssetUrl(root, relativePath);
            if (!url) return;
            assets.push({
                kind: kind,
                url: url + suffix,
                path: relativePath,
                name: name
            });
        };
        for (const tpName of scriptDef.thirdParty || []) {
            const tp = thirdParty[tpName];
            if (!tp) continue;
            (tp.css || []).forEach((css) => pushRel('css', css, tpName));
            (tp.js || []).forEach((js) => pushRel('js', js, tpName));
        }
        if (scriptDef.css) pushRel('css', scriptDef.css, scriptDef.name);
        if (scriptDef.script) pushRel('js', scriptDef.script, scriptDef.name);
        return assets;
    }

    function buildOrderedScriptList(enabled, majorVersion, byName) {
        const enabledScripts = SCRIPT_DEFINITIONS.filter(
            (s) => enabled[s.name] && isScriptCompatible(s, majorVersion) && !s.adminOnly
        );
        const allDependencyNames = new Set();
        enabledScripts.forEach((script) => {
            collectAllDependencies(script, enabled, byName).forEach((d) => allDependencyNames.add(d));
        });
        const dependencyNames = topoSortScriptNames(
            SCRIPT_DEFINITIONS.map((s) => s.name).filter((n) => allDependencyNames.has(n) && enabled[n]),
            byName
        );
        const nonDeps = enabledScripts.filter((s) => !allDependencyNames.has(s.name));
        const priority = nonDeps.filter((s) => s.priority === true).map((s) => s.name);
        const regular = nonDeps.filter((s) => !s.priority).map((s) => s.name);
        return dependencyNames.concat(priority, regular);
    }

    function buildConfigScriptList(enabled, majorVersion, byName) {
        const names = CONFIG_DEPENDENCY_NAMES.filter((n) => {
            const def = byName.get(n);
            if (!def) return false;
            return isScriptCompatible(def, majorVersion);
        });
        let changed = true;
        while (changed) {
            changed = false;
            names.slice().forEach((n) => {
                const def = byName.get(n);
                (def && def.dependencies || []).forEach((dep) => {
                    if (!names.includes(dep) && byName.has(dep) && isScriptCompatible(byName.get(dep), majorVersion)) {
                        names.push(dep);
                        changed = true;
                    }
                });
            });
        }
        return topoSortScriptNames(names, byName);
    }

    function buildLoadPlan(config, majorVersion, options) {
        options = options || {};
        const root = normalizeRoot(
            options.root
            || getResolvedKefinRoot(config)
            || ''
        );
        if (!root) throw new Error('kefinTweaksRoot is required to build load plan');
        const urlSuffix = options.urlSuffix || '';
        const byName = definitionsByName();
        const enabled = mergeEnabledScripts(config);
        const featuresDisabled = (config && config.enabled === false) || options.configOnly === true;

        let scriptNames;
        if (featuresDisabled) {
            // jf12 fork: features off = utils + the configuration launcher (so an admin can switch KefinTweaks back on)
            scriptNames = ['utils'];
        } else {
            scriptNames = buildOrderedScriptList(enabled, majorVersion, byName);
            if (!scriptNames.includes('utils')) scriptNames.unshift('utils');
        }

        const assets = [];
        const seen = new Set();
        const pushAssets = (list) => {
            list.forEach((a) => {
                const key = a.kind + '|' + (a.url || a.path || '');
                if (seen.has(key)) return;
                seen.add(key);
                assets.push(a);
            });
        };

        scriptNames.forEach((name) => {
            const def = byName.get(name);
            if (!def) return;
            pushAssets(expandScriptToAssets(def, root, urlSuffix, THIRD_PARTY_SCRIPTS));
        });

        pushAssets([
            {
                kind: 'js',
                url: resolveAssetUrl(root, CONFIGURATION_LAUNCHER.script) + urlSuffix,
                path: CONFIGURATION_LAUNCHER.script,
                name: CONFIGURATION_LAUNCHER.name
            }
        ]);

        const stamp = [
            root,
            String(majorVersion == null ? 'unknown' : majorVersion),
            featuresDisabled ? 'config-only' : 'full',
            scriptNames.join(',')
        ].join('|');

        return {
            assets,
            stamp,
            scriptNames,
            definitions: SCRIPT_DEFINITIONS,
            root,
            majorVersion
        };
    }

    // ---- jf12 fork: on-demand loading (configuration UI, watchlist statistics) ----
    // Injects one asset; resolves true when it has loaded (or was already on the page), false on error.
    function injectAssetOnDemand(a) {
        return new Promise((resolve) => {
            if (!a || !a.url) return resolve(false);
            if (a.kind === 'css') {
                if (document.querySelector('link[href="' + a.url + '"]')) return resolve(true);
                const l = document.createElement('link');
                l.rel = 'stylesheet';
                l.type = 'text/css';
                l.href = a.url;
                l.onload = () => resolve(true);
                l.onerror = () => resolve(false);
                document.head.appendChild(l);
                return;
            }
            const existing = document.querySelector('script[src="' + a.url + '"]');
            if (existing) {
                if (existing.dataset.kefinPending !== 'true') return resolve(true);
                existing.addEventListener('load', () => resolve(true), { once: true });
                existing.addEventListener('error', () => resolve(false), { once: true });
                return;
            }
            const s = document.createElement('script');
            s.src = a.url;
            s.async = false;            // on-demand scripts still run in dependency order
            s.dataset.kefinPending = 'true';
            s.onload = () => { delete s.dataset.kefinPending; resolve(true); };
            s.onerror = () => { delete s.dataset.kefinPending; resolve(false); };
            document.head.appendChild(s);
        });
    }

    function assetsForNames(names, root, byName) {
        const assets = [];
        const seen = new Set();
        names.forEach((name) => {
            const def = byName.get(name);
            if (!def) return;
            expandScriptToAssets(def, root, '', THIRD_PARTY_SCRIPTS).forEach((a) => {
                const key = a.kind + '|' + a.url;
                if (seen.has(key)) return;
                seen.add(key);
                assets.push(a);
            });
        });
        return assets;
    }

    /**
     * Load scripts by definition name (with their dependencies and third-party files) from the configured root, on demand.
     * @param {string[]} names
     * @returns {Promise<boolean>} true when every file loaded
     */
    async function loadScriptsOnDemand(names, config) {
        const cfg = config || window.KefinTweaksConfig || {};
        const root = getResolvedKefinRoot(cfg);
        if (!root) return false;
        const byName = definitionsByName();
        const all = new Set();
        const visit = (n) => {
            const def = byName.get(n);
            if (!def || all.has(n)) return;
            (def.dependencies || []).forEach(visit);
            all.add(n);
        };
        (names || []).forEach(visit);
        const ordered = topoSortScriptNames(SCRIPT_DEFINITIONS.map((s) => s.name).filter((n) => all.has(n)), byName);
        const results = await Promise.all(assetsForNames(ordered, root, byName).map(injectAssetOnDemand));
        return results.every(Boolean);
    }

    /**
     * jf12 fork: names of the enabled features that only administrators ever use (User Manager hooks the Dashboard). The page-load plan
     * leaves them out, so a regular user never downloads them; configurationLauncher.js loads them for administrators.
     * @returns {string[]}
     */
    function getAdminOnlyScriptNames(config, majorVersion) {
        const enabled = mergeEnabledScripts(config || window.KefinTweaksConfig || {});
        if ((config || window.KefinTweaksConfig || {}).enabled === false) return [];
        return SCRIPT_DEFINITIONS.filter((s) => s.adminOnly && enabled[s.name] && isScriptCompatible(s, majorVersion)).map((s) => s.name);
    }

    /**
     * Load the configuration UI (configuration.js + configuration.css and every configuration dependency) on demand.
     * @returns {Promise<boolean>}
     */
    async function loadConfigurationUi(config) {
        const cfg = config || window.KefinTweaksConfig || {};
        const root = getResolvedKefinRoot(cfg);
        if (!root) return false;
        let major = window.KefinTweaks && window.KefinTweaks._jellyfinMajorVersion;
        if (major == null && window.KefinTweaks && typeof window.KefinTweaks.getJellyfinMajorVersion === 'function') {
            try { major = await window.KefinTweaks.getJellyfinMajorVersion(); } catch (e) { major = null; }
        }
        const byName = definitionsByName();
        const names = buildConfigScriptList(mergeEnabledScripts(cfg), major, byName);
        const assets = assetsForNames(names, root, byName).concat([
            { kind: 'css', url: resolveAssetUrl(root, CONFIGURATION_FILES.css), name: 'configuration' },
            { kind: 'js', url: resolveAssetUrl(root, CONFIGURATION_FILES.script), name: 'configuration' }
        ]);
        const results = await Promise.all(assets.map(injectAssetOnDemand));
        return results.every(Boolean);
    }

    function ensureKefinTweaksApi(definitions) {
        const defs = definitions || SCRIPT_DEFINITIONS;
        const existing = window.KefinTweaks || {};
        window.KefinTweaks = {
            _jellyfinMajorVersion: existing._jellyfinMajorVersion != null ? existing._jellyfinMajorVersion : null,
            parseMajorVersion: parseMajorVersion,
            getJellyfinMajorVersion: async function getJellyfinMajorVersion() {
                try {
                    if (window.KefinTweaks._jellyfinMajorVersion != null) {
                        return window.KefinTweaks._jellyfinMajorVersion;
                    }
                    if (!window.ApiClient || (!window.ApiClient._appVersion && !window.ApiClient._serverVersion)) {
                        const startTime = Date.now();
                        while (Date.now() - startTime < 5000) {
                            if (window.ApiClient && (window.ApiClient._appVersion || window.ApiClient._serverVersion)) break;
                            await new Promise((r) => setTimeout(r, 200));
                        }
                    }
                    if (!window.ApiClient) return null;
                    if (window.ApiClient._appName === 'Jellyfin Web' && window.ApiClient._appVersion) {
                        window.KefinTweaks._jellyfinMajorVersion = parseMajorVersion(window.ApiClient._appVersion);
                        return window.KefinTweaks._jellyfinMajorVersion;
                    }
                    if (!window.ApiClient._serverVersion) {
                        const startTime = Date.now();
                        while (Date.now() - startTime < 10000) {
                            if (window.ApiClient._serverVersion) break;
                            await new Promise((r) => setTimeout(r, 500));
                        }
                    }
                    window.KefinTweaks._jellyfinMajorVersion = parseMajorVersion(window.ApiClient._serverVersion);
                    return window.KefinTweaks._jellyfinMajorVersion;
                } catch (e) {
                    WARN('getJellyfinMajorVersion failed:', e);
                    return null;
                }
            },
            getScripts: function () { return defs.slice(); }
        };
        return window.KefinTweaks;
    }

    function applyAssetsToDocument(assets) {
        (assets || []).forEach((a) => {
            if (!a || !a.url) return;
            if (a.kind === 'css') {
                if (document.querySelector('link[href="' + a.url + '"]')) return;
                const l = document.createElement('link');
                l.rel = 'stylesheet';
                l.type = 'text/css';
                l.href = a.url;
                document.head.appendChild(l);
            } else {
                if (document.querySelector('script[src="' + a.url + '"]')) return;
                const s = document.createElement('script');
                s.src = a.url;
                s.async = false;
                document.head.appendChild(s);
            }
        });
    }

    function extractInjectorStamp(scriptText) {
        if (typeof scriptText === 'string' && scriptText) {
            const marker = scriptText.match(/\/\/\s*kefinTweaksInjectorStamp=(.+)/);
            if (marker && marker[1]) {
                return String(marker[1]).trim();
            }
            const winAssign = scriptText.match(/window\.KefinTweaksInjectorStamp\s*=\s*("(?:\\.|[^"\\])*")/);
            if (winAssign && winAssign[1]) {
                try {
                    return JSON.parse(winAssign[1]);
                } catch (e) { /* ignore */ }
            }
            const eventStamp = scriptText.match(/stamp:\s*("(?:\\.|[^"\\])*")/);
            if (eventStamp && eventStamp[1]) {
                try {
                    return JSON.parse(eventStamp[1]);
                } catch (e) { /* ignore */ }
            }
        }
        if (typeof window !== 'undefined' && window.KefinTweaksInjectorStamp != null) {
            return String(window.KefinTweaksInjectorStamp);
        }
        return null;
    }

    function isExperimentalKefinRoot(root) {
        return /@experimental(\/|$)/i.test(String(root || ''));
    }

    /** @deprecated jf12 fork: kept for API compatibility; true for any jsDelivr GitHub root. */
    function isOfficialJsDelivrKefinRoot(root) {
        return /cdn\.jsdelivr\.net\/gh\//i.test(String(root || ''));
    }

    /** jf12 fork: the injector entry always loads from the configured root. */
    function allowsKefinInjectorPreload(root) {
        return !!String(root || '').trim();
    }

    // The KefinTweaks-injector JavaScript Injector entry (jf12 fork). It is written by hand once (docs/JF12-FORK.md,
    // docs/jf12/injector-entry.js holds the same text) and never rewritten on page load. It carries no file list and
    // no version: it reads kefinTweaksRoot from the KefinTweaks-Config entry and loads <root>injector.js once, so the
    // root is the one place that says where the files come from and which commit they are.
    const INJECTOR_BOOTSTRAP_LINES = [
        '// KefinTweaks-injector (KefinTweaks jf12 fork): hand-written JavaScript Injector entry, never rewritten automatically.',
        '// kefinTweaksInjectorStamp=jf12-bootstrap-1',
        '// Loads <kefinTweaksRoot>injector.js once. kefinTweaksRoot (KefinTweaks-Config entry, which must come first) is the only',
        '// place that says where the files come from and which version: a commit-pinned URL or a self-hosted folder.',
        '(function () {',
        '  if (window.KefinTweaksBootstrapRoot) return;',
        '  var cfg = window.KefinTweaksConfig || {};',
        "  var root = String(cfg.kefinTweaksRoot || '').trim();",
        "  if (!root) { console.warn('[KefinTweaks] kefinTweaksRoot is empty in the KefinTweaks-Config entry: nothing loaded'); return; }",
        "  if (root.charAt(root.length - 1) !== '/') root += '/';",
        '  window.KefinTweaksBootstrapRoot = root;',
        "  var s = document.createElement('script');",
        "  s.src = root + 'injector.js';",
        '  s.async = true;',
        '  (document.head || document.documentElement).appendChild(s);',
        '})();'
    ];

    /**
     * Source of the KefinTweaks-injector entry. jf12 fork: the fixed bootstrap above, whatever the plan
     * (the parameter is accepted for API compatibility with callers that pass a load plan).
     */
    function buildInjectorScript(loadPlan) { // eslint-disable-line no-unused-vars
        return INJECTOR_BOOTSTRAP_LINES.join('\n');
    }

    function upsertInjectorEntries(customJavaScripts, opts) {
        opts = opts || {};
        const list = Array.isArray(customJavaScripts) ? customJavaScripts.slice() : [];
        const upsert = (name, scriptContent) => {
            const idx = list.findIndex((s) => s.Name === name);
            const entry = {
                Name: name,
                Script: scriptContent,
                Enabled: true,
                RequiresAuthentication: false
            };
            if (idx !== -1) list[idx] = Object.assign({}, list[idx], entry);
            else list.push(entry);
        };
        if (opts.configScriptContent != null) upsert(KEFIN_CONFIG_ENTRY_NAME, opts.configScriptContent);
        if (opts.injectorScriptContent != null) upsert(KEFIN_INJECTOR_ENTRY_NAME, opts.injectorScriptContent);

        const configIdx = list.findIndex((s) => s.Name === KEFIN_CONFIG_ENTRY_NAME);
        const injIdx = list.findIndex((s) => s.Name === KEFIN_INJECTOR_ENTRY_NAME);
        if (configIdx !== -1 && injIdx !== -1 && configIdx > injIdx) {
            const cfg = list.splice(configIdx, 1)[0];
            const newInjIdx = list.findIndex((s) => s.Name === KEFIN_INJECTOR_ENTRY_NAME);
            list.splice(newInjIdx, 0, cfg);
        }
        return list;
    }

    function hasEnabledInjectorEntry(customJavaScripts) {
        const list = Array.isArray(customJavaScripts) ? customJavaScripts : [];
        const entry = list.find((s) => s.Name === KEFIN_INJECTOR_ENTRY_NAME);
        return !!(entry && entry.Enabled !== false);
    }

    function getInjectorAuthHeader() {
        const token = window.ApiClient && typeof window.ApiClient.accessToken === 'function'
            ? window.ApiClient.accessToken()
            : '';
        if (!token) return null;
        const client = typeof window.ApiClient.applicationName === 'function'
            ? window.ApiClient.applicationName()
            : 'Jellyfin Web';
        const device = typeof window.ApiClient.deviceName === 'function'
            ? window.ApiClient.deviceName()
            : 'Browser';
        const deviceId = typeof window.ApiClient.deviceId === 'function'
            ? window.ApiClient.deviceId()
            : '';
        const version = window.ApiClient._appVersion || window.ApiClient._serverVersion || '';
        return 'MediaBrowser Client="' + encodeURIComponent(client)
            + '", Device="' + encodeURIComponent(device)
            + '", DeviceId="' + encodeURIComponent(deviceId)
            + '", Version="' + encodeURIComponent(version)
            + '", Token="' + encodeURIComponent(token) + '"';
    }

    function isLoggedInForInjectorSync() {
        try {
            return !!(window.ApiClient
                && window.ApiClient._loggedIn
                && typeof window.ApiClient.accessToken === 'function'
                && window.ApiClient.accessToken()
                && window.ApiClient._serverAddress);
        } catch (e) {
            return false;
        }
    }

    async function isAdminForInjectorSync() {
        try {
            if (!window.ApiClient || typeof window.ApiClient.getCurrentUser !== 'function') return false;
            const user = await window.ApiClient.getCurrentUser();
            return !!(user && user.Policy && user.Policy.IsAdministrator === true);
        } catch (e) {
            return false;
        }
    }

    async function findJavaScriptInjectorPluginId() {
        const server = window.ApiClient && window.ApiClient._serverAddress;
        const auth = getInjectorAuthHeader();
        if (!server || !auth) return null;
        const response = await fetch(server + '/Plugins', {
            headers: { Authorization: auth }
        });
        if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        const plugins = await response.json();
        const list = Array.isArray(plugins) ? plugins : (plugins.Items || []);
        const plugin = list.find((p) => p.Name === 'JavaScript Injector' || p.Name === 'JS Injector');
        return plugin ? plugin.Id : null;
    }

    /**
     * jf12 fork: disabled. Upstream rewrote the KefinTweaks-injector entry on the server from every admin page load
     * whenever the load plan changed; here the entry is a fixed bootstrap and page loads never write to the server.
     * @returns {Promise<{ synced: boolean, reason: string }>}
     */
    async function syncKefinTweaksInjector(loadPlan) { // eslint-disable-line no-unused-vars
        return { synced: false, reason: 'disabled in the jf12 fork (the injector entry is hand-written)' };
    }

    window.KefinTweaksLoader = {
        KEFIN_INJECTOR_ENTRY_NAME: KEFIN_INJECTOR_ENTRY_NAME,
        KEFIN_CONFIG_ENTRY_NAME: KEFIN_CONFIG_ENTRY_NAME,
        UPSTREAM: UPSTREAM,
        describeUnpinnedRoot: describeUnpinnedRoot,
        SCRIPT_DEFINITIONS: SCRIPT_DEFINITIONS,
        DEFAULT_ENABLED_SCRIPTS: DEFAULT_ENABLED_SCRIPTS,
        THIRD_PARTY_SCRIPTS: THIRD_PARTY_SCRIPTS,
        CONFIG_DEPENDENCY_NAMES: CONFIG_DEPENDENCY_NAMES,
        VERSION: VERSION,
        parseMajorVersion: parseMajorVersion,
        isScriptCompatible: isScriptCompatible,
        mergeEnabledScripts: mergeEnabledScripts,
        normalizeRoot: normalizeRoot,
        getResolvedKefinRoot: getResolvedKefinRoot,
        resolveAssetUrl: resolveAssetUrl,
        buildLoadPlan: buildLoadPlan,
        buildInjectorScript: buildInjectorScript,
        isExperimentalKefinRoot: isExperimentalKefinRoot,
        isOfficialJsDelivrKefinRoot: isOfficialJsDelivrKefinRoot,
        allowsKefinInjectorPreload: allowsKefinInjectorPreload,
        extractInjectorStamp: extractInjectorStamp,
        syncKefinTweaksInjector: syncKefinTweaksInjector,
        ensureKefinTweaksApi: ensureKefinTweaksApi,
        applyAssetsToDocument: applyAssetsToDocument,
        loadScriptsOnDemand: loadScriptsOnDemand,
        getAdminOnlyScriptNames: getAdminOnlyScriptNames,
        loadConfigurationUi: loadConfigurationUi,
        upsertInjectorEntries: upsertInjectorEntries,
        hasEnabledInjectorEntry: hasEnabledInjectorEntry
    };

    LOG('Module loaded (' + SCRIPT_DEFINITIONS.length + ' script definitions)');
})();
