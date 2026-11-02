// KefinTweaks Breadcrumbs
// Adds breadcrumb navigation to item detail pages
// Supports: Movie, Series, Season, Episode, MusicArtist, MusicAlbum, Audio
// Requires: utils.js module to be loaded before this script

(function() {
    'use strict';
    
    console.log('[KefinTweaks Breadcrumbs] Initializing...');
    
    // Configuration
    const CONFIG = {
        supportedTypes: ['Movie', 'Series', 'Season', 'Episode', 'MusicArtist', 'MusicAlbum', 'Audio'],
        minWidth: 768, // Only show on screens wider than 768px
    };
    
    // State management
    let currentBreadcrumbs = null;
    let breadcrumbContainer = null;
    let activePopover = null;
    let currentItemId = null;

    // jf12 fork: one navigation makes several handlePageChange() calls (the History bridge, Emby's onViewShow and hashchange each call the handler),
    // and they used to edit the same breadcrumb elements at the same time: between two awaits the second call found an element the first one had
    // already replaced ("Cannot read properties of null (reading 'replaceChild')") and the page lost its breadcrumbs. Now the calls run one after the
    // other (runChain) and a call that a newer navigation has overtaken (runSeq) stops at its next checkpoint without touching the DOM.
    let runSeq = 0;
    let runChain = Promise.resolve();
    
    // Track parent IDs to avoid unnecessary API calls
    let lastSeasonsParentId = null;
    let lastAlbumsParentId = null;
    let lastSongsParentId = null;
    let cachedSeasonsData = null;
    let cachedAlbumsData = null;
    let cachedSongsData = null;
    
    // Smart API call functions that check parent ID
    async function getSeasonsIfNeeded(parentId) {
        if (lastSeasonsParentId === parentId && cachedSeasonsData) {
            log('Using existing seasons data for parent:', parentId);
            return cachedSeasonsData;
        }
        
        log('Fetching seasons for parent:', parentId);
        const seasons = await getSeasons(parentId);
        lastSeasonsParentId = parentId;
        cachedSeasonsData = seasons;
        return seasons;
    }
    
    async function getAlbumsIfNeeded(parentId) {
        if (lastAlbumsParentId === parentId && cachedAlbumsData) {
            log('Using existing albums data for parent:', parentId);
            return cachedAlbumsData;
        }
        
        log('Fetching albums for parent:', parentId);
        const albums = await getAlbums(parentId);
        lastAlbumsParentId = parentId;
        cachedAlbumsData = albums;
        return albums;
    }
    
    async function getSongsIfNeeded(parentId) {
        if (lastSongsParentId === parentId && cachedSongsData) {
            log('Using existing songs data for parent:', parentId);
            return cachedSongsData;
        }
        
        log('Fetching songs for parent:', parentId);
        const songs = await getSongs(parentId);
        lastSongsParentId = parentId;
        cachedSongsData = songs;
        return songs;
    }
    
    // Simplified breadcrumb structure definition
    async function getTargetBreadcrumbStructure(item) {
        const structure = {
            elements: [],
            item: item
        };

        // Don't append .html for server versions 10.11 and above (jf12 fork: "12.1.0".split('.')[1] is "1", so 12.x got the .html routes)
        const urlSuffix = usesHtmlRoutes() ? '.html' : '';

        let queryParams = '';
        if (item.ParentId) {
            // Get the top parent item from the ancestors with a Type = CollectionFolder
            // Use apiHelper.getQuery rather than getAncestorItems so we can use the cached data
            // (jf12 fork: a failed or unexpected answer only costs the library id in the links, never the breadcrumbs)
            let ancestors = [];
            try {
                const ancestorsUrl = `${ApiClient.serverAddress()}/Items/${item.Id}/Ancestors`;
                const queryResult = await window.apiHelper.getQuery(ancestorsUrl, { useCache: true });
                ancestors = queryResult.data;

                if (!ancestors || !Array.isArray(ancestors)) {
                    ancestors = await queryResult.dataPromise;
                }
            } catch (err) {
                log('Ancestors not available:', err && err.message);
            }
            if (!Array.isArray(ancestors)) ancestors = [];

            const collectionFolder = ancestors.find(ancestor => ancestor.Type === 'CollectionFolder');
            const userRootFolder = ancestors.find(ancestor => ancestor.Type === 'UserRootFolder');
            if (collectionFolder) {
                queryParams = `?topParentId=${collectionFolder.Id}&serverId=${ApiClient.serverId()}`;
            } else if (userRootFolder) {
                queryParams = `?topParentId=${userRootFolder.Id}&serverId=${ApiClient.serverId()}`;
            } else {
                queryParams = `?serverId=${ApiClient.serverId()}`;
            }
        }
        else if (ApiClient.serverId()) {
            queryParams = `?serverId=${ApiClient.serverId()}`;
        }
        
        // jf12 fork: same-page hash links (the old absolute ${ApiClient._serverAddress}/web/#/details URLs made the browser load the page again when the
        // app was opened as /web/index.html or under a base path) and no link at all for an id the item does not have
        const libraryLink = (route) => `#/${route}${urlSuffix}${queryParams}${queryParams ? '&' : '?'}tab=0`;
        const detailsLink = detailsHref;

        if (item.Type === 'Movie') {
            structure.elements = [
                { text: 'Movies', url: libraryLink('movies'), clickable: true },
                { text: item.Name, url: null, clickable: false }
            ];
        } else if (item.Type === 'Series') {
            structure.elements = [
                { text: 'Shows', url: libraryLink('tv'), clickable: true },
                { text: item.Name, url: null, clickable: false },
                { text: 'All Seasons', url: null, clickable: true, popover: true }
            ];
        } else if (item.Type === 'Season') {
            // Get series details for the series name
            const seriesDetails = await getItemDetails(item.ParentId);
            const seriesName = seriesDetails ? seriesDetails.Name : 'Unknown Series';
            
            structure.elements = [
                { text: 'Shows', url: libraryLink('tv'), clickable: true },
                { text: seriesName, url: detailsLink(item.ParentId), clickable: !!item.ParentId },
                { text: item.Name || `Season ${item.IndexNumber}`, url: null, clickable: true, popover: true }
            ];
        } else if (item.Type === 'Episode') {
            // Get series details for the series name
            const seriesDetails = await getItemDetails(item.SeriesId);
            const seriesName = seriesDetails ? seriesDetails.Name : (item.SeriesName || 'Unknown Series');
            
            // Get season details for the season name (jf12 fork: an episode that sits straight under its series has no season to show)
            const hasSeason = !!item.ParentId && item.ParentId !== item.SeriesId;
            const seasonDetails = hasSeason ? await getItemDetails(item.ParentId) : null;
            const seasonName = seasonDetails ? (seasonDetails.Name || `Season ${seasonDetails.IndexNumber}`) : (item.SeasonName || `Season ${item.ParentIndexNumber}`);
            
            structure.elements = [
                { text: 'Shows', url: libraryLink('tv'), clickable: true },
                { text: seriesName, url: detailsLink(item.SeriesId), clickable: !!item.SeriesId },
                ...(hasSeason ? [{ text: seasonName, url: null, clickable: true, popover: true }] : []),
                { text: episodeLabel(item), url: null, clickable: false }
            ];
        } else if (item.Type === 'MusicArtist') {
            structure.elements = [
                { text: 'Music', url: libraryLink('music'), clickable: true },
                { text: item.Name, url: null, clickable: false },
                { text: 'All Albums', url: null, clickable: true, popover: true }
            ];
        } else if (item.Type === 'MusicAlbum') {
            // the album's ParentId is the artist's folder on disk: the artist page is AlbumArtists[0] (Jellyfin lists them on the item)
            const artistId = (Array.isArray(item.AlbumArtists) && item.AlbumArtists[0] && item.AlbumArtists[0].Id) || item.ParentId;
            structure.elements = [
                { text: 'Music', url: libraryLink('music'), clickable: true },
                { text: item.AlbumArtist || 'Unknown Artist', url: detailsLink(artistId), clickable: !!artistId },
                { text: item.Name, url: null, clickable: true, popover: true },
                { text: 'All Songs', url: null, clickable: true, popover: true }
            ];
        } else if (item.Type === 'Audio') {
            // Get album details for the album name and artist info
            const albumDetails = await getItemDetails(item.ParentId);
            const albumName = albumDetails ? albumDetails.Name : (item.Album || 'Unknown Album');
            const artistName = albumDetails ? albumDetails.AlbumArtist : (item.AlbumArtist || 'Unknown Artist');
            const artistId = albumDetails ? ((Array.isArray(albumDetails.AlbumArtists) && albumDetails.AlbumArtists[0] && albumDetails.AlbumArtists[0].Id) || albumDetails.ParentId) : null;
            
            structure.elements = [
                { text: 'Music', url: libraryLink('music'), clickable: true },
                { text: artistName || 'Unknown Artist', url: detailsLink(artistId), clickable: !!artistId },
                { text: albumName, url: null, clickable: true, popover: true },
                { text: item.Name, url: null, clickable: false }
            ];
        }
        
        return structure;
    }
    
    // Compare existing breadcrumbs with target structure
    function compareBreadcrumbStructures(existing, target) {
        const differences = [];
        
        // Check if we have the right number of elements
        const existingElements = Array.from(breadcrumbContainer.children).filter(child => 
            child.classList.contains('kefinTweaks-breadcrumb-element')
        );
        
        log('Comparing breadcrumbs - existing:', existingElements.length, 'target:', target.elements.length);
        
        // Compare each element
        for (let i = 0; i < Math.max(existingElements.length, target.elements.length); i++) {
            const existingElement = existingElements[i];
            const targetElement = target.elements[i];
            
            if (!existingElement && targetElement) {
                // Need to add new element
                differences.push({ action: 'add', index: i, element: targetElement });
            } else if (existingElement && !targetElement) {
                // Need to remove element
                differences.push({ action: 'remove', index: i });
            } else if (existingElement && targetElement) {
                // Compare existing vs target
                const existingText = existingElement.textContent;
                const existingClickable = existingElement.style.cursor === 'pointer';
                const targetClickable = targetElement.clickable;
                
                // Check if popover functionality needs to be updated
                const needsPopoverUpdate = targetElement.popover && (
                    existingText !== targetElement.text || 
                    existingClickable !== targetClickable ||
                    // Force update for "All Seasons", "All Albums", and "All Songs" elements since the underlying data changes
                    targetElement.text === 'All Seasons' ||
                    targetElement.text === 'All Albums' ||
                    targetElement.text === 'All Songs'
                );
                
                if (existingText !== targetElement.text || existingClickable !== targetClickable || needsPopoverUpdate) {
                    differences.push({ action: 'update', index: i, element: targetElement });
                }
            }
        }
        
        return differences;
    }
    
    // Apply breadcrumb differences intelligently
    async function applyBreadcrumbDifferences(differences, targetStructure, stale = () => false) {
        if (differences.length === 0) {
            log('No breadcrumb differences found, keeping existing structure');
            return;
        }
        
        log('Applying breadcrumb differences:', differences.length, 'changes needed');
        
        // Get existing elements
        const existingElements = Array.from(breadcrumbContainer.children).filter(child => 
            child.classList.contains('kefinTweaks-breadcrumb-element')
        );
        
        // Process differences in reverse order to maintain indices
        for (let i = differences.length - 1; i >= 0; i--) {
            if (stale()) return;       // a newer navigation took over: it compares against whatever is in the DOM now
            const diff = differences[i];
            
            if (diff.action === 'add') {
                // Add new element at the specified index
                const newElement = await createBreadcrumbElementFromStructure(diff.element, targetStructure.item);
                if (stale()) return;
                const separator = createSeparator();
                
                if (diff.index === 0) {
                    breadcrumbContainer.insertBefore(newElement, breadcrumbContainer.firstChild);
                    breadcrumbContainer.insertBefore(separator, newElement.nextSibling);
                } else {
                    const insertAfter = existingElements[diff.index - 1];
                    if (insertAfter) {
                        breadcrumbContainer.insertBefore(separator, insertAfter.nextSibling);
                        breadcrumbContainer.insertBefore(newElement, separator.nextSibling);
                    } else {
                        breadcrumbContainer.appendChild(separator);
                        breadcrumbContainer.appendChild(newElement);
                    }
                }
                
                log('Added new breadcrumb element:', diff.element.text);
                
            } else if (diff.action === 'remove') {
                // Remove element and its separator
                const elementToRemove = existingElements[diff.index];
                if (elementToRemove) {
                    const separatorToRemove = elementToRemove.previousSibling;
                    if (separatorToRemove && separatorToRemove.classList.contains('kefinTweaks-breadcrumb-separator')) {
                        breadcrumbContainer.removeChild(separatorToRemove);
                    }
                    breadcrumbContainer.removeChild(elementToRemove);
                    log('Removed breadcrumb element at index:', diff.index);
                }
                
            } else if (diff.action === 'update') {
                // Update existing element
                const elementToUpdate = existingElements[diff.index];
                if (elementToUpdate) {
                    await updateBreadcrumbElement(elementToUpdate, diff.element, targetStructure.item);
                    log('Updated breadcrumb element:', diff.element.text);
                }
            }
        }
    }
    
    // Create breadcrumb element from structure definition
    async function createBreadcrumbElementFromStructure(elementDef, item) {
        const element = document.createElement('span');
        element.className = 'kefinTweaks-breadcrumb-element';
        element.textContent = elementDef.text;
        
        if (elementDef.clickable) {
            element.style.cursor = 'pointer';
            
            if (elementDef.url) {
                // Direct link
                element.addEventListener('click', () => {
                    window.location.href = elementDef.url;
                });
            } else if (elementDef.popover) {
                // Popover functionality
                await setupPopoverForElement(element, elementDef, item);
            }
        } else {
            element.style.cursor = 'default';
        }
        
        return element;
    }
    
    // Update existing breadcrumb element
    async function updateBreadcrumbElement(element, elementDef, item) {
        if (!element || !element.parentNode) return;        // jf12 fork: already gone (the breadcrumbs were rebuilt); nothing to update
        // Update text content
        element.textContent = elementDef.text;
        
        // Remove old event listeners by cloning
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // Set cursor style
        if (elementDef.clickable) {
            newElement.style.cursor = 'pointer';
            
            if (elementDef.url) {
                // Direct link
                newElement.addEventListener('click', () => {
                    window.location.href = elementDef.url;
                });
            } else if (elementDef.popover) {
                // Popover functionality
                await setupPopoverForElement(newElement, elementDef, item);
            }
        } else {
            newElement.style.cursor = 'default';
        }
    }
    
    // Setup popover functionality for an element
    async function setupPopoverForElement(element, elementDef, item) {
        if (elementDef.text === 'All Seasons') {
            // Series page - always show popover
            const seasons = await getSeasonsIfNeeded(item.Id);
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const popover = createPopover(seasons, null, (selectedSeason) => {
                    window.location.href = detailsHref(selectedSeason.Id);
                });
                showPopover(element, popover);
            });
        } else if (elementDef.text === 'All Albums') {
            // Music Artist page - always show popover
            const albums = await getAlbumsIfNeeded(item.Id);
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const popover = createPopover(albums, null, (selectedAlbum) => {
                    window.location.href = detailsHref(selectedAlbum.Id);
                });
                showPopover(element, popover);
            });
        } else if (elementDef.text === 'All Songs') {
            // Music Album page - always show popover
            const songs = await getSongsIfNeeded(item.Id);
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const popover = createPopover(songs, null, (selectedSong) => {
                    window.location.href = detailsHref(selectedSong.Id);
                });
                showPopover(element, popover);
            });
        } else if (item.Type === 'Season') {
            // Season page - check if single season
            const seasons = await getSeasonsIfNeeded(item.ParentId);
            if (seasons.length === 1) {
                element.style.cursor = 'default';
            } else {
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const popover = createPopover(seasons, item, (selectedSeason) => {
                        window.location.href = detailsHref(selectedSeason.Id);
                    });
                    showPopover(element, popover);
                });
            }
        } else if (item.Type === 'Episode') {
            // Episode page - check if single season
            const seasons = await getSeasonsIfNeeded(item.SeriesId);
            if (seasons.length === 1) {
                element.addEventListener('click', () => {
                    window.location.href = detailsHref(seasons[0].Id);
                });
            } else {
                const currentSeason = seasons.find(season => season.Id === item.ParentId);
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const popover = createPopover(seasons, currentSeason, (selectedSeason) => {
                        window.location.href = detailsHref(selectedSeason.Id);
                    });
                    showPopover(element, popover);
                });
            }
        } else if (item.Type === 'MusicAlbum') {
            // Music album page - clicking album name should show albums from all AlbumArtists
            // Prefer AlbumArtists on the item, fall back to fetching details
            let albumArtists = item.AlbumArtists;
            if (!albumArtists || !Array.isArray(albumArtists) || albumArtists.length === 0) {
                const albumDetails = await getItemDetails(item.Id);
                albumArtists = (albumDetails && albumDetails.AlbumArtists) ? albumDetails.AlbumArtists : [];
            }

            const artistIds = (albumArtists || []).map(a => a.Id).filter(Boolean);
            const albums = artistIds.length > 0
                ? await getAlbumsByArtistIds(artistIds)
                : await getAlbumsIfNeeded(item.ParentId);

            if (albums.length === 1) {
                element.addEventListener('click', () => {
                    window.location.href = detailsHref(albums[0].Id);
                });
            } else {
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const popover = createPopover(albums, item, (selectedAlbum) => {
                        window.location.href = detailsHref(selectedAlbum.Id);
                    });
                    showPopover(element, popover);
                });
            }
        } else if (item.Type === 'Audio') {
            // Audio (Song) page - clicking album name should show albums from all AlbumArtists of the album
            const albumDetails = await getItemDetails(item.ParentId);
            const albumArtists = (albumDetails && albumDetails.AlbumArtists) ? albumDetails.AlbumArtists : [];
            const artistIds = albumArtists.map(a => a.Id).filter(Boolean);
            const albums = artistIds.length > 0
                ? await getAlbumsByArtistIds(artistIds)
                : await getAlbumsIfNeeded(albumDetails ? albumDetails.ParentId : null);

            if (albums && albums.length === 1) {
                element.addEventListener('click', () => {
                    window.location.href = detailsHref(albums[0].Id);
                });
            } else {
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currentAlbum = albumDetails || null;
                    const popover = createPopover(albums || [], currentAlbum, (selectedAlbum) => {
                        window.location.href = detailsHref(selectedAlbum.Id);
                    });
                    showPopover(element, popover);
                });
            }
        }
    }
    
    // Utility functions
    function log(message, ...args) {
        console.log(`[KefinTweaks Breadcrumbs] ${message}`, ...args);
    }
    
    function error(message, ...args) {
        console.error(`[KefinTweaks Breadcrumbs] ${message}`, ...args);
    }
    
    // the route Jellyfin shows now ("/details?id=..."): Emby.Page.lastPath, or the hash when that is not there (yet)
    function currentRoutePath() {
        const last = window.Emby && window.Emby.Page && window.Emby.Page.lastPath;
        if (last) return last;
        const hash = window.location.hash || '';
        return hash.startsWith('#/') ? hash.slice(1) : '';
    }

    // which of the supported item types get breadcrumbs (jf12 fork): KefinTweaksConfig.breadcrumbs = { tv, movies, music }, each true / false.
    // Upstream's Jellyfin 12 build attaches them to series, seasons and episodes only, so that stays the default; movies and music are one switch each.
    const TYPE_GROUPS = { Movie: 'movies', Series: 'tv', Season: 'tv', Episode: 'tv', MusicArtist: 'music', MusicAlbum: 'music', Audio: 'music' };
    const TYPE_DEFAULTS = { tv: true, movies: false, music: false };
    function isTypeEnabled(type) {
        const group = TYPE_GROUPS[type];
        if (!group) return false;
        const cfg = (window.KefinTweaksConfig && window.KefinTweaksConfig.breadcrumbs) || {};
        return typeof cfg[group] === 'boolean' ? cfg[group] : TYPE_DEFAULTS[group];
    }

    function isWideScreen() {
        return window.innerWidth > CONFIG.minWidth;
    }
    
    function getItemIdFromPath(path) {
        const match = path.match(/[?&]id=([^&]+)/);
        return match ? match[1] : null;
    }
    
    function padNumber(num, length = 2) {
        return num == null ? '' : String(num).padStart(length, '0');
    }

    // a same-page link to an item's details (jf12 fork: the popovers used absolute ${ApiClient._serverAddress}/web/#/details URLs, which reload the app when it runs as /web/index.html or under a base path)
    function detailsHref(id) {
        return id ? `#/details?id=${id}&serverId=${ApiClient.serverId()}` : null;
    }

    // jf12 fork: "2x03 - Name" needs both numbers; an episode without them (extras, files straight under the series) shows what it has instead of throwing
    function episodeLabel(item) {
        const hasSeason = item.ParentIndexNumber != null;
        const hasEpisode = item.IndexNumber != null;
        const prefix = hasEpisode ? `${hasSeason ? item.ParentIndexNumber + 'x' : ''}${padNumber(item.IndexNumber)} - ` : '';
        return `${prefix}${item.Name || 'Episode'}`;
    }

    // jf12 fork: only Jellyfin 10.10 and older route library pages as movies.html / tv.html / music.html; 10.11 and 12.x do not
    function usesHtmlRoutes() {
        const parts = String((window.ApiClient && window.ApiClient._appVersion) || '').split('.').map((p) => parseInt(p, 10));
        return parts[0] === 10 && !(parts[1] > 10);
    }

    // the items of an answer that may be a bare array, { Items: [] } or something else entirely (an error body)
    function asItems(data) {
        if (Array.isArray(data)) return data;
        return data && Array.isArray(data.Items) ? data.Items : [];
    }
    
    // DOM manipulation
    function isModernUI() {
        if (ApiClient._appVersion && ApiClient._appVersion.startsWith('12') && localStorage.getItem('layout')?.length === 0) {
            return true;
        }

        return !!document.querySelector('main.MuiBox-root');
    }

    // jf12 fork: on the modern (MUI) layout the breadcrumbs hang under the app bar (a child of the AppBar <header>, absolutely
    // positioned below the toolbar) instead of living inside .MuiToolbar-root. Upstream turned the toolbar into a 3-column grid to
    // make room, which on 12.1 (4+ toolbar children: nav, icon tray, #ab-header-badges, user menu) pushed the avatar onto a 2nd row.
    function resolveBreadcrumbMount() {
        if (isModernUI()) {
            return document.querySelector('header.MuiAppBar-root') || document.querySelector('.MuiAppBar-root');
        }
        return document.querySelector('.skinHeader .headerLeft');
    }

    // jf12 fork: keep the wrapper BEHIND the app bar's toolbar. Jellyfin takes the toolbar out of the app bar while the video page is open and React puts a new one in
    // when it closes, at the END of <header> - behind the wrapper, which stays in there. The toolbar was then the second child, and everything written for
    // `.MuiAppBar-root > .MuiToolbar-root:first-child` (the Aurora Glass theme: nav pill, labels, the plugin buttons it un-hides) stopped matching until the next refresh.
    // This only moves the wrapper when it is in front of a toolbar, so two scripts that both want to be last cannot fight over it.
    let appBarObserver = null;
    function keepBehindToolbar(mount) {
        if (appBarObserver) { appBarObserver.disconnect(); appBarObserver = null; }
        if (!mount || !window.MutationObserver) return;
        const fix = () => {
            const wrapper = document.getElementById('kefinTweaks-breadcrumbs-wrapper');
            if (!wrapper || wrapper.parentElement !== mount) return;
            const toolbars = mount.querySelectorAll(':scope > .MuiToolbar-root');
            const last = toolbars[toolbars.length - 1];
            if (last && (wrapper.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING)) last.after(wrapper);
        };
        appBarObserver = new MutationObserver(fix);
        appBarObserver.observe(mount, { childList: true });
        fix();
    }

    function createBreadcrumbContainer() {
        if (breadcrumbContainer && breadcrumbContainer.isConnected) {
            return breadcrumbContainer;
        }
        if (breadcrumbContainer) {
            // the app bar was re-rendered and took the old container with it: start again
            document.getElementById('kefinTweaks-breadcrumbs-wrapper')?.remove();
            breadcrumbContainer = null;
        }

        const isModern = isModernUI();
        const mount = resolveBreadcrumbMount();
        if (!mount) {
            error(isModern
                ? 'Could not find the MUI app bar for breadcrumbs'
                : 'Could not find .skinHeader .headerLeft element');
            return null;
        }
        
        // Create main wrapper
        const wrapper = document.createElement('div');
        wrapper.id = 'kefinTweaks-breadcrumbs-wrapper';
        wrapper.className = 'kefinTweaks-breadcrumbs-wrapper';
        if (isModern) {
            wrapper.classList.add('kefinTweaks-breadcrumbs-wrapper--modern');
        }
        wrapper.style.cssText = `
            display: none;
        `;
        
        // Create breadcrumb container (for background styling)
        breadcrumbContainer = document.createElement('div');
        breadcrumbContainer.id = 'kefinTweaks-breadcrumbs';
        breadcrumbContainer.className = 'kefinTweaks-breadcrumbs';
        
        // Create popover container
        const popoverContainer = document.createElement('div');
        popoverContainer.id = 'kefinTweaks-popover-container';
        popoverContainer.className = 'kefinTweaks-popover-container';
        popoverContainer.style.cssText = `
            position: absolute;
            top: calc(100% - 15px);
            left: 0;
            z-index: 1001;
        `;
        
        wrapper.appendChild(breadcrumbContainer);
        wrapper.appendChild(popoverContainer);
        mount.appendChild(wrapper);
        if (isModern) keepBehindToolbar(mount);
        
        log(isModern
            ? 'Created breadcrumb container under the MUI app bar'
            : 'Created breadcrumb container with wrapper structure inside .skinHeader .headerLeft');
        return breadcrumbContainer;
    }

    function ensureBreadcrumbContainer(retries = 20) {
        const existing = createBreadcrumbContainer();
        if (existing) return Promise.resolve(existing);

        return new Promise((resolve) => {
            let attempts = 0;
            const tryMount = () => {
                const container = createBreadcrumbContainer();
                if (container) {
                    resolve(container);
                    return;
                }
                attempts += 1;
                if (attempts >= retries) {
                    resolve(null);
                    return;
                }
                setTimeout(tryMount, 100);
            };
            tryMount();
        });
    }
    
    function showBreadcrumbs() {
        const wrapper = document.getElementById('kefinTweaks-breadcrumbs-wrapper');
        const wideScreen = isWideScreen();
        
        // Race condition protection: verify we're still on a supported page
        const currentPath = currentRoutePath() || '';
        const isSupportedPage = currentPath.startsWith('/details?');
        
        if (wrapper && wideScreen && isSupportedPage) {
            wrapper.style.display = 'block';
            log('Breadcrumbs shown successfully');
        } else {
            log('Breadcrumbs not shown - wrapper:', !!wrapper, 'wideScreen:', wideScreen, 'isSupportedPage:', isSupportedPage);
        }
    }
    
    function hideBreadcrumbs() {
        const wrapper = document.getElementById('kefinTweaks-breadcrumbs-wrapper');
        if (wrapper) {
            wrapper.style.display = 'none';
        }
    }
    
    function clearBreadcrumbs() {
        if (breadcrumbContainer) {
            breadcrumbContainer.innerHTML = '';
            currentBreadcrumbs = null;
            currentItemId = null;
        }
        closePopover();
    }

    function closePopover() {
        if (activePopover) {
            activePopover.remove();
            activePopover = null;
        }
    }
    
    function createPopover(items, currentItem, onItemClick) {
        const popover = document.createElement('div');
        popover.className = 'kefinTweaks-popover itemDetailsGroup';
        popover.style.display = 'block'; // Ensure it's visible
        
        log('Creating popover with', items.length, 'items');
        
        let selectedItemElement = null;
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'kefinTweaks-popover-item detailsGroupItem';
            
            if (currentItem && item.Id === currentItem.Id) {
                itemElement.classList.add('selected');
                selectedItemElement = itemElement; // Store reference to selected item
            }
            
            // Format display text based on item type
            let displayText = item.Name;
            if (item.Type === 'Season' || item.Type === 'Episode') {
                displayText = item.Name || `Season ${item.IndexNumber}`;
            } else if (item.Type === 'Audio') {
                // For songs, show track number if available
                displayText = item.IndexNumber ? `${padNumber(item.IndexNumber)}. ${item.Name}` : item.Name;
            }
            
            itemElement.textContent = displayText;
            itemElement.addEventListener('click', () => {
                log('Popover item clicked:', item.Name);
                onItemClick(item);
                closePopover();
            });
            
            popover.appendChild(itemElement);
        });
        
        // Add auto-scroll functionality
        if (selectedItemElement) {
            // Use setTimeout to ensure the popover is rendered before scrolling
            setTimeout(() => {
                selectedItemElement.scrollIntoView({
                    behavior: 'instant',
                    block: 'nearest',
                    inline: 'nearest'
                });
                log('Auto-scrolled to selected item:', selectedItemElement.textContent);
            }, 10);
        }
        
        return popover;
    }
    
    function showPopover(triggerElement, popover) {
        closePopover();
        
        activePopover = popover;
        
        log('Showing popover for element:', triggerElement.textContent);
        
        // Add popover to the dedicated popover container
        const popoverContainer = document.getElementById('kefinTweaks-popover-container');
        if (popoverContainer) {
            // Calculate the left offset to align with the trigger element
            const triggerRect = triggerElement.getBoundingClientRect();
            const popoverContainerRect = popoverContainer.getBoundingClientRect();
            const leftOffset = triggerRect.left - popoverContainerRect.left - 22;
            popover.style.left = `${leftOffset}px`;
            
            // Decide whether to open above or below based on viewport space
            // When breadcrumbs are at the bottom of the page, open above
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            const showAbove = spaceBelow < spaceAbove;
            
            popoverContainer.classList.toggle('kefinTweaks-popover-container--above', showAbove);
            popover.classList.toggle('kefinTweaks-popover--above', showAbove);
            // Clear inline top when above so CSS bottom: 100% takes effect; restore when below
            if (showAbove) {
                popoverContainer.style.top = '';
                popoverContainer.style.bottom = '100%';
            } else {
                popoverContainer.style.top = 'calc(100% - 15px)';
                popoverContainer.style.bottom = '';
            }
            
            popoverContainer.appendChild(popover);
            log('Popover added to popover container with left offset:', leftOffset, 'showAbove:', showAbove);
        } else {
            log('Popover container not found, falling back to trigger element');
            triggerElement.style.position = 'relative';
            triggerElement.appendChild(popover);
        }
        
        // Close popover when clicking outside
        const closeHandler = (e) => {
            if (!popover.contains(e.target) && !triggerElement.contains(e.target)) {
                closePopover();
                document.removeEventListener('click', closeHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 100);
    }
    
    // API functions
    async function getItemDetails(itemId) {
        if (!itemId) return null;       // jf12 fork: an item without a parent / series id has nothing to look up (and must not request .../Items/undefined)
        try {
            const currentUserId = ApiClient.getCurrentUserId();
            if (!currentUserId) {
                throw new Error('No user ID found');
            }

            const url = ApiClient.getUrl(`Users/${currentUserId}/Items/${itemId}`);
            const response = await window.apiHelper.getQuery(url, { useCache: true });

            if (!response.data) {
                response.data = await response.dataPromise;
            }

            const item = response.data;
            log('Retrieved item details:', item.Name, item.Type);
            return item;
        } catch (err) {
            console.error('Failed to get item details:', err);
            return null;
        }
    }
    
    async function getSeasons(seriesId) {
        if (!seriesId) return [];          // jf12 fork: nothing to ask for
        try {
            const url = ApiClient.getUrl(`Shows/${seriesId}/Seasons`);
            const response = await window.apiHelper.getQuery(url, { useCache: true });
            if (!response.data) {
                response.data = await response.dataPromise;
            }
            const seasons = asItems(response.data);
            log('Retrieved seasons:', seasons.length);
            return seasons;
        } catch (err) {
            error('Failed to get seasons:', err);
            return [];
        }
    }
    
    async function getAlbums(artistId) {
        if (!artistId) return [];          // jf12 fork: nothing to ask for
        try {
            const url = ApiClient.getUrl('Items', {
                SortOrder: 'Descending',
                IncludeItemTypes: 'MusicAlbum',
                Recursive: true,
                Fields: 'ParentId',
                Limit: 100,
                StartIndex: 0,
                CollapseBoxSetItems: false,
                AlbumArtistIds: artistId,
                SortBy: 'PremiereDate,ProductionYear,Sortname'
            });
            const response = await window.apiHelper.getQuery(url, { useCache: true });
            if (!response.data) {
                response.data = await response.dataPromise;
            }
            const albums = asItems(response.data);
            log('Retrieved albums:', albums.length);
            return albums;
        } catch (err) {
            error('Failed to get albums:', err);
            return [];
        }
    }
    
    async function getAlbumsByArtistIds(artistIds) {
        try {
            const idsParam = Array.isArray(artistIds) ? artistIds.join(',') : String(artistIds || '');
            const url = ApiClient.getUrl('Items', {
                SortOrder: 'Descending',
                IncludeItemTypes: 'MusicAlbum',
                Recursive: true,
                Fields: 'ParentId',
                Limit: 200,
                StartIndex: 0,
                CollapseBoxSetItems: false,
                AlbumArtistIds: idsParam,
                SortBy: 'PremiereDate,ProductionYear,Sortname'
            });
            const response = await window.apiHelper.getQuery(url, { useCache: true });
            if (!response.data) {
                response.data = await response.dataPromise;
            }
            const items = asItems(response.data);
            // Deduplicate by Id when multiple artists overlap
            const unique = [];
            const seen = new Set();
            for (const it of items) {
                if (it && it.Id && !seen.has(it.Id)) {
                    seen.add(it.Id);
                    unique.push(it);
                }
            }
            log('Retrieved albums by artist IDs:', unique.length);
            return unique;
        } catch (err) {
            error('Failed to get albums by artist IDs:', err);
            return [];
        }
    }
    
    async function getSongs(albumId) {
        if (!albumId) return [];          // jf12 fork: nothing to ask for
        try {
            const url = ApiClient.getUrl('Items', {
                ParentId: albumId,
                IncludeItemTypes: 'Audio',
                Recursive: false,
                Fields: 'ParentId',
                Limit: 100,
                StartIndex: 0,
                SortBy: 'IndexNumber,SortName'
            });
            const response = await window.apiHelper.getQuery(url, { useCache: true });
            if (!response.data) {
                response.data = await response.dataPromise;
            }
            const songs = asItems(response.data);
            log('Retrieved songs:', songs.length);
            return songs;
        } catch (err) {
            error('Failed to get songs:', err);
            return [];
        }
    }
    
    function createSeparator() {
        const separator = document.createElement('span');
        separator.className = 'kefinTweaks-breadcrumb-separator';
        separator.textContent = ' / ';
        separator.style.margin = '0 8px';
        return separator;
    }
    
    // Page change handler
    // Simplified page change handler
    // jf12 fork: the calls for one navigation run one after the other, and a call that a newer one has overtaken does nothing (see runSeq above)
    function handlePageChange(item = null) {
        const run = ++runSeq;
        const go = () => runPageChange(item, run);
        runChain = runChain.then(go, go);
        return runChain;
    }

    async function runPageChange(item, run) {
        const stale = () => run !== runSeq;
        try {
            if (stale()) return;

            // Close any active popovers first
            closePopover();
            
            const currentPath = currentRoutePath();
            
            // Check if we're on a details page
            if (!currentPath || !currentPath.startsWith('/details?')) {
                clearBreadcrumbs();
                hideBreadcrumbs();
                return;
            }

            // Check if the user is logged in
            if (!ApiClient._loggedIn) {
                clearBreadcrumbs();
                hideBreadcrumbs();
                return;
            }
            
            // Extract item ID, and check that the item type gets breadcrumbs
            if (!item || !item.Id || !CONFIG.supportedTypes.includes(item.Type) || !isTypeEnabled(item.Type)) {
                clearBreadcrumbs();
                hideBreadcrumbs();
                return;
            }
            
            // Determine target breadcrumb structure
            const targetStructure = await getTargetBreadcrumbStructure(item);
            if (stale()) return;
            log('Target breadcrumb structure:', targetStructure.elements.map(e => e.text));
            
            // Check if we need to create breadcrumbs from scratch (also when the app bar was re-rendered and took the old container with it)
            if (!breadcrumbContainer || !currentBreadcrumbs || !breadcrumbContainer.isConnected) {
                log('Creating breadcrumbs from scratch');
                await createBreadcrumbsFromScratch(targetStructure, stale);
            } else {
                // Compare existing with target and apply differences
                const differences = compareBreadcrumbStructures(currentBreadcrumbs, targetStructure);
                await applyBreadcrumbDifferences(differences, targetStructure, stale);
            }
            if (stale()) return;
            
            // Update state
            currentBreadcrumbs = targetStructure;
            currentItemId = item.Id;
            
            log('About to show breadcrumbs...');
            showBreadcrumbs();
            log('Breadcrumbs updated successfully');
            
        } catch (err) {
            error('Error handling page change:', err);
            clearBreadcrumbs();
            hideBreadcrumbs();
        }
    }
    
    // Create breadcrumbs from scratch
    async function createBreadcrumbsFromScratch(targetStructure, stale = () => false) {
        // Create container if it doesn't exist (retry briefly on ModernUI if toolbar not ready)
        if (!breadcrumbContainer || !breadcrumbContainer.isConnected) {
            breadcrumbContainer = await ensureBreadcrumbContainer();
            if (stale()) return;
        }
        if (!breadcrumbContainer) {
            error('Breadcrumb container unavailable');
            return;
        }
        
        // Build all elements first
        const elements = [];
        for (let i = 0; i < targetStructure.elements.length; i++) {
            const elementDef = targetStructure.elements[i];
            const element = await createBreadcrumbElementFromStructure(elementDef, targetStructure.item);
            if (stale()) return;
            elements.push(element);
            
            // Add separator after each element except the last
            if (i < targetStructure.elements.length - 1) {
                const separator = createSeparator();
                elements.push(separator);
            }
        }
        
        // Replace the innerHTML entirely to avoid any duplicate appending issues
        breadcrumbContainer.innerHTML = '';
        
        // Append all elements at once
        elements.forEach(el => breadcrumbContainer.appendChild(el));
        
        log('Created breadcrumbs from scratch with', targetStructure.elements.length, 'elements');
    }
    
    // Window resize handler
    function handleResize() {
        if (currentBreadcrumbs && breadcrumbContainer) {
            if (isWideScreen()) {
                showBreadcrumbs();
            } else {
                hideBreadcrumbs();
            }
        }
    }
    
    // Initialize breadcrumbs
    function initialize() {
        log('Initializing breadcrumbs...');
        
        // Use utils for page change detection
        if (window.KefinTweaksUtils) {
            log('Registering breadcrumb handler with KefinTweaksUtils');
            
            // Register handler for all pages (breadcrumbs can appear on any detail page)
            window.KefinTweaksUtils.onViewPage(async (view, element, hash, itemPromise) => {
                try {
                    // Await the item promise to get the actual item data
                    const item = await itemPromise;
                    // Run our custom code
                    handlePageChange(item);
                } catch (err) {
                    error('Breadcrumb page change handler failed:', err);
                }
            }, {
                pages: [] // Empty array means all pages
            });
        } else {
            error('KefinTweaksUtils not available, breadcrumbs may not work correctly');
        }
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Initial check
        handlePageChange();
        
        log('Breadcrumbs initialized successfully');
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
