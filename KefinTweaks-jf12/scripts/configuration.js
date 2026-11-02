// KefinTweaks Configuration UI
// Adds a configuration button to the Administration section in user preferences
// Opens configuration in a modal window

(function() {
    'use strict';

    console.log('[KefinTweaks Configuration] Initializing...');

    const MODAL_ID = 'kefinTweaksConfigModal';
    let currentLoadedConfig = null;

    const DISCOVERY_SECTION_DEFINITIONS = [
        { key: 'spotlightGenre', label: '精选板块（流派）', defaultName: '精选' },
        { key: 'spotlightNetwork', label: '精选板块（电视网）', defaultName: '精选' },
        { key: 'genreMovies', label: '流派电影', defaultName: '[Genre] 电影' },
        { key: 'studioShows', label: '来自 [Studio] 的剧集', defaultName: '来自 [Studio] 的剧集' },
        { key: 'collections', label: '合集精选', defaultName: '[Collection Name]', extras: { minimumItems: 10 } },
        { key: 'becauseYouWatched', label: '因为你看过 [Movie]', defaultName: '因为你看过 [Movie]' },
        { key: 'becauseYouLiked', label: '因为你喜欢 [Movie]', defaultName: '因为你喜欢 [Movie]' },
        { key: 'starringTopActor', label: '由 [Top Actor] 主演', defaultName: '由 [Actor] 主演' },
        { key: 'directedByTopDirector', label: '由 [Top Director] 执导', defaultName: '由 [Director] 执导' },
        { key: 'writtenByTopWriter', label: '由 [Top Writer] 编剧', defaultName: '由 [Writer] 编剧' },
        { key: 'becauseYouRecentlyWatched', label: '因为你最近看过 [Movie]', defaultName: '因为你最近看过 [Movie]' },
        { key: 'starringActorRecentlyWatched', label: '由 [Person] 主演', defaultName: '由 {Person} 主演', extras: { caption: '因为你最近看过 {Title}' } },
        { key: 'directedByDirectorRecentlyWatched', label: '由 [Person] 执导', defaultName: '由 {Person} 执导', extras: { caption: '因为你最近看过 {Title}' } },
        { key: 'writtenByWriterRecentlyWatched', label: '由 [Person] 编剧', defaultName: '由 {Person} 编剧', extras: { caption: '因为你最近看过 {Title}' } }
    ];

    const SUPPORTED_CUSTOM_SECTION_PARAMS = {
        filters: { label: '筛选器', type: 'array', hint: 'IsFolder, IsNotFolder, IsUnplayed, IsPlayed, IsFavorite, IsResumable, Likes, Dislikes' },
        isPlayed: { label: '是否已播放', type: 'boolean' },
        person: { label: '人物名称', type: 'string' },
        personTypes: { label: '人物类型', type: 'array', hint: 'Actor、Director、Writer 等' },
        years: { label: '年份', type: 'array', hint: '多个年份用逗号分隔' },
        
        // Dates (ISO 8601)
        minPremiereDate: { label: '最早首播日期', type: 'date', hint: 'YYYY-MM-DD' },
        maxPremiereDate: { label: '最晚首播日期', type: 'date', hint: 'YYYY-MM-DD' },
        //minDateLastSaved: { label: 'Min Date Last Saved', type: 'date', hint: 'YYYY-MM-DD' },
        //minDateLastSavedForUser: { label: 'Min Date Last Saved For User', type: 'date', hint: 'YYYY-MM-DD' },
        
        // Numbers
        indexNumber: { label: '索引编号', type: 'number' },
        parentIndexNumber: { label: '父级索引编号', type: 'number' },
        minCommunityRating: { label: '最低社区评分', type: 'number' },
        minCriticRating: { label: '最低评论家评分', type: 'number' },

        // Booleans
        isFavorite: { label: '是否收藏', type: 'boolean' },
        hasThemeSong: { label: '有主题曲', type: 'boolean' },
        hasThemeVideo: { label: '有主题视频', type: 'boolean' },
        hasSubtitles: { label: '有字幕', type: 'boolean' },
        hasSpecialFeature: { label: '有特别收录', type: 'boolean' },
        hasTrailer: { label: '有预告片', type: 'boolean' },
        hasParentalRating: { label: '有家长分级', type: 'boolean' },
        isHd: { label: '是否高清', type: 'boolean' },
        is4K: { label: '是否 4K', type: 'boolean' },
        isMissing: { label: '是否缺失', type: 'boolean' },
        isUnaired: { label: '是否未播出', type: 'boolean' },
        //is3D: { label: 'Is 3D', type: 'boolean' },
        //isSeries: { label: 'Is Series (Live TV)', type: 'boolean' },
        hasOverview: { label: '有简介', type: 'boolean' },
        hasOfficialRating: { label: '有官方分级', type: 'boolean' },
        recursive: { label: '递归', type: 'boolean', default: true },
        
        // Strings
        maxOfficialRating: { label: '最高官方分级', type: 'string', hint: '例如 PG-13、TV-MA' },
        minOfficialRating: { label: '最低官方分级', type: 'string', hint: '例如 PG、TV-14' },
        nameStartsWith: { label: '名称开头为', type: 'string' },
        nameStartsWithOrGreater: { label: '名称开头或按字母序更大', type: 'string' },
        nameLessThan: { label: '名称按字母序小于', type: 'string' },
        
        // Arrays (Comma-separated strings in UI)
        locationTypes: { label: '位置类型', type: 'array', hint: 'FileSystem, Remote, Virtual, Offline' },
        excludeLocationTypes: { label: '排除的位置类型', type: 'array', hint: 'FileSystem, Remote, Virtual, Offline' },
        excludeItemIds: { label: '排除的条目 ID', type: 'array', hint: '多个 GUID 用逗号分隔' },
        excludeItemTypes: { label: '排除的条目类型', type: 'array', hint: 'Movie、Series、Episode 等' },
        imageTypes: { label: '图像类型', type: 'array', hint: 'Primary、Backdrop、Thumb、Logo 等' },
        officialRatings: { label: '官方分级', type: 'array', hint: 'PG、PG-13、R 等' },
        studios: { label: '制片公司', type: 'array', hint: '多个名称用竖线 | 分隔' },
        artists: { label: '艺术家', type: 'array', hint: '多个名称用竖线 | 分隔' },
        albums: { label: '专辑', type: 'array', hint: '多个名称用竖线 | 分隔' },
        seriesStatus: { label: '剧集状态', type: 'array', hint: 'Continuing、Ended、Unreleased' },
        personIds: { label: '人物 ID', type: 'array', hint: '多个 GUID 用逗号分隔' },
        studioIds: { label: '制片公司 ID', type: 'array', hint: '多个 GUID 用逗号分隔' },
        ids: { label: '条目 ID', type: 'array', hint: '多个 GUID 用逗号分隔' }
    };

    // Check if user is admin
    async function isAdmin() {
        try {
            if (window.ApiClient && window.ApiClient.getCurrentUser) {
                const user = await window.ApiClient.getCurrentUser();
                return user && user.Policy && user.Policy.IsAdministrator === true;
            }
        } catch (error) {
            console.warn('[KefinTweaks Configuration] Could not check admin status:', error);
        }
        return false;
    }

    // Load default configuration from JS file
    async function loadDefaultConfig() {
        return new Promise((resolve, reject) => {
            try {
                const defaultConfigUrl = window.KefinTweaksConfig?.kefinTweaksRoot 
                    ? `${window.KefinTweaksConfig.kefinTweaksRoot.replace(/\/?$/, '/')}kefinTweaks-default-config.js` : null;

                if (!defaultConfigUrl) {
                    reject(new Error('No default config URL found'));
                    return;
                }
                
                // Check if already loaded
                if (window.KefinTweaksDefaultConfig) {
                    console.log('[KefinTweaks Configuration] Using cached default config');
                    resolve(window.KefinTweaksDefaultConfig);
                    return;
                }
                
                // Create script element to load the JS file
                const script = document.createElement('script');
                script.src = defaultConfigUrl;
                script.async = true;
                
                script.onload = () => {
                    if (window.KefinTweaksDefaultConfig) {
                        console.log('[KefinTweaks Configuration] Loaded default config:', window.KefinTweaksDefaultConfig);
                        resolve(window.KefinTweaksDefaultConfig);
                    } else {
                        reject(new Error('Default config file loaded but window.KefinTweaksDefaultConfig is not defined'));
                    }
                };
                
                script.onerror = (error) => {
                    reject(new Error(`Failed to load default config file: ${defaultConfigUrl}`));
                };
                
                document.head.appendChild(script);
            } catch (error) {
                console.error('[KefinTweaks Configuration] Error loading default config:', error);
                reject(error);
            }
        });
    }

    // Migrate legacy homeScreen config to new homeScreenConfig format
    async function migrateLegacyHomeScreenConfig() {
        if (typeof window.migrateHomeScreenConfig !== 'function') return false;   // jf12 fork: homeScreen-migration may not be loaded
        return await window.migrateHomeScreenConfig();
    }

    // Get KefinTweaks configuration from JS Injector or load defaults
    async function getKefinTweaksConfig() {
        try {
            await migrateLegacyHomeScreenConfig();
            // First, try to get config from JS Injector
/*             const pluginId = await findJavaScriptInjectorPlugin();
            const injectorConfig = await getJavaScriptInjectorConfig(pluginId);
            
            // Find KefinTweaks-Config script
            const kefinTweaksScript = injectorConfig.CustomJavaScripts?.find(
                script => script.Name === 'KefinTweaks-Config'
            ); */
            
/*             if (kefinTweaksScript && kefinTweaksScript.Script) {
                // Extract config from script content
                // The script should contain: window.KefinTweaksConfig = {...};
                const scriptMatch = kefinTweaksScript.Script.match(/window\.KefinTweaksConfig\s*=\s*({[\s\S]*});/);
                if (scriptMatch && scriptMatch[1]) {
                    try {
                        let config = JSON.parse(scriptMatch[1]);
                        // Store enabled state globally for use in modal (defaults to true if not set)
                        window.KefinTweaksConfigEnabled = config.enabled !== false;
                        console.log('[KefinTweaks Configuration] Loaded config from JS Injector:', config);
                        
                        // Run migration if needed
                        config = await migrateLegacyHomeScreenConfig();
                        
                        return config;
                    } catch (parseError) {
                        console.error('[KefinTweaks Configuration] Error parsing config from script:', parseError);
                    }
                }
            } */

            // If no config found in JS Injector, load defaults
/*             console.log('[KefinTweaks Configuration] No config found in JS Injector, loading defaults');
            const rawDefaultConfig = await loadDefaultConfig();
            const defaultConfig = JSON.parse(JSON.stringify(rawDefaultConfig));

            const currentConfigSource = currentLoadedConfig || window.KefinTweaksCurrentConfig || window.KefinTweaksConfig || {};
            const currentKefinRoot = currentConfigSource.kefinTweaksRoot || defaultConfig.kefinTweaksRoot;
            defaultConfig.kefinTweaksRoot = currentKefinRoot;
            // Ensure enabled field is set (defaults to true if not present)
            if (defaultConfig.enabled === undefined) {
                defaultConfig.enabled = true;
            }
            // Store enabled state globally for use in modal
            window.KefinTweaksConfigEnabled = defaultConfig.enabled !== false;

            // Run migration if needed
            const migratedConfig = await migrateLegacyHomeScreenConfig(defaultConfig);
            
            // Save migrated config to JS Injector for future use
            await saveConfigToJavaScriptInjector(migratedConfig); */
            
            return window.KefinTweaksConfig;
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error getting config, falling back to defaults:', error);
            // Fallback to defaults if anything fails
            try {
                return await loadDefaultConfig();
            } catch (fallbackError) {
                console.error('[KefinTweaks Configuration] Error loading default config as fallback:', fallbackError);
                // Return empty config structure as last resort
                return {
                    kefinTweaksRoot: '',
                    scripts: {},
                    homeScreen: {},
                    search: {},
                    skins: [],
                    defaultSkin: null,
                    themes: [],
                    customMenuLinks: []
                };
            }
        }
    }

    // Import/Export Logic
    async function showExportDialog(config) {
        const customSections = config.homeScreen?.customSections || [];
        const seasonalSeasons = config.homeScreen?.seasonal?.seasons || [];
        
        if (customSections.length === 0 && seasonalSeasons.length === 0) {
            alert('没有找到可导出的自定义板块或季节配置。');
            return;
        }

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="content-primary">
                <div class="listItemBodyText" style="margin-bottom: 1em;">选择要导出的板块：</div>
                
                ${customSections.length > 0 ? `
                <div style="margin-bottom: 1.5em;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em;">
                        <h3 class="listItemBodyText" style="margin: 0;">自定义板块</h3>
                        <div>
                            <button type="button" class="emby-button" onclick="this.closest('.content-primary').querySelectorAll('.export-custom-check').forEach(c => c.checked = true)" style="font-size: 0.9em;">全选</button>
                            <button type="button" class="emby-button" onclick="this.closest('.content-primary').querySelectorAll('.export-custom-check').forEach(c => c.checked = false)" style="font-size: 0.9em;">全不选</button>
                        </div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); border-radius: 4px; padding: 0.5em;">
                        ${customSections.map((section, i) => `
                            <label class="checkboxContainer" style="display: flex; align-items: center; padding: 0.5em;">
                                <input type="checkbox" class="export-custom-check" data-index="${i}" checked>
                                <span class="listItemBodyText" style="margin-left: 0.5em;">${section.name || '未命名板块'}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>` : ''}

                ${seasonalSeasons.length > 0 ? `
                <div style="margin-bottom: 1.5em;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em;">
                        <h3 class="listItemBodyText" style="margin: 0;">季节主题季</h3>
                        <div>
                            <button type="button" class="emby-button" onclick="this.closest('.content-primary').querySelectorAll('.export-seasonal-check').forEach(c => c.checked = true)" style="font-size: 0.9em;">全选</button>
                            <button type="button" class="emby-button" onclick="this.closest('.content-primary').querySelectorAll('.export-seasonal-check').forEach(c => c.checked = false)" style="font-size: 0.9em;">全不选</button>
                        </div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); border-radius: 4px; padding: 0.5em;">
                        ${seasonalSeasons.map((season, i) => `
                            <label class="checkboxContainer" style="display: flex; align-items: center; padding: 0.5em;">
                                <input type="checkbox" class="export-seasonal-check" data-index="${i}" checked>
                                <span class="listItemBodyText" style="margin-left: 0.5em;">${season.name || '未命名季'}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>` : ''}
                
                <div id="exportOutputContainer" style="display: none; margin-top: 1.5em;">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">导出 JSON：</div>
                    <textarea id="exportOutput" class="fld emby-textarea" readonly style="width: 100%; height: 200px; font-family: monospace;"></textarea>
                    <div style="display: flex; gap: 1em; margin-top: 0.5em;">
                        <button type="button" class="emby-button raised" id="copyExportBtn">复制到剪贴板</button>
                        <button type="button" class="emby-button raised" id="downloadExportBtn">下载 .json</button>
                    </div>
                </div>
            </div>
        `;

        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.gap = '0.75em';
        footer.innerHTML = `
            <button class="emby-button raised button-submit" id="generateExportBtn" style="padding: 0.75em 2em;">生成 JSON</button>
            <button class="emby-button raised" onclick="window.ModalSystem.close('kefinTweaksExportModal')">关闭</button>
        `;

        window.ModalSystem.create({
            id: 'kefinTweaksExportModal',
            title: '导出自定义板块',
            content: content,
            footer: footer,
            closeOnBackdrop: true,
            closeOnEscape: true,
            onOpen: (modalInstance) => {
                const generateBtn = modalInstance.dialogFooter.querySelector('#generateExportBtn');
                generateBtn.addEventListener('click', () => {
                    const selectedCustomIndices = Array.from(content.querySelectorAll('.export-custom-check:checked')).map(c => parseInt(c.dataset.index));
                    const selectedSeasonalIndices = Array.from(content.querySelectorAll('.export-seasonal-check:checked')).map(c => parseInt(c.dataset.index));
                    
                    if (selectedCustomIndices.length === 0 && selectedSeasonalIndices.length === 0) {
                        alert('请至少选择一个要导出的条目。');
                        return;
                    }

                    const exportData = {
                        meta: {
                            version: '1.0',
                            date: new Date().toISOString(),
                            source: 'KefinTweaks'
                        },
                        customSections: selectedCustomIndices.map(i => customSections[i]),
                        seasonalSeasons: selectedSeasonalIndices.map(i => seasonalSeasons[i])
                    };

                    const json = JSON.stringify(exportData, null, 2);
                    const outputContainer = content.querySelector('#exportOutputContainer');
                    const output = content.querySelector('#exportOutput');
                    
                    output.value = json;
                    outputContainer.style.display = 'block';
                    generateBtn.style.display = 'none';
                    
                    content.querySelector('#copyExportBtn').addEventListener('click', () => {
                        output.select();
                        document.execCommand('copy');
                        if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                            window.KefinTweaksToaster.toast('已复制到剪贴板');
                        }
                    });
                    
                    content.querySelector('#downloadExportBtn').addEventListener('click', () => {
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `kefin-tweaks-export-${new Date().toISOString().slice(0,10)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    });
                });
            }
        });
    }


    async function showCommunityImportDialog(config, saveConfigCallback) {
        // Ensure community config is available
        if (!window.KefinCommunityConfig) {
            alert('社区配置未加载。请确保已加载 homeScreenConfig-community.js。');
            return;
        }

        const communityCollections = window.KefinCommunityConfig.collections || [];
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="content-primary">
                <div class="listItemBodyText" style="margin-bottom: 1em;">选择要导入的主屏幕板块：</div>
                <div class="listItemBodyText" style="margin-bottom: 1em;">这些板块由和你一样的社区成员创建并提交！</div>
                <div class="listItemBodyText secondary" style="margin-bottom: 1.5em;">在此提交你自己的主屏幕板块 <a href="${(window.KefinTweaksLoader?.UPSTREAM?.repository || '')}/discussions/64" target="_blank" class="button-link">点这里。</a></div>
                
                <div style="margin-bottom: 1.5em;">
                    <select id="communityCollectionSelect" class="emby-select-withcolor emby-select" style="width: 100%; padding: 0.5em; background: rgba(255,255,255,0.1); color: inherit; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">
                        <option value="">选择一个合集...</option>
                        ${communityCollections.map((c, i) => `<option value="${i}">${c.name}（作者：${c.author}）</option>`).join('')}
                    </select>
                </div>
                
                <div id="collectionDescription" style="margin-bottom: 1.5em; font-style: italic; color: #ccc; display: none; padding: 1em; background: rgba(0,0,0,0.2); border-radius: 4px;"></div>

                <div id="importSelectionContainer" style="display: none; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1em;">
                    <div class="listItemBodyText" style="margin-bottom: 1em; font-weight: bold;">此合集包含的板块：</div>
                    <div id="importSelectionList"></div>
                </div>
            </div>
        `;

        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.gap = '0.75em';
        footer.innerHTML = `
            <button class="emby-button raised button-submit" id="confirmCommunityImportBtn" style="padding: 0.75em 2em; display: none;">导入所选</button>
            <button class="emby-button raised" onclick="window.ModalSystem.close('kefinTweaksCommunityImportModal')">取消</button>
        `;

        let selectedCollection = null;

        window.ModalSystem.create({
            id: 'kefinTweaksCommunityImportModal',
            title: '导入社区板块',
            content: content,
            footer: footer,
            closeOnBackdrop: false,
            closeOnEscape: true,
            onOpen: (modalInstance) => {
                const select = content.querySelector('#communityCollectionSelect');
                const descContainer = content.querySelector('#collectionDescription');
                const selectionContainer = content.querySelector('#importSelectionContainer');
                const selectionList = content.querySelector('#importSelectionList');
                const confirmBtn = modalInstance.dialogFooter.querySelector('#confirmCommunityImportBtn');

                select.addEventListener('change', () => {
                    const index = select.value;
                    if (index === '') {
                        selectedCollection = null;
                        descContainer.style.display = 'none';
                        selectionContainer.style.display = 'none';
                        confirmBtn.style.display = 'none';
                        return;
                    }

                    selectedCollection = communityCollections[parseInt(index)];
                    
                    // Show description
                    descContainer.textContent = selectedCollection.description || '暂无描述。';
                    descContainer.style.display = 'block';

                    // Render sections list
                    let html = '';
                    if (selectedCollection.sections && selectedCollection.sections.length > 0) {
                        html += `
                            <div style="background: rgba(0,0,0,0.2); border-radius: 4px; padding: 0.5em;">
                                ${selectedCollection.sections.map((s, i) => `
                                    <label class="checkboxContainer" style="display: flex; align-items: center; padding: 0.5em;">
                                        <input type="checkbox" class="import-community-check" data-index="${i}" checked>
                                        <span class="listItemBodyText" style="margin-left: 0.5em;">${s.name || '未命名'}（${s.type}）</span>
                                    </label>
                                `).join('')}
                            </div>`;
                    } else {
                        html = '<div class="listItemBodyText secondary">此合集中没有板块。</div>';
                    }

                    selectionList.innerHTML = html;
                    selectionContainer.style.display = 'block';
                    confirmBtn.style.display = 'inline-block';
                });

                confirmBtn.addEventListener('click', async () => {
                    if (!selectedCollection) return;

                    const selectedIndices = Array.from(content.querySelectorAll('.import-community-check:checked')).map(c => parseInt(c.dataset.index));
                    
                    if (selectedIndices.length === 0) {
                        alert('请至少选择一个要导入的板块。');
                        return;
                    }

                    // Import logic
                    if (!config.homeScreen) config.homeScreen = {};
                    if (!config.homeScreen.customSections) config.homeScreen.customSections = [];
                    
                    let importedCount = 0;
                    selectedIndices.forEach(i => {
                        const section = JSON.parse(JSON.stringify(selectedCollection.sections[i])); // Deep copy
                        // Regenerate ID to avoid collision
                        if (section.id) section.id = `${section.id}_community_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                        config.homeScreen.customSections.push(section);
                        importedCount++;
                    });

                    if (importedCount > 0) {
                        await saveConfigCallback(config);
                        alert(`成功导入 ${importedCount} 个板块。页面即将刷新。`);
                        window.location.reload();
                    } else {
                        window.ModalSystem.close('kefinTweaksCommunityImportModal');
                    }
                });
            }
        });
    }

    async function showImportDialog(config, saveConfigCallback) {
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="content-primary">
                <div class="listItemBodyText" style="margin-bottom: 1em;">粘贴 JSON 内容或 URL（Raw GitHub、Gist、Pastebin）：</div>
                <textarea id="importInput" class="fld emby-textarea" style="width: 100%; height: 150px; font-family: monospace;" placeholder='{"customSections": [...]} 或 https://...'></textarea>
                
                <div id="importSelectionContainer" style="display: none; margin-top: 1.5em; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1em;">
                    <div class="listItemBodyText" style="margin-bottom: 1em; font-weight: bold;">找到可导入的项目：</div>
                    <div id="importSelectionList"></div>
                </div>
            </div>
        `;

        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.gap = '0.75em';
        footer.innerHTML = `
            <button class="emby-button raised button-submit" id="loadImportBtn" style="padding: 0.75em 2em;">加载</button>
            <button class="emby-button raised button-submit" id="confirmImportBtn" style="padding: 0.75em 2em; display: none;">导入所选</button>
            <button class="emby-button raised" onclick="window.ModalSystem.close('kefinTweaksImportModal')">取消</button>
        `;

        let parsedData = null;

        window.ModalSystem.create({
            id: 'kefinTweaksImportModal',
            title: '导入自定义板块',
            content: content,
            footer: footer,
            closeOnBackdrop: false,
            closeOnEscape: true,
            onOpen: (modalInstance) => {
                const loadBtn = modalInstance.dialogFooter.querySelector('#loadImportBtn');
                const confirmBtn = modalInstance.dialogFooter.querySelector('#confirmImportBtn');
                const input = content.querySelector('#importInput');
                const selectionContainer = content.querySelector('#importSelectionContainer');
                const selectionList = content.querySelector('#importSelectionList');

                loadBtn.addEventListener('click', async () => {
                    const rawInput = input.value.trim();
                    if (!rawInput) return;

                    loadBtn.disabled = true;
                    loadBtn.textContent = '加载中...';

                    try {
                        let jsonStr = rawInput;
                        // Check if URL
                        if (rawInput.startsWith('http://') || rawInput.startsWith('https://')) {
                            const res = await fetch(rawInput);
                            if (!res.ok) throw new Error(`获取 URL 失败：${res.status}`);
                            jsonStr = await res.text();
                        }

                        parsedData = JSON.parse(jsonStr);
                        if (!parsedData.customSections && !parsedData.seasonalSeasons && !Array.isArray(parsedData)) {
                            throw new Error('无效的格式：未找到板块。');
                        }
                        
                        // Handle legacy/array-only format if necessary (assume customSections)
                        if (Array.isArray(parsedData)) {
                            parsedData = { customSections: parsedData };
                        }

                        // Render selection
                        let html = '';
                        if (parsedData.customSections && parsedData.customSections.length > 0) {
                            html += `
                                <div style="margin-bottom: 1em;">
                                    <h3 class="listItemBodyText">自定义板块</h3>
                                    <div style="background: rgba(0,0,0,0.2); border-radius: 4px; padding: 0.5em;">
                                        ${parsedData.customSections.map((s, i) => `
                                            <label class="checkboxContainer" style="display: flex; align-items: center; padding: 0.5em;">
                                                <input type="checkbox" class="import-custom-check" data-index="${i}" checked>
                                                <span class="listItemBodyText" style="margin-left: 0.5em;">${s.name || '未命名'}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>`;
                        }
                        if (parsedData.seasonalSeasons && parsedData.seasonalSeasons.length > 0) {
                            html += `
                                <div style="margin-bottom: 1em;">
                                    <h3 class="listItemBodyText">季节主题季</h3>
                                    <div style="background: rgba(0,0,0,0.2); border-radius: 4px; padding: 0.5em;">
                                        ${parsedData.seasonalSeasons.map((s, i) => `
                                            <label class="checkboxContainer" style="display: flex; align-items: center; padding: 0.5em;">
                                                <input type="checkbox" class="import-seasonal-check" data-index="${i}" checked>
                                                <span class="listItemBodyText" style="margin-left: 0.5em;">${s.name || '未命名'}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>`;
                        }

                        if (!html) throw new Error('数据中没有有效的板块。');

                        selectionList.innerHTML = html;
                        selectionContainer.style.display = 'block';
                        loadBtn.style.display = 'none';
                        confirmBtn.style.display = 'inline-block';
                        input.disabled = true;

                    } catch (err) {
                        alert('加载数据时出错：' + err.message);
                        loadBtn.disabled = false;
                        loadBtn.textContent = '加载';
                    }
                });

                confirmBtn.addEventListener('click', async () => {
                    if (!parsedData) return;

                    const selectedCustomIndices = Array.from(content.querySelectorAll('.import-custom-check:checked')).map(c => parseInt(c.dataset.index));
                    const selectedSeasonalIndices = Array.from(content.querySelectorAll('.import-seasonal-check:checked')).map(c => parseInt(c.dataset.index));

                    // Import logic
                    if (!config.homeScreen) config.homeScreen = {};
                    
                    let importedCount = 0;

                    // Import Custom Sections
                    if (selectedCustomIndices.length > 0 && parsedData.customSections) {
                        if (!config.homeScreen.customSections) config.homeScreen.customSections = [];
                        
                        selectedCustomIndices.forEach(i => {
                            const section = parsedData.customSections[i];
                            // Regenerate ID to avoid collision
                            if (section.id) section.id = `${section.id}_imported_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                            config.homeScreen.customSections.push(section);
                            importedCount++;
                        });
                    }

                    // Import Seasonal Seasons
                    if (selectedSeasonalIndices.length > 0 && parsedData.seasonalSeasons) {
                        if (!config.homeScreen.seasonal) config.homeScreen.seasonal = {};
                        if (!config.homeScreen.seasonal.seasons) config.homeScreen.seasonal.seasons = [];
                        
                        selectedSeasonalIndices.forEach(i => {
                            const season = parsedData.seasonalSeasons[i];
                            // Regenerate IDs for internal sections if needed?
                            if (season.sections) {
                                season.sections.forEach(s => {
                                    if (s.id) s.id = `${s.id}_imported_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                                });
                            }
                            config.homeScreen.seasonal.seasons.push(season);
                            importedCount++;
                        });
                    }

                    if (importedCount > 0) {
                        await saveConfigCallback(config);
                        alert(`成功导入 ${importedCount} 个项目。页面即将刷新。`);
                        window.location.reload();
                    } else {
                        window.ModalSystem.close('kefinTweaksImportModal');
                    }
                });
            }
        });
    }

    // Inject responsive CSS for the configuration modal
    function injectConfigModalCSS() {
        const styleId = 'kefintweaks-config-modal-css';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            :not(.layout-mobile) #${MODAL_ID} .modal-content-wrapper {
                max-width: 90vw;
                width: 1400px;
                max-height: 90vh;
                overflow-y: auto;
                background: var(--background-color, #1a1a1a);
                border-radius: 8px;
            }
            
            #${MODAL_ID} .content-primary {
                max-width: 1400px;
                margin: 0 auto;
                padding: 1.5em;
            }
            
            #${MODAL_ID} .paperList {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                padding: 1em;
            }
            
            #${MODAL_ID} .listItem {
                transition: background-color 0.2s ease;
            }
            
            #${MODAL_ID} .listItem:hover {
                background-color: rgba(255, 255, 255, 0.02);
            }
            
            #${MODAL_ID} textarea.fld {
                resize: vertical;
                min-height: 200px;
            }
            
            #${MODAL_ID} details summary {
                user-select: none;
                overflow: visible;
            }
            
            #${MODAL_ID} details summary:hover {
                opacity: 0.8;
            }
            
            #${MODAL_ID} pre {
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            
            /* Custom section collapsible styling */
            #${MODAL_ID} .custom-section-summary {
                position: relative;
                list-style: none;
            }
            
            #${MODAL_ID} .custom-section-summary::-webkit-details-marker {
                display: none;
            }
            
            #${MODAL_ID} .custom-section-summary::marker {
                display: none;
            }
            
            #${MODAL_ID} details[open] .custom-section-summary .material-icons {
                transform: rotate(90deg);
            }
            
            #${MODAL_ID} .custom-section-summary .material-icons {
                transition: transform 0.2s ease;
            }
            
            /* Recently released subsection styling */
            #${MODAL_ID} .recently-released-subsection-summary {
                position: relative;
                list-style: none;
            }
            
            #${MODAL_ID} .recently-released-subsection-summary::-webkit-details-marker {
                display: none;
            }
            
            #${MODAL_ID} .recently-released-subsection-summary::marker {
                display: none;
            }
            
            #${MODAL_ID} details[open] .recently-released-subsection-summary .material-icons {
                transform: rotate(90deg);
            }
            
            #${MODAL_ID} .recently-released-subsection-summary .material-icons {
                transition: transform 0.2s ease;
            }
            
            /* Seasonal season collapsible styling */
            #${MODAL_ID} .seasonal-season-summary {
                position: relative;
                list-style: none;
            }
            
            #${MODAL_ID} .seasonal-season-summary::-webkit-details-marker {
                display: none;
            }
            
            #${MODAL_ID} .seasonal-season-summary::marker {
                display: none;
            }
            
            #${MODAL_ID} details[open] .seasonal-season-summary .material-icons {
                transform: rotate(90deg);
            }
            
            #${MODAL_ID} .seasonal-season-summary .material-icons {
                transition: transform 0.2s ease;
            }
            
            /* Seasonal section collapsible styling (sections within seasons) */
            #${MODAL_ID} .seasonal-section-summary {
                position: relative;
                list-style: none;
            }
            
            #${MODAL_ID} .seasonal-section-summary::-webkit-details-marker {
                display: none;
            }
            
            #${MODAL_ID} .seasonal-section-summary::marker {
                display: none;
            }
            
            #${MODAL_ID} details[open] .seasonal-section-summary .material-icons {
                transform: rotate(90deg);
            }
            
            #${MODAL_ID} .seasonal-section-summary .material-icons {
                transition: transform 0.2s ease;
            }
            
            /* Discovery section type collapsible styling */
            #${MODAL_ID} .discovery-section-type-summary {
                position: relative;
                list-style: none;
            }
            
            #${MODAL_ID} .discovery-section-type-summary::-webkit-details-marker {
                display: none;
            }
            
            #${MODAL_ID} .discovery-section-type-summary::marker {
                display: none;
            }
            
            #${MODAL_ID} details[open] .discovery-section-type-summary .material-icons {
                transform: rotate(90deg);
            }
            
            #${MODAL_ID} .discovery-section-type-summary .material-icons {
                transition: transform 0.2s ease;
            }
            
            /* Skins JSON collapsible styling */
            #${MODAL_ID} details.listItem[open] summary .material-icons {
                transform: rotate(90deg);
            }
            
            #${MODAL_ID} details.listItem summary .material-icons {
                transition: transform 0.2s ease;
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                #${MODAL_ID} .modal-content-wrapper {
                    width: 95vw;
                    max-height: 95vh;
                }
                
                #${MODAL_ID} .content-primary {
                    padding: 1em;
                }
                
                #${MODAL_ID} .paperList {
                    padding: 0.75em;
                }
                
                #${MODAL_ID} [style*="grid-template-columns"] {
                    grid-template-columns: 1fr !important;
                }
            }
            
            @media (max-width: 480px) {
                #${MODAL_ID} .content-primary {
                    padding: 0.75em;
                }
                
                #${MODAL_ID} .pageTitle {
                    font-size: 1.5em;
                }
                
                #${MODAL_ID} input.fld,
                #${MODAL_ID} textarea.fld {
                    font-size: 16px; /* Prevents zoom on iOS */
                }
            }
        `;
        document.head.appendChild(style);
    }


    // Build the configuration page content
    function buildConfigPageContent(config, libraries = []) {
        const scripts = config.scripts || {};

        const isEnabled = window.KefinTweaksConfig?.enabled !== false;
        
        return `
            <div class="paperList" style="padding: 0.2em 1em;">
                <div class="listItem">
                    <div class="listItemContent" style="display: flex; gap: 1em; align-items: center; flex-wrap: wrap;">
                        <label class="checkboxContainer" style="display: flex; align-items: center; gap: 0.75em; cursor: pointer;">
                            <input type="checkbox" id="kefinTweaksEnabled" class="checkbox" ${isEnabled ? 'checked' : ''}>
                            <span id="kefinTweaksEnabledLabel" class="listItemBodyText" style="margin: 0;">${isEnabled ? '已启用' : '已禁用'}</span>
                        </label>
                        <button class="emby-button raised" id="changeKefinTweaksSourceBtn" style="padding: 0.75em 2em; font-size: 1em;" title="KefinTweaks 的文件加载来源（固定文件夹或你自己的服务器）、关闭或卸载。">
                            <span>插件设置</span>
                        </button>
                        <button class="emby-button raised" id="exportConfigBtn" style="padding: 0.75em 2em; font-size: 1em;">
                            <span>导出</span>
                        </button>
                        <button class="emby-button raised" id="importConfigBtn" style="padding: 0.75em 2em; font-size: 1em;">
                            <span>导入</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="paperList" style="margin-bottom: 1em;">
                <div class="listItem" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <h3 class="listItemBodyText" style="margin-bottom: 0.25em;">功能配置</h3>
                        <div class="listItemBodyText secondary">逐个开启或关闭 KefinTweaks 功能。停用功能时会保留其现有配置。</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.5em;">
                    ${buildScriptToggles(scripts)}
                </div>
            </div>


        `;
    }

    // Extract GitHub repository URL from skin configuration
    function getSkinGitHubUrl(skin) {
        // Check if skin has explicit github field
        if (skin.github) {
            return skin.github;
        }
        
        // Try to extract from jsdelivr GitHub CDN URLs
        if (skin.url && Array.isArray(skin.url)) {
            for (const urlObj of skin.url) {
                if (urlObj.urls && Array.isArray(urlObj.urls)) {
                    for (const url of urlObj.urls) {
                        // Match pattern: https://cdn.jsdelivr.net/gh/{owner}/{repo}@...
                        const match = url.match(/https:\/\/cdn\.jsdelivr\.net\/gh\/([^\/]+)\/([^\/@]+)/);
                        if (match) {
                            const owner = match[1];
                            const repo = match[2];
                            return `https://github.com/${owner}/${repo}`;
                        }
                    }
                }
            }
        }
        
        return null;
    }

    // Build skin toggle switches
    /**
     * Build dropdown options for skins that have optional includes
     * @param {Array} skins - Array of skin configurations
     * @returns {string} HTML string for dropdown options
     */
    function buildOptionalIncludesSkinOptions(skins) {
        const skinsWithOptionalIncludes = skins.filter(skin => 
            skin.optionalIncludes && skin.optionalIncludes.length > 0
        );
        
        return skinsWithOptionalIncludes.map(skin => 
            `<option value="${skin.name}">${skin.name}</option>`
        ).join('');
    }
    
    /**
     * Extract author from URL (for display purposes)
     * @param {string} url - The URL
     * @returns {string} Author name or empty string
     */
    function extractAuthorFromUrl(url) {
        if (!url) return '';
        try {
            // Try to extract GitHub username from jsdelivr URLs
            const jsdelivrMatch = url.match(/cdn\.jsdelivr\.net\/gh\/([^\/]+)\//);
            if (jsdelivrMatch) {
                return jsdelivrMatch[1];
            }
        } catch (e) {
            // Ignore errors
        }
        return '';
    }
    
    /**
     * Generate optional include key (same format as skinManager)
     * @param {string} skinName - The skin name or "global"
     * @param {string} author - The author name
     * @param {string} url - The URL
     * @returns {string} The generated key
     */
    function generateOptionalIncludeKey(skinName, author, url) {
        const normalizedSkinName = skinName === 'global' ? 'global' : skinName.replace(/\s+/g, '_');
        const filename = url ? url.split('?')[0].split('#')[0].split('/').pop() : '';
        const normalizedAuthor = (author || '').replace(/\s+/g, '_');
        return `${normalizedSkinName}-${normalizedAuthor}-${filename}`;
    }
    
    /**
     * Extract filename from URL
     * @param {string} url - The URL
     * @returns {string} The filename
     */
    function extractFilenameFromUrl(url) {
        if (!url) return '';
        try {
            const urlWithoutParams = url.split('?')[0].split('#')[0];
            const pathParts = urlWithoutParams.split('/');
            return pathParts[pathParts.length - 1] || '';
        } catch (e) {
            return '';
        }
    }
    
    /**
     * Build the optional includes editor UI
     * @param {string} category - "global" or skin name
     * @param {Object} config - The KefinTweaksConfig object
     * @param {Array} skins - Array of all skins
     * @returns {string} HTML string for the editor
     */
    function buildOptionalIncludesEditor(category, config, skins) {
        let optionalIncludes = [];
        
        if (category === 'global') {
            // Get global optional includes from defaults + admin config
            const defaultGlobalIncludes = window.KefinTweaksDefaultSkinsConfig?.globalOptionalIncludes || [];
            optionalIncludes = defaultGlobalIncludes.map(include => ({ ...include }));
            
            // Merge with admin config (admin can override enabled state)
            const adminOptionalIncludes = config.optionalIncludes || [];
            adminOptionalIncludes.forEach(adminEntry => {
                if (typeof adminEntry === 'object' && adminEntry.key) {
                    // Extract info from key: global-author-filename
                    const keyParts = adminEntry.key.split('-');
                    if (keyParts[0] === 'global' && keyParts.length >= 3) {
                        const author = keyParts[1];
                        const filename = keyParts.slice(2).join('-');
                        
                        // Find matching include by URL
                        const matchingInclude = optionalIncludes.find(inc => {
                            const incAuthor = extractAuthorFromUrl(inc.url);
                            const incFilename = extractFilenameFromUrl(inc.url);
                            return incAuthor === author && incFilename === filename;
                        });
                        
                        if (matchingInclude) {
                            matchingInclude.enabled = adminEntry.enabled;
                        } else {
                            // Admin added a new include (we'd need URL, but for now just show it)
                            optionalIncludes.push({
                                name: filename.replace('.css', '').replace(/-/g, ' '),
                                url: '', // We don't have the URL stored, would need to enhance
                                enabled: adminEntry.enabled,
                                key: adminEntry.key
                            });
                        }
                    }
                }
            });
        } else {
            // Get skin-specific optional includes
            const skin = skins.find(s => s.name === category);
            if (skin && skin.optionalIncludes) {
                optionalIncludes = skin.optionalIncludes.map(include => {
                    const author = extractAuthorFromUrl(include.url);
                    const key = generateOptionalIncludeKey(category, author, include.url);
                    
                    // Check admin config for enabled state
                    const adminOptionalIncludes = config.optionalIncludes || [];
                    const adminEntry = adminOptionalIncludes.find(entry => 
                        typeof entry === 'object' && entry.key === key
                    );
                    
                    return {
                        ...include,
                        key: key,
                        enabled: adminEntry ? adminEntry.enabled : (include.enabled || false)
                    };
                });
            }
        }
        
        if (optionalIncludes.length === 0) {
            return `
                <div class="listItemBodyText secondary" style="padding: 1em; text-align: center; opacity: 0.7;">
                    没有适用于${category === 'global' ? '全局选项' : category}的可选 CSS 模块。
                </div>
            `;
        }
        
        return `
            <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                配置默认启用哪些可选 CSS 模块。用户可以在个人设置中单独覆盖。
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5em;">
                ${optionalIncludes.map((include, index) => {
                    const author = extractAuthorFromUrl(include.url);
                    const key = include.key || generateOptionalIncludeKey(category, author, include.url);
                    const filename = include.url ? extractFilenameFromUrl(include.url) : '';
                    
                    return `
                        <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; background: rgba(255,255,255,0.02);">
                            <div class="listItemContent">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5em; gap: 0.5em;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div class="listItemBodyText" style="font-weight: 500; margin-bottom: 0.25em;">${include.name}</div>
                                        ${author ? `<div class="listItemBodyText secondary" style="font-size: 0.85em;">作者：<a href="https://github.com/${author}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">${author}</a></div>` : ''}
                                    </div>
                                    <input type="checkbox" 
                                           id="optionalInclude_${category}_${index}" 
                                           class="checkbox optionalIncludeCheckbox" 
                                           data-category="${category}"
                                           data-key="${key}"
                                           data-url="${include.url || ''}"
                                           ${include.enabled ? 'checked' : ''}
                                           style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; margin-top: 0.125em;">
                                </div>
                                ${filename ? `<div class="listItemBodyText secondary" style="font-size: 0.75em; opacity: 0.5; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: rtl;" title="${include.url}">${filename}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    function buildSkinToggles(skins, skinSources = {}) {
        return skins.map(skin => {
            const isEnabled = skin.enabled !== false; // Default to true if not set
            const githubUrl = getSkinGitHubUrl(skin);
            const source = skinSources[skin.name] || 'default';
            
            // Determine styling based on source
            let borderStyle = '1px solid rgba(255,255,255,0.1)';
            let backgroundStyle = 'rgba(255,255,255,0.02)';
            let badgeText = '';
            let badgeStyle = '';
            let badgeIcon = '';
            
            if (source === 'default') {
                backgroundStyle = 'rgba(255,255,255,0.01)';
                badgeText = 'D';
                badgeStyle = 'background: rgba(0,122,255,0.2); color: rgba(0,122,255,0.9);';
            } else if (source === 'overridden') {
                borderStyle = '2px solid rgba(0, 122, 255, 0.5)';
                backgroundStyle = 'rgba(0,122,255,0.05)';
                badgeIcon = 'warning';
                badgeStyle = 'color: rgba(255,165,0,0.9);';
            } else if (source === 'custom') {
                // Custom skins use default styling
            }
            
            // Determine tooltip text
            let tooltipText = '';
            if (source === 'default') {
                tooltipText = '此皮肤由 KefinTweaks 自动包含';
            } else if (source === 'overridden') {
                tooltipText = '此默认皮肤已被自定义配置覆盖';
            } else if (githubUrl) {
                tooltipText = '在 GitHub 上查看';
            }
            
            return `
                <div class="listItem" data-skin-source="${source}" style="border: ${borderStyle}; border-radius: 4px; padding: 0.5em; background: ${backgroundStyle};" ${tooltipText ? `title="${tooltipText}"` : ''}>
                    <div class="listItemContent" style="display: flex; justify-content: space-between; align-items: center; gap: 0.5em;">
                        <div style="flex: 1; display: flex; align-items: center; gap: 0.5em; min-width: 0;">
                            ${githubUrl ? `
                                <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 0.4em; color: inherit; text-decoration: none; opacity: 0.85; transition: opacity 0.2s; min-width: 0;" title="在 GitHub 上查看" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'">
                                    <span class="listItemBodyText" style="font-weight: 500; font-size: 0.9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${skin.name}</span>
                                    <span class="material-icons" style="font-size: 1em; flex-shrink: 0;">info</span>
                                </a>
                            ` : `
                                <div class="listItemBodyText" style="font-weight: 500; font-size: 0.9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${skin.name}</div>
                            `}
                            ${badgeIcon ? `<span class="material-icons" style="font-size: 1.1em; ${badgeStyle}" title="${tooltipText}">${badgeIcon}</span>` : ''}
                            ${badgeText ? `<span style="font-size: 0.75em; padding: 0.15em 0.4em; border-radius: 3px; ${badgeStyle}">${badgeText}</span>` : ''}
                        </div>
                        ${buildJellyfinCheckbox(`skin_${skin.name.replace(/[^a-zA-Z0-9]/g, '_')}`, isEnabled, '', { 'data-skin-name': skin.name })}
                </div>
            </div>
        `;
        }).join('');
    }

    // Build script toggle switches
    function buildScriptToggles(scripts) {
        // Features that have configuration options (not just toggles)
        const featuresWithConfig = new Set(['homeScreen', 'search', 'flattenSingleSeasonShows', 'skinManager', 'customMenuLinks', 'seriesInfo', 'versionPreferences', 'thumbnailScrubber', 'watchTogether', 'watchlist', 'userManager', 'requestSeerr', 'mediaBadges', 'kidsMode']);
        
        const scriptNames = [
            { key: 'watchlist', label: '片单', desc: '允许用户将条目添加到自己的片单。片单页面展示用户片单中所有条目的总览，以及剧集观看进度和电影观看历史。还包含一个统计页面，概述用户的观看数据。' },
            { key: 'homeScreen', label: '增强主屏幕', desc: '在主页添加自定义主屏幕板块和“发现引擎”。可基于流派、标签、播放列表、合集或针对特定条目类型的搜索词创建板块。使用“精选”功能，以图片轮播/幻灯片突出显示特定板块。' },
            { key: 'search', label: '增强搜索', desc: '默认只搜索较少的内容类型，从而提升搜索速度。提供选项指定要搜索的内容类型。与 Jellyfin Enhanced 插件的 Jellysearch 搜索以及 Meilisearch 插件完全兼容。' },
            { key: 'infiniteScroll', label: '无限滚动', desc: '为电影和剧集的媒体库页面添加无限滚动' },
            { key: 'removeContinue', label: '移除“继续观看”', desc: '支持从“继续观看”板块中移除条目' },
            { key: 'skinManager', label: '皮肤管理器', desc: '皮肤选择与管理 - 在页眉和显示偏好设置中添加皮肤下拉菜单' },
            { key: 'headerTabs', label: '页眉标签页', desc: '允许直接导航到指定媒体库页面的特定标签页区域。完全支持 Jellyfin 默认落地页。' },
            { key: 'customMenuLinks', label: '自定义菜单链接', desc: '在左侧导航菜单中添加自定义菜单链接' },
            { key: 'hamburgerMenu', label: '桌面端汉堡菜单', desc: '在桌面端（900px 以上）显示“打开菜单”按钮，像移动端布局一样打开左侧导航抽屉，包含媒体库和自定义菜单链接。' },
            { key: 'games', label: '游戏', desc: '在侧边菜单中添加“游戏”链接，用于 Movie LUT 及其他媒体库游戏' },
            { key: 'breadcrumbs', label: '面包屑导航', desc: '适用于电影、剧集和音乐的面包屑导航。可在季/集以及专辑/歌曲之间快速切换。' },
            { key: 'playlist', label: '播放列表体验', desc: '改进播放列表页面导航：只有在按下“播放”按钮时才会播放。点击条目会进入该条目的页面。' },
            { key: 'itemDetailsCollections', label: '详情页显示合集', desc: '在条目详情页显示所属合集（“收录于”区域）' },
            { key: 'flattenSingleSeasonShows', label: '剧集页显示单集', desc: '直接在剧集页面显示单集。单季剧集显示全部单集；多季剧集显示“接下来播放”所在季的单集（若没有则显示第 1 季）。' },
            { key: 'seriesInfo', label: '剧集信息+', desc: '在剧集和季页面添加季数和集数统计。并像单集页面一样添加“结束时间”。' },
            { key: 'versionPreferences', label: '条目版本偏好', desc: '管理条目的不同版本和版次的显示方式。按优先的版本/版次关键词对条目详情页的媒体源下拉菜单重新排序并清理。' },
            { key: 'collections', label: '合集排序', desc: '合集页面的排序功能' },
            { key: 'subtitleSearch', label: '字幕搜索', desc: '直接从视频 OSD 搜索并下载字幕' },
            { key: 'backdropLeakFix', label: '背景图内存泄漏修复', desc: '修复标签页未聚焦时背景图片导致的内存泄漏' },
            { key: 'dashboardButtonFix', label: '控制台按钮修复', desc: '改进控制台的返回按钮行为 - 防止返回到新标签页浏览器页面' },
            { key: 'thumbnailScrubber', label: '进度条缩略图', desc: '类似 YouTube，将鼠标悬停在视频卡片底部 40px 区域时显示 trickplay 缩略图预览。需要 Jellyfin 生成的 trickplay 图片；在触屏设备上无效。' },
            { key: 'watchTogether', label: '一起观看', desc: '将其他 Jellyfin 账户加入“一起观看”分组，并在本设备上向所选账户同步已观看/观看中的播放状态。' },
            { key: 'userManager', label: '用户管理器', desc: '创建可复用的用户策略模板，在添加用户或批量编辑现有账户时套用。导入/导出功能稍后推出。' },
            { key: 'requestSeerr', label: '求片（Seerr）', desc: '一个“在 Seerr 上求片”按钮，会打开你的 Seerr / Jellyseerr：在搜索无结果或结果很少时（自动填入搜索词），以及在缺少媒体的条目（缺失单集、合集）上显示。通过编辑按钮设置 Seerr 地址。儿童模式用户不可见。' },
            { key: 'mediaBadges', label: '媒体信息角标', desc: '在电影和单集卡片及条目页面上显示 4K / 1080p、HDR / 杜比视界和音频（Atmos、DD+ 5.1 等）小角标。对当前可见的卡片分批懒加载读取，并在本次会话中保留。每个角标都可单独关闭。' },
            { key: 'jumpBar', label: '字母跳转栏', desc: '在电影、剧集和音乐网格（按名称排序）上添加 A-Z 字母栏，点击跳转到对应字母，并加载更多条目（通过无限滚动或下一页）直到目标位置。' },
            { key: 'kidsMode', label: '儿童模式', desc: '面向被 Jellyfin 限制只能访问部分媒体库或最高家长分级的用户：更大的卡片、无搜索、无求片按钮、无一起观看。由每个用户自己的 Jellyfin 设置驱动；编辑按钮可按用户强制开启或关闭。' }
        ];

        const defsByName = new Map(
            (window.KefinTweaks?.getScripts?.() || []).map((def) => [def.name, def])
        );
        // Prefer cache warmed by await getJellyfinMajorVersion() before opening the modal
        const major = window.KefinTweaks?._jellyfinMajorVersion ?? null;

        const visibleScripts = scriptNames.filter((script) => {
            const def = defsByName.get(script.key);
            if (!def?.versions?.length) return true;
            if (major == null) return false;
            return def.versions.includes(major);
        });

        return visibleScripts.map(script => {
            // Match injector defaults: most scripts on unless set false; opt-in scripts require true
            // a switch the saved configuration does not mention shows what the page load does: the loader's default (most opt-ins are off in this fork)
            const loaderDefault = window.KefinTweaksLoader?.DEFAULT_ENABLED_SCRIPTS?.[script.key];
            const isEnabled = script.key in scripts ? scripts[script.key] === true : loaderDefault === true;
            const hasConfig = featuresWithConfig.has(script.key);
            const configKey = script.key === 'flattenSingleSeasonShows' ? 'seriesEpisodes' : script.key;
            
            return `
                <div class="listItem feature-card" data-feature-key="${script.key}" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; background: rgba(255,255,255,0.02); ${hasConfig ? 'cursor: pointer;' : ''}" ${hasConfig ? `onclick="openFeatureConfigurationModal(event, '${script.key}')"` : ''}>
                    <div class="listItemContent">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75em;">
                            <div class="listItemBodyText" style="font-weight: 500;">${script.label}</div>
                            <div style="display: flex; align-items: center; gap: 0.5em;">
                                ${hasConfig ? `<button class="emby-button raised" data-feature-edit="${configKey}" style="padding: 0.35em 0.75em; font-size: 0.85em; min-width: auto;" title="配置 ${script.label}">
                                    <span class="material-icons" style="font-size: 1.1em; vertical-align: middle;">edit</span>
                                </button>` : ''}
                                ${buildJellyfinCheckbox(`script_${script.key}`, isEnabled, '', { 'data-script-key': script.key })}
                            </div>
                        </div>
                        <div class="listItemBodyText secondary" style="font-size: 0.9em; line-height: 1.4; width: 100%;">${script.desc}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function openFeatureConfigurationModal(event, featureKey) {
        // Check if the click target is the toggle switch or edit button
        const target = event.target;
        
        // Check if clicking on the toggle switch (checkbox, label, or container)
        const isCheckbox = target.closest('.checkboxContainer') || 
                               target.closest('.emby-checkbox-label') || 
                               target.closest('.emby-checkbox') ||
                               target.getAttribute('is') === 'emby-checkbox' ||
                               target.hasAttribute('data-embycheckbox');
        
        // Don't open modal if clicking on toggle switch or edit button
        if (isCheckbox) {
            return;
        }
        
        // Get the feature key from the card if not provided
        if (!featureKey) {
            const featureCard = event.target.closest('.feature-card');
            if (featureCard) {
                featureKey = featureCard.getAttribute('data-feature-key');
            }
        }
        
        if (!featureKey) {
            console.warn('[KefinTweaks Configuration] Could not determine feature key');
            return;
        }
        
        // Map feature key to config key (for flattenSingleSeasonShows -> seriesEpisodes)
        const configKey = featureKey === 'flattenSingleSeasonShows' ? 'seriesEpisodes' : featureKey;
        
        // Open the appropriate configuration modal
        if (window.KefinTweaksFeatureConfigs && window.KefinTweaksFeatureConfigs[configKey]) {
            const configModule = window.KefinTweaksFeatureConfigs[configKey];
            if (configModule.openConfigModal) {
                configModule.openConfigModal();
            } else {
                console.warn(`[KefinTweaks Configuration] No openConfigModal function found for ${configKey}`);
            }
        } else {
            console.warn(`[KefinTweaks Configuration] No configuration module found for ${configKey}`);
        }
    }
    
    // Expose function globally so it can be called from inline onclick handlers
    window.openFeatureConfigurationModal = openFeatureConfigurationModal;

    // Helper function to build Include Item Types badge field
    function buildIncludeItemTypesField(prefix, sectionIndex, sanitizedPrefix, currentTypes, sourceType) {
        // All available item types
        const allAvailableTypes = [
            'AggregateFolder', 'Audio', 'AudioBook', 'BasePluginFolder', 'Book', 'BoxSet', 'Channel', 
            'ChannelFolderItem', 'CollectionFolder', 'Episode', 'Folder', 'Genre', 'ManualPlaylistsFolder', 
            'Movie', 'LiveTvChannel', 'LiveTvProgram', 'MusicAlbum', 'MusicArtist', 'MusicGenre', 'MusicVideo', 
            'Person', 'Photo', 'PhotoAlbum', 'Playlist', 'PlaylistsFolder', 'Program', 'Recording', 'Season', 
            'Series', 'Studio', 'Trailer', 'TvChannel', 'TvProgram', 'UserRootFolder', 'UserView', 'Video', 'Year'
        ];
        
        const selectionLabel = currentTypes.length ? `已选 ${currentTypes.length} 项` : '选择条目类型';
        
        // Current types as badges
        const badgesHtml = currentTypes.map(typeName => `
            <span class="tag-badge" data-value="${typeName}" style="display: inline-flex; align-items: center; gap: 0.25em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; margin: 0.25em; font-size: 0.9em;">
                ${typeName}
                <button type="button" class="tag-badge-remove" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0; margin-left: 0.25em; font-size: 1.2em; line-height: 1; display: flex; align-items: center;" title="移除">×</button>
            </span>
        `).join('');
        
        const dropdownOptions = allAvailableTypes.map(typeName => {
            const isChecked = currentTypes.includes(typeName);
            return `
                <label class="includeItemTypes-option-label" style="display: flex; align-items: center; gap: 0.5em; padding: 0.35em 0; font-size: 0.9em;">
                    <input type="checkbox" class="includeItemTypes-option" data-type="${typeName}" value="${typeName}" ${isChecked ? 'checked' : ''} style="accent-color: rgba(0,122,255,0.8);">
                    <span>${typeName}</span>
                </label>
            `;
        }).join('');
        
        return `
            <div class="${prefix}_section_includeItemTypes_container" data-section-index="${sectionIndex}" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; position: static;">
                <div style="position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em;">
                        <div class="listItemBodyText">包含的条目类型</div>
                        <button type="button" class="badge-clear-all" data-section-index="${sectionIndex}" data-field="includeItemTypes" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; color: rgba(255,255,255,0.87); cursor: pointer; font-size: 0.85em;" title="清空">清空</button>
                    </div>
                    <div class="tag-badge-container includeItemTypes-badge-container" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-available-types="${allAvailableTypes.join(',')}" style="border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.5em; margin-bottom: 0.5em; background: rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 0.5em; position: relative;">
                        <button type="button" class="includeItemTypes-dropdown-toggle" data-section-index="${sectionIndex}" style="display: inline-flex; align-items: center; justify-content: space-between; gap: 0.5em; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.35em 0.75em; color: rgba(255,255,255,0.87); cursor: pointer; font-size: 0.9em;">
                            <span class="includeItemTypes-toggle-label">${selectionLabel}</span>
                            <span class="material-icons" style="font-size: 1.1em;">arrow_drop_down</span>
                        </button>
                        <div class="includeItemTypes-dropdown" data-section-index="${sectionIndex}" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; margin-top: 0.35em; z-index: 11000; background: rgba(26,26,26,0.98); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 0.75em; box-shadow: 0 4px 16px rgba(0,0,0,0.4); max-height: 260px; overflow-y: auto;">
                            <div style="display: flex; flex-direction: column; gap: 0.25em;">
                                ${dropdownOptions}
                            </div>
                        </div>
                        <input type="text" class="${prefix}_section_includeItemTypes fld emby-input includeItemTypes-input-proxy" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-field="includeItemTypes" autocomplete="off" style="position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none;">
                        <div class="includeItemTypes-badges" style="flex: 1; min-height: 2.5em; min-width: 0; display: flex; flex-wrap: wrap; gap: 0.25em; align-items: flex-start; overflow-wrap: break-word;">
                            <span class="includeItemTypes-empty" ${currentTypes.length ? 'hidden' : ''} style="opacity: 0.6; font-size: 0.9em; margin: 0.25em;">未选择条目类型</span>
                            ${badgesHtml}
                        </div>
                    </div>
                    <input type="hidden" class="${prefix}_section_includeItemTypes_hidden" data-section-index="${sectionIndex}" value="${currentTypes.join(', ')}">
                </div>
            </div>
        `;
    }

    // Helper function to build Additional Options Controls (Dropdown + Add Button)
    function buildAdditionalOptionsControls(prefix, sectionIndex, sanitizedPrefix) {
        // Build dropdown options from supported params
        const dropdownOptions = Object.entries(SUPPORTED_CUSTOM_SECTION_PARAMS)
            //.sort((a, b) => a[1].label.localeCompare(b[1].label))
            .map(([key, meta]) => `<option value="${key}">${meta.label}</option>`)
            .join('');

        return `
            <div class="${prefix}_section_additionalOptions_controls" data-section-index="${sectionIndex}" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; position: static;">
                <div class="listItemBodyText" style="margin-bottom: 0.5em;">附加选项</div>
                <div style="display: flex; gap: 0.5em; align-items: center;">
                    <select class="fld emby-select-withcolor emby-select additional-option-select" style="flex: 1; margin: 0; min-width: 0;">
                        <option value="">选择要添加的选项...</option>
                        ${dropdownOptions}
                    </select>
                    <button type="button" class="raised emby-button add-additional-option" style="background: rgba(0, 164, 220, 0.2); min-width: auto; padding: 0.5em 1em;">
                        <span>添加</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Helper function to build Additional Options List
    function buildAdditionalOptionsList(prefix, sectionIndex, sanitizedPrefix, currentOptions) {
        const optionsHtml = (currentOptions || []).map((option, index) => {
            const meta = SUPPORTED_CUSTOM_SECTION_PARAMS[option.key] || { label: option.key, type: 'string' };
            const inputId = `${sanitizedPrefix}_additionalOption_${index}`;
            
            let inputField = '';
            if (meta.type === 'boolean') {
                const isChecked = option.value === true || option.value === 'true';
                inputField = buildJellyfinCheckbox(inputId, isChecked, meta.label, { 
                    'data-key': option.key, 
                    'class': 'additional-option-value',
                    'data-type': 'boolean'
                });
            } else {
                inputField = `
                    <div style="flex: 1;">
                        <div class="listItemBodyText" style="margin-bottom: 0.25em;">${meta.label}</div>
                        <input type="text" id="${inputId}" class="fld emby-input additional-option-value" value="${option.value || ''}" data-key="${option.key}" data-type="${meta.type}" placeholder="${meta.hint || ''}" style="width: 100%;">
                    </div>
                `;
            }

            return `
                <div class="additional-option-row" style="display: flex; align-items: flex-end; gap: 0.5em; margin-top: 0.5em; padding: 0.5em; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    ${inputField}
                    <button type="button" class="remove-additional-option" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0.25em; display: flex; align-items: center;" title="移除选项">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            `;
        }).join('');

        return `
            <div class="${prefix}_section_additionalOptions_list_container" data-section-index="${sectionIndex}" style="margin-top: 0.75em;">
                <div class="additional-options-list">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }

    // Helper function to build Jellyfin-style checkbox
    function buildJellyfinCheckbox(id, checked, label, dataAttributes = {}) {
        let className = 'emby-checkbox';
        const otherAttrs = {};
        
        for (const [key, value] of Object.entries(dataAttributes)) {
            if (key === 'class') {
                className += ' ' + value;
            } else {
                otherAttrs[key] = value;
            }
        }
        
        const dataAttrs = Object.entries(otherAttrs).map(([key, value]) => `${key}="${value}"`).join(' ');
        const checkedAttr = checked ? 'checked' : '';
        return `
            <div class="checkboxContainer">
                <label class="emby-checkbox-label">
                    <input is="emby-checkbox" type="checkbox" id="${id}" class="${className}" data-embycheckbox="true" ${checkedAttr} ${dataAttrs}>
                    <span class="checkboxLabel">${label}</span>
                    <span class="checkboxOutline">
                        <span class="material-icons checkboxIcon checkboxIcon-checked check" aria-hidden="true"></span>
                        <span class="material-icons checkboxIcon checkboxIcon-unchecked" aria-hidden="true"></span>
                    </span>
                </label>
            </div>
        `;
    }

    // Helper function to build a section UI (for nested sections in seasonal and custom sections)
    function buildSectionUI(prefix, section, sectionIndex, isSeasonalNested = false) {
        const sectionId = section.id || `${prefix}_section_${sectionIndex}`;
        const enabled = section.enabled !== false;
        const name = section.name || '';
        const type = section.type || 'Genre';
        const source = section.source || '';
        const itemLimit = section.itemLimit || 16;
        const sortOrder = section.sortOrder || 'Random';
        const sortOrderDirection = section.sortOrderDirection || 'Ascending';
        const cardFormat = section.cardFormat || 'Poster';
        const order = section.order || 100;
        const spotlightEnabled = section.spotlight === true;
        const renderMode = section.renderMode || (spotlightEnabled ? 'Spotlight' : 'Normal');
        const discoveryEnabled = section.discoveryEnabled === true;
        const searchTerm = section.searchTerm || '';
        const includeItemTypes = Array.isArray(section.includeItemTypes) ? section.includeItemTypes : (section.includeItemTypes ? section.includeItemTypes.split(',').map(s => s.trim()).filter(Boolean) : (type === 'Parent' ? [] : ['Movie']));
        const additionalQueryOptions = section.additionalQueryOptions || [];
        
        // Determine source field based on type
        let sourceFieldHtml = '';
        if (type === 'Parent') {
            // Parent type uses simple text input for parent IDs (comma-separated)
            const parentIds = source || '';
            sourceFieldHtml = `
                <div class="${prefix}_section_source_container" data-section-index="${sectionIndex}" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; position: static;">
                    <div style="position: relative;">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">父级 ID（逗号分隔，留空表示“任意”）</div>
                        <input type="text" class="${prefix}_section_source fld emby-input" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-type="${type}" value="${parentIds}" placeholder="输入父级 ID（例如 collection-id、playlist-id），或留空" style="width: 100%;">
                        <input type="hidden" class="${prefix}_section_source_hidden" data-section-index="${sectionIndex}" value="${parentIds}">
                    </div>
                </div>
            `;
        } else if (type === 'Tag' || type === 'Genre' || type === 'Collection' || type === 'Playlist') {
            // Parse existing source (comma-separated) into array
            const sourceArray = source ? source.split(',').map(s => s.trim()).filter(Boolean) : [];
            
            // For Collections/Playlists, we'll show IDs initially and load names after
            // For Tags/Genres, show names directly
            let badgesHtml = '';
            if (type === 'Tag' || type === 'Genre') {
                badgesHtml = sourceArray.map(val => `
                    <span class="tag-badge" data-value="${val}" style="display: inline-flex; align-items: center; gap: 0.25em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; margin: 0.25em; font-size: 0.9em;">
                        ${val}
                        <button type="button" class="tag-badge-remove" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0; margin-left: 0.25em; font-size: 1.2em; line-height: 1; display: flex; align-items: center;" title="移除">×</button>
                    </span>
                `).join('');
            } else {
                // Collections/Playlists: display IDs initially, will be replaced with names after fetch
                badgesHtml = sourceArray.map(id => `
                    <span class="tag-badge" data-value="${id}" data-loading="true" style="display: inline-flex; align-items: center; gap: 0.25em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; margin: 0.25em; font-size: 0.9em;">
                        ${id}
                        <button type="button" class="tag-badge-remove" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0; margin-left: 0.25em; font-size: 1.2em; line-height: 1; display: flex; align-items: center;" title="移除">×</button>
                    </span>
                `).join('');
            }
            
            sourceFieldHtml = `
                <div class="${prefix}_section_source_container" data-section-index="${sectionIndex}" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; position: static;">
                    <div style="position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em;">
                            <div class="listItemBodyText">${type}</div>
                            <button type="button" class="badge-clear-all" data-section-index="${sectionIndex}" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; color: rgba(255,255,255,0.87); cursor: pointer; font-size: 0.85em;" title="清空">清空</button>
                        </div>
                        <div class="tag-badge-container" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-type="${type}" style="min-height: 2.5em; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.5em; margin-bottom: 0.5em; background: rgba(0,0,0,0.2); display: flex; gap: 0.5em; align-items: flex-start; overflow: hidden;">
                            <input type="text" class="${prefix}_section_source fld emby-input autocomplete-input" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-type="${type}" placeholder="输入以添加 ${type.toLowerCase()}..." autocomplete="off" style="flex: 0 0 auto; width: 120px; min-width: 200px; max-width: 120px; border: none; background: transparent; outline: none; color: rgba(255,255,255,0.87); padding: 0.25em;">
                            <div style="flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 0.25em; align-items: flex-start; overflow-wrap: break-word;">
                                ${badgesHtml}
                            </div>
                        </div>
                        <input type="hidden" class="${prefix}_section_source_hidden" data-section-index="${sectionIndex}" value="${source}">
                        <div class="autocomplete-suggestions" data-section-index="${sectionIndex}" style="display: none; position: absolute; z-index: 10000; background: #1a1a1a !important; color: rgba(255,255,255,0.87) !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; max-height: 200px; overflow-y: auto; margin-top: 2px; width: 100%; box-sizing: border-box; opacity: 1 !important; top: 100%; left: 0;"></div>
                    </div>
                </div>
            `;
        }
        
        // Build section fields HTML for right column
        const sanitizedSectionPrefix = `${prefix}_section_${sectionIndex.toString().replace(/[^a-zA-Z0-9]/g, '_')}`;
        const spotlightCheckboxId = `${sanitizedSectionPrefix}_spotlight`;
        const discoveryCheckboxId = `${sanitizedSectionPrefix}_discovery`;
        const sectionFieldsHtml = createSectionConfiguration(
            sanitizedSectionPrefix,
            section,
            {
                includeName: true,
                defaultName: name || '未命名板块',
                nameInputAttributes: {
                    class: `${prefix}_section_name`,
                    'data-section-index': sectionIndex,
                    'data-prefix': prefix
                }
            }
        );
        
        // For custom sections and seasonal nested sections, use the improved layout
        const useImprovedLayout = prefix === 'customSection' || isSeasonalNested;
        
        // Build section content - improved layout for custom sections and seasonal nested sections
        let sectionContent;
        if (useImprovedLayout) {
            // Custom sections: Row 1 (checkboxes + type), Row 2 (source), Row 3+ (remaining fields in 3 columns)
            sectionContent = `
                <!-- Row 1: Enabled, Render Mode, Discovery, Type -->
                <div class="listItem" style="display: grid; grid-template-columns: auto auto auto 1fr; gap: 1em; align-items: end; margin: 0.75em 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                    <div>
                        <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">启用</div>
                        ${buildJellyfinCheckbox(`${prefix}_section_enabled_${sectionIndex}`, enabled, '', { 'data-section-index': sectionIndex, 'data-prefix': prefix, 'class': `${prefix}_section_enabled` })}
                    </div>
                    <div>
                        <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">渲染模式</div>
                        <select class="${prefix}_section_renderMode fld emby-select-withcolor emby-select" data-section-index="${sectionIndex}" data-prefix="${prefix}" style="width: 100%;">
                            <option value="Normal" ${renderMode === 'Normal' ? 'selected' : ''}>常规</option>
                            <option value="Spotlight" ${renderMode === 'Spotlight' ? 'selected' : ''}>精选</option>
                            <option value="Random" ${renderMode === 'Random' ? 'selected' : ''}>随机</option>
                        </select>
                    </div>
                    <div>
                        <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">发现</div>
                        ${buildJellyfinCheckbox(discoveryCheckboxId, discoveryEnabled, '启用为发现板块', { 'data-section-index': sectionIndex, 'data-prefix': prefix, 'class': `${prefix}_section_discovery` })}
                    </div>
                    <div>
                        <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">类型</div>
                        <select class="${prefix}_section_type fld emby-select-withcolor emby-select" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-is-seasonal="${isSeasonalNested}" style="width: 100%;">
                            <option value="Tag" ${type === 'Tag' ? 'selected' : ''}>标签</option>
                            <option value="Genre" ${type === 'Genre' ? 'selected' : ''}>流派</option>
                            <option value="Playlist" ${type === 'Playlist' ? 'selected' : ''}>播放列表</option>
                            <option value="Collection" ${type === 'Collection' ? 'selected' : ''}>合集</option>
                            <option value="Parent" ${type === 'Parent' ? 'selected' : ''}>通用查询</option>
                        </select>
                    </div>
                </div>
                <!-- Row 2: Source picker (full width) -->
                <div style="margin-bottom: 0.75em;">
                    ${sourceFieldHtml}
                </div>
                <!-- Row 3+: Remaining fields in 3 columns -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75em;">
                    ${sectionFieldsHtml}
                    <!-- Search Term field -->
                    <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                        <div class="listItemContent">
                            <div class="listItemBodyText" style="margin-bottom: 0.5em;">搜索词</div>
                            <input type="text" id="${sanitizedSectionPrefix}_searchTerm" class="fld emby-input" value="${searchTerm}" placeholder="可选的搜索过滤词" style="width: 100%;">
                        </div>
                    </div>
                    <!-- Include Item Types field -->
                    ${buildIncludeItemTypesField(prefix, sectionIndex, sanitizedSectionPrefix, includeItemTypes, type)}
                    
                    <!-- Additional Options Controls -->
                    ${buildAdditionalOptionsControls(prefix, sectionIndex, sanitizedSectionPrefix)}
                </div>
                
                <!-- Additional Options List -->
                ${buildAdditionalOptionsList(prefix, sectionIndex, sanitizedSectionPrefix, additionalQueryOptions)}
            `;
        }
        
        // Wrap sections in collapsible details for both custom sections and seasonal nested sections
        if (useImprovedLayout) {
            // Determine summary class and name class based on prefix
            const summaryClass = prefix === 'customSection' ? 'custom-section-summary' : 'seasonal-section-summary';
            const nameClass = prefix === 'customSection' ? 'custom-section-name' : 'seasonal-section-name';
            const enabledClass = prefix === 'customSection' ? 'custom-section-enabled-display' : 'seasonal-section-enabled-display';
            const orderClass = prefix === 'customSection' ? 'custom-section-order' : 'seasonal-section-order';
            const showPreviewButton = prefix === 'customSection' || prefix === 'seasonal_season';
            const previewButtonHtml = showPreviewButton
                ? `<button class="emby-button preview-section-btn" data-prefix="${prefix}" data-section-index="${sectionIndex}" style="padding: 0.5em 1em; font-size: 0.9em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">预览</button>`
                : '';
            
            return `
                <details class="${prefix}_section_item" data-section-index="${sectionIndex}" data-section-id="${sectionId}" style="border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 0; margin-bottom: 0.75em; background: rgba(255,255,255,0.03);">
                    <summary class="${summaryClass}" data-section-index="${sectionIndex}" style="display: flex; justify-content: space-between; align-items: center; padding: 1em; cursor: pointer; list-style: none; user-select: none;">
                        <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em;">
                            <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                        <span class="${nameClass}" data-section-index="${sectionIndex}">${name || '未命名板块'}</span>
                        <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(<span class="${enabledClass}" data-section-index="${sectionIndex}">${enabled ? '已启用' : '已禁用'}</span>，排序：<span class="${orderClass}" data-section-index="${sectionIndex}">${order}</span>)</span>
                        </div>
                        <div style="display: flex; gap: 0.5em;">
                            ${previewButtonHtml}
                            <button class="emby-button delete-section-btn" data-prefix="${prefix}" data-section-index="${sectionIndex}" data-is-seasonal="${isSeasonalNested}" style="padding: 0.5em 1em; font-size: 0.9em; background: rgba(255,0,0,0.2);">删除</button>
                        </div>
                    </summary>
                    <div style="padding: 0 1em 1em 1em; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 0;">
                        ${sectionContent}
                    </div>
                </details>
            `;
        } else {
            // Fallback for any other section types (shouldn't happen in current code)
            const showPreviewButton = prefix === 'customSection' || prefix === 'seasonal_season';
            const previewButtonHtml = showPreviewButton
                ? `<button class="emby-button preview-section-btn" data-prefix="${prefix}" data-section-index="${sectionIndex}" style="padding: 0.5em 1em; font-size: 0.9em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">预览</button>`
                : '';
            return `
                <div class="${prefix}_section_item" data-section-index="${sectionIndex}" data-section-id="${sectionId}" style="border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 1em; margin-bottom: 0.75em; background: rgba(255,255,255,0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75em;">
                        <div class="listItemBodyText" style="font-weight: 500;">${name || '未命名板块'}</div>
                        <div style="display: flex; gap: 0.5em;">
                            ${previewButtonHtml}
                            <button class="emby-button delete-section-btn" data-prefix="${prefix}" data-section-index="${sectionIndex}" data-is-seasonal="${isSeasonalNested}" style="padding: 0.5em 1em; font-size: 0.9em; background: rgba(255,0,0,0.2);">删除</button>
                        </div>
                    </div>
                    ${sectionContent}
                </div>
            `;
        }
    }

    function mergeAttributes(defaultAttrs = {}, customAttrs = {}) {
        const merged = { ...defaultAttrs };
        if (customAttrs && typeof customAttrs === 'object') {
            Object.entries(customAttrs).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    return;
                }
                if (key === 'class' && merged.class) {
                    merged.class = `${merged.class} ${value}`.trim();
                } else {
                    merged[key] = value;
                }
            });
        }
        return merged;
    }

    function attributesToString(attrs = {}) {
        return Object.entries(attrs)
            .map(([key, value]) => {
                if (value === undefined || value === null) return '';
                return `${key}="${value}"`;
            })
            .filter(Boolean)
            .join(' ');
    }

    function parseNumberOrFallback(value, fallback) {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function normalizeDiscoverySectionConfigEntry(rawValue, definition, discovery, legacyName = '') {
        const defaultItemLimit = discovery.defaultItemLimit ?? 16;
        const defaultSortOrder = discovery.defaultSortOrder ?? 'Random';
        const defaultCardFormat = discovery.defaultCardFormat ?? 'Poster';
        const defaults = {
            enabled: true,
            name: legacyName || definition.defaultName || '',
            itemLimit: defaultItemLimit,
            sortOrder: defaultSortOrder,
            sortOrderDirection: 'Ascending',
            cardFormat: defaultCardFormat
        };

        if (definition.extras?.minimumItems !== undefined) {
            defaults.minimumItems = definition.extras.minimumItems;
        }
        if (definition.extras?.caption !== undefined) {
            defaults.caption = definition.extras.caption;
        }

        let normalized = { ...defaults };

        if (rawValue === false) {
            normalized.enabled = false;
        } else if (rawValue && typeof rawValue === 'object') {
            normalized = { ...normalized, ...rawValue };
        } else if (rawValue === true) {
            normalized.enabled = true;
        }

        normalized.itemLimit = parseNumberOrFallback(normalized.itemLimit, defaultItemLimit);
        normalized.sortOrder = normalized.sortOrder || defaultSortOrder;
        normalized.sortOrderDirection = normalized.sortOrderDirection || 'Ascending';
        normalized.cardFormat = normalized.cardFormat || defaultCardFormat;
        normalized.name = normalized.name || definition.defaultName || '';

        if (definition.extras?.minimumItems !== undefined) {
            normalized.minimumItems = parseNumberOrFallback(
                normalized.minimumItems,
                definition.extras.minimumItems
            );
        }

        return normalized;
    }

    function getNormalizedDiscoverySectionConfigs(discovery = {}) {
        const sectionTypes = discovery.sectionTypes || {};
        const legacyNames = discovery.sectionNames || {};
        const normalized = {};

        DISCOVERY_SECTION_DEFINITIONS.forEach(def => {
            normalized[def.key] = normalizeDiscoverySectionConfigEntry(
                sectionTypes[def.key],
                def,
                discovery,
                legacyNames[def.key]
            );
        });

        return normalized;
    }

    // Helper function to build section configuration fields (Name, Item Limit, Sort Order, Card Format, Order)
    function createSectionConfiguration(prefix, config = {}, options = {}) {
        const {
            includeSortOrder = true,
            includeOrder = true,
            includeName = true,
            defaultName = '',
            nameLabel = '板块名称',
            nameInputAttributes = {},
            includeCardFormat = true,
            includeItemLimit = true,
            includeIsPlayed = false,
            includePremiereDays = false
        } = options;

        const nameValue = config.name ?? defaultName ?? '';
        const itemLimit = config.itemLimit ?? options.defaultItemLimit ?? 16;
        const sortOrder = config.sortOrder ?? 'Random';
        const sortOrderDirection = config.sortOrderDirection ?? 'Ascending';
        const cardFormat = config.cardFormat ?? options.defaultCardFormat ?? 'Poster';
        const order = config.order ?? options.defaultOrder ?? 100;
        
        // IsPlayed logic
        // If isPlayed is undefined or null, it means the filter is disabled.
        // If it's true/false, the filter is enabled and set to that value.
        const isPlayedFilterEnabled = config.isPlayed !== undefined && config.isPlayed !== null;
        const isPlayedValue = config.isPlayed === true; // true if played, false if unplayed

        let html = '';

        if (includeName) {
            const nameAttrs = mergeAttributes(
                { id: `${prefix}_name`, class: 'fld emby-input' },
                nameInputAttributes
            );
            html += `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">${nameLabel}</div>
                    <input type="text" ${attributesToString(nameAttrs)} value="${nameValue}" placeholder="${defaultName || ''}" style="width: 100%; max-width: 250px;">
                </div>
            </div>`;
        }

        if (includeCardFormat) {
            html += `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">卡片格式</div>
                    <select id="${prefix}_cardFormat" class="fld emby-select-withcolor emby-select" style="width: 100%; max-width: 200px;">
                        <option value="Random" ${cardFormat === 'Random' ? 'selected' : ''}>随机</option>
                        <option value="Backdrop" ${cardFormat === 'Backdrop' ? 'selected' : ''}>背景图</option>
                        <option value="Thumb" ${cardFormat === 'Thumb' ? 'selected' : ''}>缩略图</option>
                        <option value="Poster" ${cardFormat === 'Poster' ? 'selected' : ''}>海报</option>
                    </select>
                </div>
            </div>`;
        }

        if (includeSortOrder) {
            html += `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">排序方式</div>
                    <select id="${prefix}_sortOrder" class="fld emby-select-withcolor emby-select" style="width: 100%; max-width: 200px;">
                        <option value="Random" ${sortOrder === 'Random' ? 'selected' : ''}>随机</option>
                        <option value="PremiereDate" ${sortOrder === 'PremiereDate' ? 'selected' : ''}>首播日期</option>
                        <option value="DateCreated" ${sortOrder === 'DateCreated' ? 'selected' : ''}>创建日期</option>
                        <option value="DateAdded" ${sortOrder === 'DateAdded' ? 'selected' : ''}>添加日期</option>
                        <option value="SortName" ${sortOrder === 'SortName' ? 'selected' : ''}>排序名称</option>
                        <option value="Name" ${sortOrder === 'Name' ? 'selected' : ''}>名称</option>
                        <option value="CommunityRating" ${sortOrder === 'CommunityRating' ? 'selected' : ''}>社区评分</option>
                        <option value="CriticRating" ${sortOrder === 'CriticRating' ? 'selected' : ''}>评论家评分</option>
                        <option value="OfficialRating" ${sortOrder === 'OfficialRating' ? 'selected' : ''}>官方分级</option>
                        <option value="ProductionYear" ${sortOrder === 'ProductionYear' ? 'selected' : ''}>制作年份</option>
                        <option value="PlayCount" ${sortOrder === 'PlayCount' ? 'selected' : ''}>播放次数</option>
                        <option value="Runtime" ${sortOrder === 'Runtime' ? 'selected' : ''}>时长</option>
                        <option value="Default" ${sortOrder === 'Default' ? 'selected' : ''}>默认</option>
                        <option value="AiredEpisodeOrder" ${sortOrder === 'AiredEpisodeOrder' ? 'selected' : ''}>播出集序</option>
                        <option value="DatePlayed" ${sortOrder === 'DatePlayed' ? 'selected' : ''}>播放日期</option>
                        <option value="StartDate" ${sortOrder === 'StartDate' ? 'selected' : ''}>开始日期</option>
                        <option value="IsFolder" ${sortOrder === 'IsFolder' ? 'selected' : ''}>是否文件夹</option>
                        <option value="IsUnplayed" ${sortOrder === 'IsUnplayed' ? 'selected' : ''}>是否未播放</option>
                        <option value="IsPlayed" ${sortOrder === 'IsPlayed' ? 'selected' : ''}>是否已播放</option>
                        <option value="SeriesSortName" ${sortOrder === 'SeriesSortName' ? 'selected' : ''}>剧集排序名称</option>
                        <option value="AirTime" ${sortOrder === 'AirTime' ? 'selected' : ''}>播出时间</option>
                        <option value="Studio" ${sortOrder === 'Studio' ? 'selected' : ''}>制片公司</option>
                        <option value="IsFavoriteOrLiked" ${sortOrder === 'IsFavoriteOrLiked' ? 'selected' : ''}>是否收藏或喜欢</option>
                        <option value="ParentIndexNumber" ${sortOrder === 'ParentIndexNumber' ? 'selected' : ''}>父级索引编号</option>
                        <option value="IndexNumber" ${sortOrder === 'IndexNumber' ? 'selected' : ''}>索引编号</option>
                    </select>
                </div>
            </div>
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">排序方向</div>
                    <select id="${prefix}_sortOrderDirection" class="fld emby-select-withcolor emby-select" style="width: 100%; max-width: 200px;">
                        <option value="Ascending" ${sortOrderDirection === 'Ascending' ? 'selected' : ''}>升序</option>
                        <option value="Descending" ${sortOrderDirection === 'Descending' ? 'selected' : ''}>降序</option>
                    </select>
                </div>
            </div>`;
        }

        if (includeOrder) {
            html += `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.4em; overflow: visible;">
                        <span>排序</span>
                        <span class="material-icons info info-tooltip" tabindex="0" role="note" data-tooltip="数字越小越靠前" aria-label="数字越小越靠前"></span>
                    </div>
                    <input type="number" id="${prefix}_order" class="fld emby-input" value="${order}" min="0" style="width: 100%; max-width: 200px;">
                </div>
            </div>`;
        }

        if (includeItemLimit) {
            html += `
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">条目数量上限</div>
                        <input type="number" id="${prefix}_itemLimit" class="fld emby-input" value="${itemLimit}" min="1" style="width: 100%; max-width: 200px;">
                    </div>
                </div>`;
        }

        if (includePremiereDays) {
            const minAgeInDays = config.minAgeInDays ?? 0;
            const maxAgeInDays = config.maxAgeInDays ?? 30;
            html += `                
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">最短天数</div>
                        <input type="number" id="${prefix}_minAgeInDays" class="fld emby-input" value="${minAgeInDays}" style="width: 100%;">
                        <div class="fieldDescription" style="margin-top: 0.25em;">可选。距发布的天数（例如 0 表示今天）。</div>
                    </div>
                </div>
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">最长天数</div>
                        <input type="number" id="${prefix}_maxAgeInDays" class="fld emby-input" value="${maxAgeInDays}" style="width: 100%;">
                        <div class="fieldDescription" style="margin-top: 0.25em;">可选。最大天数（例如 30）。</div>
                    </div>
                </div>`;
        }

        if (includeIsPlayed) {
            html += `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    ${buildJellyfinCheckbox(`${prefix}_isPlayed_enabled`, isPlayedFilterEnabled, '按播放状态筛选')}
                    
                    <div id="${prefix}_isPlayed_options" style="margin-top: 0.5em; margin-left: 1.5em; display: ${isPlayedFilterEnabled ? 'block' : 'none'};">
                        <select id="${prefix}_isPlayed_value" class="fld emby-select-withcolor emby-select" style="width: 100%; max-width: 200px;">
                            <option value="false" ${!isPlayedValue ? 'selected' : ''}>未播放</option>
                            <option value="true" ${isPlayedValue ? 'selected' : ''}>已播放</option>
                        </select>
                    </div>
                </div>
            </div>`;
        }

        return html;
    }

    // Build home screen configuration
    function buildHomeScreenConfig(homeScreen, libraries = []) {
        const recentlyReleased = homeScreen.recentlyReleased || {};
        const recentlyAddedInLibrary = homeScreen.recentlyAddedInLibrary || {};
        const trending = homeScreen.trending || {};
        const popularTVNetworks = homeScreen.popularTVNetworks || {};
        const watchlist = homeScreen.watchlist || {};
        const upcoming = homeScreen.upcoming || {};
        const imdbTop250 = homeScreen.imdbTop250 || {};
        const seasonal = homeScreen.seasonal || {};
        const watchAgain = homeScreen.watchAgain || {};
        const discovery = homeScreen.discovery || {};
        const customSections = homeScreen.customSections || [];
        const normalizedDiscoverySections = getNormalizedDiscoverySectionConfigs(discovery);
        
        // Build seasonal sections HTML
        const seasonalSectionsHtml = (seasonal.seasons || []).map((season, seasonIndex) => {
            const sections = season.sections || [];
            const sectionsHtml = sections.map((section, sectionIndex) => {
                return buildSectionUI('seasonal_season', section, `${seasonIndex}_${sectionIndex}`, true);
            }).join('');
        
        const seasonOrder = season.order || 100;
        return `
            <details class="seasonal-season-item" data-season-index="${seasonIndex}" style="border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0; margin-bottom: 1em; background: rgba(255,255,255,0.02);">
                <summary class="seasonal-season-summary" data-season-index="${seasonIndex}" style="display: flex; justify-content: space-between; align-items: center; padding: 1em; cursor: pointer; list-style: none; user-select: none;">
                    <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em;">
                        <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                        <span class="seasonal-season-name-display" data-season-index="${seasonIndex}">${season.name || '未命名季'}</span>
                        <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(<span class="seasonal-season-enabled-display" data-season-index="${seasonIndex}">${season.enabled !== false ? '已启用' : '已禁用'}</span>，排序：<span class="seasonal-season-order" data-season-index="${seasonIndex}">${seasonOrder}</span>)</span>
                    </div>
                    <div style="display: flex; gap: 0.5em;">
                        <button class="emby-button" onclick="deleteSeasonalSeason(${seasonIndex})" style="padding: 0.5em 1em; font-size: 0.9em; background: rgba(255,0,0,0.2);">删除</button>
                    </div>
                </summary>
                <div style="padding: 0 1em 1em 1em; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75em; margin-bottom: 0.75em; margin-top: 0.75em;">
                        <div>
                            <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">启用</div>
                            ${buildJellyfinCheckbox(`seasonal-season-enabled-${seasonIndex}`, season.enabled !== false, '启用', { 'data-index': seasonIndex, 'class': 'seasonal-season-enabled' })}
                        </div>
                        <div>
                            <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">名称</div>
                            <input type="text" class="seasonal-season-name fld emby-input" data-index="${seasonIndex}" value="${season.name || ''}" style="width: 100%;">
                        </div>
                        <div>
                            <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">开始日期（MM-DD）</div>
                            <input type="text" class="seasonal-season-startDate fld emby-input" data-index="${seasonIndex}" value="${season.startDate || ''}" placeholder="10-01" style="width: 100%;">
                        </div>
                        <div>
                            <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">结束日期（MM-DD）</div>
                            <input type="text" class="seasonal-season-endDate fld emby-input" data-index="${seasonIndex}" value="${season.endDate || ''}" placeholder="10-31" style="width: 100%;">
                        </div>
                        <div>
                            <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em; display: flex; align-items: center; gap: 0.4em;">排序</div>
                            <input type="number" class="seasonal-season-order-input fld emby-input" data-index="${seasonIndex}" value="${seasonOrder}" min="0" style="width: 100%;">
                        </div>
                    </div>
                    <div style="margin-top: 0.75em; margin-bottom: 0.75em;">
                        <div class="listItemBodyText" style="font-weight: 500; margin-bottom: 0.5em;">板块</div>
                        <div class="seasonal_season_sections_list" data-season-index="${seasonIndex}">
                            ${sectionsHtml}
                        </div>
                        <button type="button" class="emby-button raised add-section-to-seasonal-btn" data-season-index="${seasonIndex}" style="padding: 0.75em 1.5em; margin-top: 0.5em;">
                            <span>添加板块</span>
                        </button>
                    </div>
                </div>
            </details>`;
        }).join('');
        
        // Build library sections HTML for "Recently Added in Library"
        let recentlyAddedInLibraryHtml = '';
        if (libraries && libraries.length > 0) {
            recentlyAddedInLibraryHtml = libraries.map(library => {
                const libConfig = recentlyAddedInLibrary[library.Id] || {};
                const prefix = `homeScreen_recentlyAddedInLibrary_${library.Id}`;
                const defaultName = `最近添加 ${library.Name}`;
                
                return `
                    <details class="listItem" style="display: grid; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0; gap: 0.5em;">
                        <summary class="recently-released-subsection-summary" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75em; cursor: pointer; list-style: none; user-select: none;">
                            <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em;">
                                <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                                <span>${library.Name}</span>
                                <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(<span class="${prefix}_enabled_display">${libConfig.enabled !== false ? '已启用' : '已禁用'}</span>, 排序: <span class="${prefix}_order_display">${libConfig.order || 11}</span>)</span>
                            </div>
                        </summary>
                        <div style="padding: 0 0.75em 0.75em 0.75em; border-top: 1px solid rgba(255,255,255,0.1);">
                            <div style="margin-top: 0.75em; margin-bottom: 0.75em;">
                                ${buildJellyfinCheckbox(`${prefix}_enabled`, libConfig.enabled !== false, '已启用', { 'data-library-id': library.Id, 'class': 'recently-added-library-enabled' })}
                            </div>
                            <div class="listItemContent" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75em;">
                                ${createSectionConfiguration(prefix, libConfig, { 
                                    includeName: true, 
                                    defaultName: defaultName, 
                                    includeSortOrder: false, 
                                    includeOrder: true, 
                                    defaultOrder: 11,
                                    includeItemLimit: true,
                                    defaultItemLimit: 30,
                                    defaultCardFormat: library.CollectionType === 'tvshows' ? 'Thumb' : 'Poster'
                                })}
                            </div>
                        </div>
                    </details>
                `;
            }).join('');
        }

        // Check for orphaned sections (configured but library no longer exists)
        const activeLibraryIds = libraries.map(l => l.Id);
        const configuredLibraryIds = Object.keys(recentlyAddedInLibrary);
        const orphanedLibraryIds = configuredLibraryIds.filter(id => !activeLibraryIds.includes(id));
        
        if (orphanedLibraryIds.length > 0) {
            recentlyAddedInLibraryHtml += orphanedLibraryIds.map(id => {
                const libConfig = recentlyAddedInLibrary[id];
                const prefix = `homeScreen_recentlyAddedInLibrary_${id}`;
                const name = libConfig.name || `未知媒体库 (${id})`;
                
                return `
                    <details class="listItem recently-added-library-item" style="display: grid; border: 1px solid rgba(244, 67, 54, 0.3); border-radius: 4px; padding: 0; gap: 0.5em; background: rgba(244, 67, 54, 0.05);">
                        <summary class="recently-released-subsection-summary" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75em; cursor: pointer; list-style: none; user-select: none;">
                            <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em; color: #ff8a80;">
                                <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">warning</span>
                                <span>${name}</span>
                                <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(媒体库缺失)</span>
                            </div>
                            <button type="button" class="emby-button" onclick="this.closest('.recently-added-library-item').remove()" style="padding: 0.5em; min-width: auto; background: rgba(244, 67, 54, 0.1);">
                                <span class="material-icons" style="font-size: 1.2em; color: #ff8a80;">delete</span>
                            </button>
                        </summary>
                        <div style="padding: 0 0.75em 0.75em 0.75em; border-top: 1px solid rgba(244, 67, 54, 0.1);">
                            <div style="margin-top: 0.75em; margin-bottom: 0.75em;">
                                <div class="listItemBodyText" style="color: #ff8a80; font-size: 0.9em; margin-bottom: 0.5em;">
                                    该媒体库已不可用，请移除此板块。
                                </div>
                                ${buildJellyfinCheckbox(`${prefix}_enabled`, false, '已启用', { 'data-library-id': id, 'class': 'recently-added-library-enabled', 'disabled': 'true' })}
                            </div>
                        </div>
                    </details>
                `;
            }).join('');
        }

        return `
            <!-- Recently Added in Library Sections -->
            ${(libraries && libraries.length > 0) || orphanedLibraryIds.length > 0 ? `
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                    媒体库内最近添加板块
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_recentlyAddedInLibrary_container">
                        <div style="display: grid; grid-template-columns: 1fr; gap: 0.75em; margin-bottom: 0.75em;">
                            ${recentlyAddedInLibraryHtml}
                        </div>
                    </div>
                </div>
            </details>
            ` : ''}

            <!-- Recently Released Sections -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_recentlyReleased_enabled', recentlyReleased.enabled !== false, '最近发布板块')}
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_recentlyReleased_container">
                        <div style="display: grid; grid-template-columns: 1fr; gap: 0.75em; margin-bottom: 0.75em;">
                            <details class="listItem" style="display: grid; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0; gap: 0.5em;">
                                <summary class="recently-released-subsection-summary" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75em; cursor: pointer; list-style: none; user-select: none;">
                                    <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em;">
                                        <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                                        <span>最近发布的电影</span>
                                        <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(<span class="recently-released-movies-enabled">${(recentlyReleased.movies || {}).enabled !== false ? '已启用' : '已禁用'}</span>, 排序: <span class="recently-released-movies-order">${(recentlyReleased.movies || {}).order || 30}</span>)</span>
                                    </div>
                                </summary>
                                <div style="padding: 0 0.75em 0.75em 0.75em; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <div style="margin-top: 0.75em; margin-bottom: 0.75em;">
                                        ${buildJellyfinCheckbox('homeScreen_recentlyReleased_movies_enabled', (recentlyReleased.movies || {}).enabled !== false, '已启用')}
                                    </div>
                                    <div class="listItemContent" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75em;">
                                        ${createSectionConfiguration('homeScreen_recentlyReleased_movies', recentlyReleased.movies || {}, { includeName: true, defaultName: '最近发布的电影', includeSortOrder: true, includeOrder: true, includeIsPlayed: true, includePremiereDays: true })}
                                    </div>
                                </div>
                            </details>
                            <details class="listItem" style="display: grid; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0; gap: 0.5em;">
                                <summary class="recently-released-subsection-summary" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75em; cursor: pointer; list-style: none; user-select: none;">
                                    <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em;">
                                        <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                                        <span>最近播出的集</span>
                                        <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(<span class="recently-released-episodes-enabled">${(recentlyReleased.episodes || {}).enabled !== false ? '已启用' : '已禁用'}</span>, 排序: <span class="recently-released-episodes-order">${(recentlyReleased.episodes || {}).order || 31}</span>)</span>
                                    </div>
                                </summary>
                                <div style="padding: 0 0.75em 0.75em 0.75em; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <div style="margin-top: 0.75em; margin-bottom: 0.75em;">
                                        ${buildJellyfinCheckbox('homeScreen_recentlyReleased_episodes_enabled', (recentlyReleased.episodes || {}).enabled !== false, '已启用')}
                                    </div>
                                    <div class="listItemContent" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75em;">
                                        ${createSectionConfiguration('homeScreen_recentlyReleased_episodes', recentlyReleased.episodes || {}, { includeName: true, defaultName: '最近播出的集', includeSortOrder: true, includeOrder: true, includeIsPlayed: true, includePremiereDays: true })}
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- Trending Sections -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em; display: none;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_trending_enabled', trending.enabled === true, '热门板块', { disabled: 'true' })}
                    <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal; margin-left: auto;">(排序: <span class="home-section-order" data-prefix="homeScreen_trending">${trending.order || 100}</span>)</span>
                    <span class="listItemBodyText secondary" style="font-size: 0.85em; font-style: italic; opacity: 0.7;">开发中</span>
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_trending_container">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75em;">
                            ${createSectionConfiguration('homeScreen_trending', trending, { includeName: true, defaultName: '热门', includeIsPlayed: true })}
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- Popular TV Networks Sections -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_popularTVNetworks_enabled', popularTVNetworks.enabled === true, '热门电视网板块')}
                    <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal; margin-left: auto;">(排序: <span class="home-section-order" data-prefix="homeScreen_popularTVNetworks">${popularTVNetworks.order || 100}</span>)</span>
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_popularTVNetworks_container">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75em;">
                            ${createSectionConfiguration('homeScreen_popularTVNetworks', popularTVNetworks, { includeName: true, defaultName: '热门电视网' })}
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">电视网出现所需最少剧集数</div>
                                    <input type="number" id="homeScreen_popularTVNetworks_minimumShowsForNetwork" class="fld emby-input" value="${popularTVNetworks.minimumShowsForNetwork || 5}" min="1" style="width: 100%; max-width: 200px;">
                </div>
            </div>
                </div>
            </div>
                </div>
            </details>
            
            <!-- Watchlist -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_watchlist_enabled', watchlist.enabled === true, '片单')}
                    <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal; margin-left: auto;">(排序: <span class="home-section-order" data-prefix="homeScreen_watchlist">${watchlist.order || 100}</span>)</span>
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_watchlist_container">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75em;">
                            ${createSectionConfiguration('homeScreen_watchlist', watchlist, { includeName: true, defaultName: '片单' })}
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- Upcoming -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_upcoming_enabled', upcoming.enabled !== false, '即将上线')}
                    <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal; margin-left: auto;">(排序: <span class="home-section-order" data-prefix="homeScreen_upcoming">${upcoming.order || 100}</span>)</span>
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_upcoming_container">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75em;">
                            ${createSectionConfiguration('homeScreen_upcoming', upcoming, { includeName: true, defaultName: '即将上线', includeSortOrder: false })}
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- IMDb Top 250 -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_imdbTop250_enabled', imdbTop250.enabled !== false, 'IMDb Top 250')}
                    <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal; margin-left: auto;">(排序: <span class="home-section-order" data-prefix="homeScreen_imdbTop250">${imdbTop250.order || 100}</span>)</span>
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_imdbTop250_container">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75em;">
                            ${createSectionConfiguration('homeScreen_imdbTop250', imdbTop250, { includeName: true, defaultName: 'IMDb Top 250', includeIsPlayed: true })}
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- Seasonal Sections -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_seasonal_enabled', seasonal.enabled !== false, '季节板块')}
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_seasonal_container">
                            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">启用季节动画</div>
                                    <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">为季节主题启用飘雪/落叶动画</div>
                                    ${buildJellyfinCheckbox('homeScreen_seasonal_enableSeasonalAnimations', seasonal.enableSeasonalAnimations !== false, '已启用')}
                                </div>
                            </div>
                            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">启用圣诞背景</div>
                                    <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">为圣诞主题启用节日背景图片</div>
                                    ${buildJellyfinCheckbox('homeScreen_seasonal_enableSeasonalBackground', seasonal.enableSeasonalBackground !== false, '已启用')}
                                </div>
                            </div>
                        <div id="homeScreen_seasonal_seasons_list" style="margin-bottom: 1em;">
                            ${seasonalSectionsHtml}
                        </div>
                        <button class="emby-button raised" onclick="addNewSeasonalSeason()" style="padding: 0.75em 1.5em; margin-bottom: 1em;">
                            <span>添加新季节</span>
                        </button>
                    </div>
                </div>
            </details>
            
            <!-- Watch Again -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_watchAgain_enabled', watchAgain.enabled === true, '再看一次')}
                    <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal; margin-left: auto;">(排序: <span class="home-section-order" data-prefix="homeScreen_watchAgain">${watchAgain.order || 100}</span>)</span>
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_watchAgain_container">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75em;">
                            ${createSectionConfiguration('homeScreen_watchAgain', watchAgain, { includeName: true, defaultName: '再看一次' })}
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- Discovery Sections -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    ${buildJellyfinCheckbox('homeScreen_discovery_enabled', discovery.enabled !== false, '发现板块')}
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div id="homeScreen_discovery_container">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75em; margin-bottom: 0.75em;">
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">无限滚动 / 发现更多</div>
                                    ${buildJellyfinCheckbox('homeScreen_discovery_infiniteScroll', discovery.infiniteScroll !== false, '无限滚动')}
                </div>
            </div>
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">随机化板块排序</div>
                                    ${buildJellyfinCheckbox('homeScreen_discovery_randomizeOrder', discovery.randomizeOrder === true, '随机排序')}
                </div>
            </div>
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">热门人物最少出现次数</div>
                                    <input type="number" id="homeScreen_discovery_minPeopleAppearances" class="fld emby-input" value="${discovery.minPeopleAppearances || 10}" min="1" style="width: 100%; max-width: 200px;">
                </div>
            </div>
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">流派最少电影数量</div>
                                    <input type="number" id="homeScreen_discovery_minGenreMovieCount" class="fld emby-input" value="${discovery.minGenreMovieCount || 50}" min="1" style="width: 100%; max-width: 200px;">
                </div>
            </div>
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">焦点与合集出现概率</div>
                                    <input type="number" id="homeScreen_discovery_spotlightDiscoveryChance" class="fld emby-input" value="${discovery.spotlightDiscoveryChance ?? 0.5}" min="0" max="1" step="0.01" style="width: 100%; max-width: 200px;">
                                    <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-top: 0.25em;">0.0 = 从不，1.0 = 总是</div>
                </div>
            </div>
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; display: grid;">
                ${buildJellyfinCheckbox('homeScreen_discovery_renderSpotlightAboveMatching', discovery.renderSpotlightAboveMatching === true, '焦点分组')}
                <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-top: 0.25em; margin-left: 2em;">将焦点（Spotlight）发现板块与对应的发现板块一同渲染（例如“动作焦点”显示在“动作电影”上方）。</div>
            </div>
            ${createSectionConfiguration('homeScreen_discovery', discovery, { includeName: false, includeOrder: false, includeCardFormat: false, includeSortOrder: false, includeItemLimit: false })}
                        </div>
                        <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 0.75em;">
                            <div class="listItemContent">
                                <div class="listItemBodyText" style="margin-bottom: 0.25em; font-weight: 500;">发现板块</div>
                                <div class="listItemBodyText secondary" style="font-size: 0.85em;">板块名称支持占位符，例如 [Genre]、[Director]、[Writer]、[Actor]、[Movie]、[Studio]、[Collection Name]</div>
                                <div style="display: grid; gap: 0.75em; margin-top: 0.75em;">
                                    ${DISCOVERY_SECTION_DEFINITIONS.map(section => {
                                        const sectionConfig = normalizedDiscoverySections[section.key];
                                        const prefix = `homeScreen_discovery_sectionTypes_${section.key}`;
                                        const configHtml = createSectionConfiguration(prefix, sectionConfig, { includeName: true, includeOrder: true, includeSortOrder: false, defaultName: section.defaultName, includeIsPlayed: true });
                                        const extraFields = section.extras?.minimumItems !== undefined
                                            ? `
                                                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                                                    <div class="listItemContent">
                                                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">最少条目数</div>
                                                        <input type="number" id="${prefix}_minimumItems" class="fld emby-input" value="${sectionConfig.minimumItems ?? section.extras.minimumItems}" min="1" style="width: 100%; max-width: 200px;">
                                                    </div>
                                                </div>
                                            `
                                            : '';

                                        const discoveryOrder = sectionConfig.order || 100;
                                        return `
                                            <details class="discovery-section-type-item" data-section-key="${section.key}" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0; margin-bottom: 0.75em; background: rgba(255,255,255,0.02);">
                                                <summary class="discovery-section-type-summary" data-section-key="${section.key}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75em; cursor: pointer; list-style: none; user-select: none;">
                                                    <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em;">
                                                        <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                                                        <span>${section.label}</span>
                                                        <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(<span class="discovery-section-type-enabled" data-section-key="${section.key}">${sectionConfig.enabled !== false ? '已启用' : '已禁用'}</span>, 排序: <span class="discovery-section-type-order" data-section-key="${section.key}">${discoveryOrder}</span>)</span>
                                                    </div>
                                                </summary>
                                                <div style="padding: 0 0.75em 0.75em 0.75em; border-top: 1px solid rgba(255,255,255,0.1);">
                                                    <div style="margin-top: 0.75em; margin-bottom: 0.75em;">
                                                        ${buildJellyfinCheckbox(`${prefix}_enabled`, sectionConfig.enabled !== false, '已启用')}
                                                    </div>
                                                    <div style="display: flex; gap: 0.5em;">
                                                        ${configHtml}
                                                        ${extraFields}
                                                    </div>
                                                </div>
                                            </details>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- Custom Sections -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em;">自定义板块</summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div class="listItemBodyText" style="font-weight: 500; margin-bottom: 0.5em;">板块</div>
                    <div id="customSections_list" style="margin-bottom: 1em;">
                        ${(customSections || []).map((section, index) => {
                            return buildSectionUI('customSection', section, index, false);
                        }).join('')}
                    </div>
                    <button type="button" class="emby-button raised add-custom-section-btn" style="padding: 0.75em 1.5em; margin-bottom: 1em;">
                        <span>添加板块</span>
                    </button>
            </div>
            </details>

            <!-- Import/Export Custom Sections -->
            <details style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; margin-bottom: 0.5em; display: flex; align-items: center; gap: 0.5em; border-radius: 0px !important;">
                    <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">import_export</span>
                    导入 / 导出自定义板块
                </summary>
                <div style="padding: 0.75em 0 0 0;">
                    <div class="listItemBodyText secondary" style="margin-bottom: 1em;">分享您的自定义主屏幕板块，或导入他人的配置。</div>
                    <div style="display: flex; gap: 1em;">
                        <button type="button" class="emby-button raised export-custom-sections-btn" style="padding: 0.75em 1.5em;">
                            <span>导出板块</span>
                        </button>
                        <button type="button" class="emby-button raised import-custom-sections-btn" style="padding: 0.75em 1.5em;">
                            <span>导入板块</span>
                        </button>
                        <button type="button" class="emby-button raised import-community-sections-btn" style="padding: 0.75em 1.5em;">
                            <span>从社区导入</span>
                        </button>
                    </div>
                </div>
            </details>
        `;
    }

    // Build exclusive elsewhere configuration
    function buildExclusiveElsewhereConfig(exclusiveElsewhere) {
        return `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">隐藏服务器名称</div>
                    <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">设为 true 以隐藏服务器名称，适合只想通过 CSS 显示 logo 或图标的场景</div>
                    ${buildJellyfinCheckbox('exclusiveElsewhere_hideServerName', exclusiveElsewhere.hideServerName === true, '已启用')}
                </div>
            </div>
        `;
    }

    // Build search configuration
    function buildSearchConfig(search) {
        return `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">启用来自 JellyfinEnhanced 的 Seerr 结果</div>
                    <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">如果您正在使用 Jellyfin Enhanced 的 Seerr，可启用此项，为“请求”添加额外的搜索开关</div>
                    ${buildJellyfinCheckbox('search_enableJellyseerr', search.enableJellyseerr === true, '已启用')}
                </div>
            </div>
        `;
    }

    // Build flatten shows configuration
    function buildFlattenShowsConfig(flattenShows) {
        const hideSingleSeasonContainer = flattenShows?.hideSingleSeasonContainer === true;
        return `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em;">
                <div class="listItemContent">
                    <div class="listItemBodyText" style="margin-bottom: 0.5em;">扁平化单季剧集</div>
                    <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">启用后，当剧集只有一季时隐藏季容器板块，因为各集已直接显示。</div>
                    ${buildJellyfinCheckbox('flattenSingleSeasonShows_hideSingleSeasonContainer', hideSingleSeasonContainer, '已启用')}
                </div>
            </div>
        `;
    }

    // Open configuration modal
    // Fetch libraries (Movies and TV)
    async function fetchLibraries() {
        if (!window.ApiClient) return [];
        try {
            // Get user views (libraries)
            const result = await window.ApiClient.getUserViews({}, window.ApiClient.getCurrentUserId());
            if (result && result.Items) {
                // Filter for movies and tvshows
                return result.Items.filter(item => 
                    item.CollectionType === 'movies' || item.CollectionType === 'tvshows'
                ).map(item => ({
                    Id: item.Id,
                    Name: item.Name,
                    CollectionType: item.CollectionType
                }));
            }
            return [];
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error fetching libraries:', error);
            return [];
        }
    }

    async function openConfigurationModal() {
        console.log('[KefinTweaks Configuration] Opening configuration modal...');

        // Inject CSS if not already injected
        injectConfigModalCSS();

        // Load configuration first
        let config;
        try {
            config = await getKefinTweaksConfig();
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error loading config:', error);
            alert('加载配置出错，请重试。');
            return;
        }

        currentLoadedConfig = config;
        window.KefinTweaksCurrentConfig = config;

        // Ensure Jellyfin major is cached so version-gated feature cards filter correctly
        try {
            if (typeof window.KefinTweaks?.getJellyfinMajorVersion === 'function') {
                await window.KefinTweaks.getJellyfinMajorVersion();
            }
        } catch (e) {
            console.warn('[KefinTweaks Configuration] Could not resolve Jellyfin major version:', e);
        }

        // Build the content (without title, as ModalSystem adds it)
        const content = document.createElement('div');
        content.className = 'modal-content-wrapper';
        content.id = MODAL_ID;
        content.innerHTML = `
            <div class="kefin-config-wrapper">
                ${buildConfigPageContent(config)}
            </div>
        `;

        // Create footer with save, export, and import buttons
        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.gap = '0.75em';
        footer.style.alignItems = 'center';
        footer.innerHTML = `
            <button class="emby-button raised" id="resetConfigBtn" style="padding: 0.75em 2em; font-size: 1em;">
                <span>恢复默认</span>
            </button>
            <button class="emby-button raised button-submit" id="saveConfigBtn" style="padding: 0.75em 2em; font-size: 1em; font-weight: 500;">
                <span>保存</span>
            </button>
        `;

        // Create modal using ModalSystem
        if (!window.ModalSystem) {
            console.error('[KefinTweaks Configuration] ModalSystem not available');
            alert('模态框系统不可用，请确保已加载 modal.js。');
            return;
                    }

        const modal = window.ModalSystem.create({
            id: MODAL_ID,
            title: 'KefinTweaks 配置',
            content: content,
            footer: footer,
            closeOnBackdrop: true,
            closeOnEscape: true,
            onOpen: (modalInstance) => {
                // Check if window is less than 900px
                const layoutMobile = window.innerWidth < 900;

                // Update modal dialog styling for large size
                if (modalInstance && modalInstance.dialog && !layoutMobile) {
                    modalInstance.dialog.style.maxWidth = '90vw';
                    modalInstance.dialog.style.width = '1400px';
                    modalInstance.dialog.style.maxHeight = '90vh';
                }

                // Add event handlers
                setupConfigModalHandlers(modalInstance, config);
                }
            });
        }

    /**
     * Attach event handlers for optional includes checkboxes
     * @param {Object} modalInstance - The modal instance
     * @param {string} category - "global" or skin name
     * @param {Object} config - The current config
     */
    function attachOptionalIncludesCheckboxHandlers(modalInstance, category, config) {
        const checkboxes = modalInstance.dialogContent.querySelectorAll(`.optionalIncludeCheckbox[data-category="${category}"]`);
        checkboxes.forEach(checkbox => {
            // Remove existing listeners (if any) and add new one
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
            
            newCheckbox.addEventListener('change', () => {
                // Update will be saved when user clicks Save button
                // No need to save immediately
            });
        });
    }
    
    // Set up event handlers for configuration modal
    function setupConfigModalHandlers(modalInstance, config) {
        // Enabled checkbox handler
        const enabledCheckbox = modalInstance.dialogContent.querySelector('#kefinTweaksEnabled');
        const enabledLabel = modalInstance.dialogContent.querySelector('#kefinTweaksEnabledLabel');
        if (enabledCheckbox) {
            // Function to update label text
            const updateLabel = () => {
                if (enabledLabel) {
                    enabledLabel.textContent = enabledCheckbox.checked ? '已启用' : '已禁用';
                }
            };
            
            enabledCheckbox.addEventListener('change', async (e) => {
                const isEnabled = e.target.checked;
                // Update label immediately for better UX
                updateLabel();
                
                try {
                    // Update the config's enabled field
                    config.enabled = isEnabled;
                    
                    // Save the updated config to the injector
                    await KefinTweaksUtils.saveConfigToJavaScriptInjector(config);
                    
                    window.KefinTweaksConfigEnabled = isEnabled;
                    console.log('[KefinTweaks Configuration] KefinTweaks', isEnabled ? 'enabled' : 'disabled');
                    
                    if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                        window.KefinTweaksToaster.toast(`KefinTweaks 已${isEnabled ? '启用' : '禁用'}，需要刷新页面。`);
                    }
                } catch (error) {
                    console.error('[KefinTweaks Configuration] Error toggling KefinTweaks:', error);
                    // Revert checkbox on error
                    enabledCheckbox.checked = !isEnabled;
                    updateLabel();
                    alert(`${isEnabled ? '启用' : '禁用'} KefinTweaks 失败：${error.message}`);
                }
            });
        }
        
        // Change KefinTweaks Source button handler
        const changeSourceBtn = modalInstance.dialogContent.querySelector('#changeKefinTweaksSourceBtn');
        if (changeSourceBtn) {
            changeSourceBtn.addEventListener('click', async () => {
                try {
                    // jf12 fork: with the hand-written JavaScript Injector entries nothing has loaded kefinTweaks-plugin.js (upstream's entry point, which defines the dialog): load it from the
                    // same folder as everything else, now. It adds no card to the Plugins page when KefinTweaks is already running.
                    if (!window.openKefinTweaksSourceModal) {
                        const root = String(window.KefinTweaksBootstrapRoot || window.KefinTweaksConfig?.kefinTweaksRoot || '').trim();
                        if (!root) throw new Error('kefinTweaksRoot is empty in the KefinTweaks-Config entry.');
                        const src = root.replace(/\/?$/, '/') + 'kefinTweaks-plugin.js';
                        await new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = src;
                            script.async = true;
                            script.onload = resolve;
                            script.onerror = () => reject(new Error(`Could not load ${src}`));
                            document.head.appendChild(script);
                        });
                    }
                    if (!window.openKefinTweaksSourceModal) throw new Error('kefinTweaks-plugin.js was loaded but does not define the settings dialog.');
                    window.openKefinTweaksSourceModal();
                } catch (error) {
                    console.error('[KefinTweaks Configuration] Error opening source modal:', error);
                    alert(`打开源配置失败：${error.message}`);
                }
            });
        }

        // No validation needed for default skin dropdown - it only allows valid options

        // Helper function to prevent click propagation on checkboxes (so they don't toggle details)
        function setupCheckboxPropagation(checkboxId) {
            const checkbox = modalInstance.dialogContent.querySelector(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }

        // Helper function to toggle container visibility
        function setupToggleVisibility(checkboxId, containerId) {
            const checkbox = modalInstance.dialogContent.querySelector(checkboxId);
            const container = modalInstance.dialogContent.querySelector(containerId);
            if (checkbox && container) {
                const toggle = () => {
                    container.style.display = checkbox.checked ? '' : 'none';
                };
                checkbox.addEventListener('change', toggle);
                // Prevent details from toggling when clicking checkbox
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
                toggle(); // Set initial state
            }
        }
        
        // Home Screen: Setup propagation prevention only (don't hide content when disabled)
        setupCheckboxPropagation('#homeScreen_recentlyReleased_enabled');
        setupCheckboxPropagation('#homeScreen_trending_enabled');
        setupCheckboxPropagation('#homeScreen_popularTVNetworks_enabled');
        setupCheckboxPropagation('#homeScreen_watchlist_enabled');
        setupCheckboxPropagation('#homeScreen_upcoming_enabled');
        setupCheckboxPropagation('#homeScreen_imdbTop250_enabled');
        setupCheckboxPropagation('#homeScreen_seasonal_enabled');
        setupCheckboxPropagation('#homeScreen_watchAgain_enabled');
        setupCheckboxPropagation('#homeScreen_discovery_enabled');
        
        // Discovery Sections IsPlayed Toggles
        ['recentlyReleased_movies', 'recentlyReleased_episodes', 'trending', 'popularTVNetworks', 'upcoming', 'imdbTop250'].forEach(key => {
            setupToggleVisibility(`#homeScreen_${key}_isPlayed_enabled`, `#homeScreen_${key}_isPlayed_options`);
        });
        
        // Dynamic Discovery Sections IsPlayed Toggles
        DISCOVERY_SECTION_DEFINITIONS.forEach(section => {
            const prefix = `homeScreen_discovery_sectionTypes_${section.key}`;
            setupToggleVisibility(`#${prefix}_isPlayed_enabled`, `#${prefix}_isPlayed_options`);
        });
        
        // Setup event listeners for section management
        // Add section to seasonal season
        modalInstance.dialogContent.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-section-to-seasonal-btn');
            if (addBtn) {
                const seasonIndex = parseInt(addBtn.getAttribute('data-season-index'));
                addSectionToSeasonalSeason(seasonIndex);
            }
        });
        
        // Add custom section
        modalInstance.dialogContent.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-custom-section-btn');
            if (addBtn) {
                addCustomSection();
            }
        });

        // Export custom sections
        modalInstance.dialogContent.addEventListener('click', (e) => {
            const exportBtn = e.target.closest('.export-custom-sections-btn');
            if (exportBtn) {
                showExportDialog(config);
            }
        });

        // Import custom sections
        modalInstance.dialogContent.addEventListener('click', (e) => {
            const importBtn = e.target.closest('.import-custom-sections-btn');
            if (importBtn) {
                showImportDialog(config, async (newConfig) => {
                    await KefinTweaksUtils.saveConfigToJavaScriptInjector(newConfig);
                });
            }
        });

        // Import community sections
        modalInstance.dialogContent.addEventListener('click', (e) => {
            const importBtn = e.target.closest('.import-community-sections-btn');
            if (importBtn) {
                showCommunityImportDialog(config, async (newConfig) => {
                    await KefinTweaksUtils.saveConfigToJavaScriptInjector(newConfig);
                });
            }
        });
        
        // Delete section
        modalInstance.dialogContent.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-section-btn');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[KefinTweaks Configuration] Checking for section to delete...');
                const prefix = deleteBtn.getAttribute('data-prefix');
                const sectionIndexRaw = deleteBtn.getAttribute('data-section-index');
                const isSeasonal = deleteBtn.getAttribute('data-is-seasonal') === 'true';
                console.log('[KefinTweaks Configuration] Prefix:', prefix);
                console.log('[KefinTweaks Configuration] Section Index Raw:', sectionIndexRaw);
                console.log('[KefinTweaks Configuration] Is Seasonal:', isSeasonal);
                if (prefix && sectionIndexRaw !== null) {
                    console.log('[KefinTweaks Configuration] Deleting section...');
                    // For seasonal sections, sectionIndex is a compound string like "0_1", don't parse it
                    const sectionIndex = isSeasonal || sectionIndexRaw.includes('_') ? sectionIndexRaw : parseInt(sectionIndexRaw);
                    deleteSection(prefix, sectionIndex, isSeasonal);
                }
            }
        });
        
        // Preview section
        modalInstance.dialogContent.addEventListener('click', (e) => {
            const previewBtn = e.target.closest('.preview-section-btn');
            if (previewBtn) {
                e.preventDefault();
                e.stopPropagation();
                const prefix = previewBtn.getAttribute('data-prefix');
                const sectionIndexRaw = previewBtn.getAttribute('data-section-index');
                if (prefix && sectionIndexRaw !== null) {
                    // For seasonal sections, sectionIndex is a compound string like "0_1", don't parse it
                    const isSeasonal = prefix === 'seasonal_season' || sectionIndexRaw.includes('_');
                    const sectionIndex = isSeasonal ? sectionIndexRaw : parseInt(sectionIndexRaw, 10);
                    previewSection(prefix, sectionIndex);
                }
            }
        });
        
        // Type dropdown change
        modalInstance.dialogContent.addEventListener('change', (e) => {
            const typeSelect = e.target.closest(`[class*="_section_type"]`);
            if (typeSelect && typeSelect.hasAttribute('data-prefix')) {
                const prefix = typeSelect.getAttribute('data-prefix');
                const sectionIndex = typeSelect.getAttribute('data-section-index');
                const isSeasonal = typeSelect.getAttribute('data-is-seasonal') === 'true';
                updateSectionSourceField(prefix, sectionIndex, isSeasonal);
            }
        });
        
        // Initialize autocomplete for all badge-based sections
        setTimeout(async () => {
            const badgeContainers = modalInstance.dialogContent.querySelectorAll('.tag-badge-container:not(.includeItemTypes-badge-container)');
            for (const container of badgeContainers) {
                const prefix = container.getAttribute('data-prefix');
                const sectionIndex = container.getAttribute('data-section-index');
                const type = container.getAttribute('data-type');
                if (prefix && sectionIndex && type) {
                    await setupBadgeAutocomplete(prefix, sectionIndex, type);
                    if (type === 'Collection' || type === 'Playlist') {
                        await loadBadgeNames(prefix, sectionIndex, type);
                    }
                }
            }
            
            // Initialize autocomplete for Include Item Types fields
            const includeItemTypesContainers = modalInstance.dialogContent.querySelectorAll('.includeItemTypes-badge-container');
            for (const container of includeItemTypesContainers) {
                const prefix = container.getAttribute('data-prefix');
                const sectionIndex = container.getAttribute('data-section-index');
                const availableTypes = container.getAttribute('data-available-types')?.split(',').filter(Boolean) || [];
                if (prefix && sectionIndex) {
                    setupIncludeItemTypesDropdown(prefix, sectionIndex, availableTypes);
                }
            }
            
            // Setup summary update listeners for existing custom sections
            // Setup summary listeners for custom sections
            const customSectionItems = modalInstance.dialogContent.querySelectorAll('.customSection_section_item');
            customSectionItems.forEach(sectionItem => {
                const sectionIndex = sectionItem.getAttribute('data-section-index');
                if (sectionIndex !== null) {
                    setupCustomSectionSummaryListeners(sectionItem, sectionIndex);
                }
            });
            
            // Setup summary listeners for seasonal nested sections
            const seasonalSectionItems = modalInstance.dialogContent.querySelectorAll('.seasonal_season_section_item');
            seasonalSectionItems.forEach(sectionItem => {
                const sectionIndex = sectionItem.getAttribute('data-section-index');
                if (sectionIndex !== null) {
                    setupCustomSectionSummaryListeners(sectionItem, sectionIndex);
                }
            });
            
            // Setup order update listeners for home screen sections
            setupHomeSectionOrderListeners();
            
            // Setup order update listeners for recently released subsections
            setupRecentlyReleasedOrderListeners();
            
            // Setup order update listeners for seasonal seasons
            setupSeasonalSeasonOrderListeners();
            
            // Setup order update listeners for discovery section types
            setupDiscoverySectionTypeOrderListeners();
            
            // Setup name update listeners for seasonal seasons
            setupSeasonalSeasonNameListeners();
        }, 100);
        
        // Setup event listeners to update home section order displays
        function setupHomeSectionOrderListeners() {
            const orderSpans = modalInstance.dialogContent.querySelectorAll('.home-section-order');
            orderSpans.forEach(span => {
                const prefix = span.getAttribute('data-prefix');
                if (prefix) {
                    const orderInput = modalInstance.dialogContent.querySelector(`#${prefix}_order`);
                    if (orderInput) {
                        orderInput.addEventListener('input', () => {
                            span.textContent = orderInput.value || '100';
                        });
                    }
                }
            });
        }
        
        // Setup event listeners to update recently released subsection order displays
        function setupRecentlyReleasedOrderListeners() {
            const moviesOrderSpan = modalInstance.dialogContent.querySelector('.recently-released-movies-order');
            const moviesOrderInput = modalInstance.dialogContent.querySelector('#homeScreen_recentlyReleased_movies_order');
            if (moviesOrderSpan && moviesOrderInput) {
                moviesOrderInput.addEventListener('input', () => {
                    moviesOrderSpan.textContent = moviesOrderInput.value || '30';
                });
            }
            
            const episodesOrderSpan = modalInstance.dialogContent.querySelector('.recently-released-episodes-order');
            const episodesOrderInput = modalInstance.dialogContent.querySelector('#homeScreen_recentlyReleased_episodes_order');
            if (episodesOrderSpan && episodesOrderInput) {
                episodesOrderInput.addEventListener('input', () => {
                    episodesOrderSpan.textContent = episodesOrderInput.value || '31';
                });
            }
            
            // Setup enabled status listeners
            const moviesEnabledSpan = modalInstance.dialogContent.querySelector('.recently-released-movies-enabled');
            const moviesEnabledCheckbox = modalInstance.dialogContent.querySelector('#homeScreen_recentlyReleased_movies_enabled');
            if (moviesEnabledSpan && moviesEnabledCheckbox) {
                moviesEnabledCheckbox.addEventListener('change', () => {
                    moviesEnabledSpan.textContent = moviesEnabledCheckbox.checked ? '已启用' : '已禁用';
                });
            }
            
            const episodesEnabledSpan = modalInstance.dialogContent.querySelector('.recently-released-episodes-enabled');
            const episodesEnabledCheckbox = modalInstance.dialogContent.querySelector('#homeScreen_recentlyReleased_episodes_enabled');
            if (episodesEnabledSpan && episodesEnabledCheckbox) {
                episodesEnabledCheckbox.addEventListener('change', () => {
                    episodesEnabledSpan.textContent = episodesEnabledCheckbox.checked ? '已启用' : '已禁用';
                });
            }
        }
        
        // Setup event listeners to update seasonal season order displays
        function setupSeasonalSeasonOrderListeners() {
            const orderInputs = modalInstance.dialogContent.querySelectorAll('.seasonal-season-order-input');
            orderInputs.forEach(input => {
                const seasonIndex = input.getAttribute('data-index');
                const orderSpan = modalInstance.dialogContent.querySelector(`.seasonal-season-order[data-season-index="${seasonIndex}"]`);
                if (orderSpan) {
                    input.addEventListener('input', () => {
                        orderSpan.textContent = input.value || '100';
                    });
                }
            });
            
            // Setup enabled status listeners
            const enabledCheckboxes = modalInstance.dialogContent.querySelectorAll('.seasonal-season-enabled');
            enabledCheckboxes.forEach(checkbox => {
                const seasonIndex = checkbox.getAttribute('data-index');
                const enabledSpan = modalInstance.dialogContent.querySelector(`.seasonal-season-enabled-display[data-season-index="${seasonIndex}"]`);
                if (enabledSpan) {
                    checkbox.addEventListener('change', () => {
                        enabledSpan.textContent = checkbox.checked ? '已启用' : '已禁用';
                    });
                }
            });
        }
        
        // Setup event listeners to update discovery section type order displays
        function setupDiscoverySectionTypeOrderListeners() {
            DISCOVERY_SECTION_DEFINITIONS.forEach(section => {
                const prefix = `homeScreen_discovery_sectionTypes_${section.key}`;
                const orderInput = modalInstance.dialogContent.querySelector(`#${prefix}_order`);
                const orderSpan = modalInstance.dialogContent.querySelector(`.discovery-section-type-order[data-section-key="${section.key}"]`);
                if (orderInput && orderSpan) {
                    orderInput.addEventListener('input', () => {
                        orderSpan.textContent = orderInput.value || '100';
                    });
                }
                
                // Setup enabled status listeners
                const enabledCheckbox = modalInstance.dialogContent.querySelector(`#${prefix}_enabled`);
                const enabledSpan = modalInstance.dialogContent.querySelector(`.discovery-section-type-enabled[data-section-key="${section.key}"]`);
                if (enabledCheckbox && enabledSpan) {
                    enabledCheckbox.addEventListener('change', () => {
                        enabledSpan.textContent = enabledCheckbox.checked ? '已启用' : '已禁用';
                    });
                }
            });
        }
        
        // Setup event listeners to update seasonal season name displays
        function setupSeasonalSeasonNameListeners() {
            const nameInputs = modalInstance.dialogContent.querySelectorAll('.seasonal-season-name');
            nameInputs.forEach(input => {
                const seasonIndex = input.getAttribute('data-index');
                const nameSpan = modalInstance.dialogContent.querySelector(`.seasonal-season-name-display[data-season-index="${seasonIndex}"]`);
                if (nameSpan) {
                    input.addEventListener('input', () => {
                        nameSpan.textContent = input.value || '未命名季节';
                    });
                }
            });
        }
        
        // Section management functions
        async function addSectionToSeasonalSeason(seasonIndex) {
            const sectionsList = modalInstance.dialogContent.querySelector(`.seasonal_season_sections_list[data-season-index="${seasonIndex}"]`);
            if (!sectionsList) return;
            
            const sectionIndex = sectionsList.querySelectorAll('.seasonal_season_section_item').length;
            const fullIndex = `${seasonIndex}_${sectionIndex}`;
            const newSection = {
                id: `seasonal-${seasonIndex}-section-${sectionIndex}`,
                enabled: true,
                name: '新板块',
                type: 'Genre',
                source: '',
                itemLimit: 16,
                sortOrder: 'Random',
                sortOrderDirection: 'Ascending',
                cardFormat: 'Poster',
                order: 100
            };
            
            const sectionHtml = buildSectionUI('seasonal_season', newSection, fullIndex, true);
            sectionsList.insertAdjacentHTML('beforeend', sectionHtml);
            
            // Initialize the new section's source field
            const newSectionItem = sectionsList.querySelector(`.seasonal_season_section_item[data-section-index="${fullIndex}"]`);
            if (newSectionItem) {
                // Setup summary listeners for the new section
                setupCustomSectionSummaryListeners(newSectionItem, fullIndex);
                
                const typeSelect = newSectionItem.querySelector('.seasonal_season_section_type');
                if (typeSelect) {
                    const type = typeSelect.value;
                    if (type === 'Parent') {
                        // Setup Parent type input sync
                        const parentInput = newSectionItem.querySelector(`.seasonal_season_section_source[data-section-index="${fullIndex}"]`);
                        const parentHidden = newSectionItem.querySelector(`.seasonal_season_section_source_hidden[data-section-index="${fullIndex}"]`);
                        if (parentInput && parentHidden) {
                            parentInput.addEventListener('input', () => {
                                parentHidden.value = parentInput.value;
                            });
                        }
                    } else {
                        await setupBadgeAutocomplete('seasonal_season', fullIndex, type);
                        if (type === 'Collection' || type === 'Playlist') {
                            await loadBadgeNames('seasonal_season', fullIndex, type);
                        }
                    }
                }
                
                // Initialize Include Item Types autocomplete
                const includeItemTypesContainer = newSectionItem.querySelector(`.includeItemTypes-badge-container[data-section-index="${fullIndex}"]`);
                if (includeItemTypesContainer) {
                    const availableTypes = includeItemTypesContainer.getAttribute('data-available-types')?.split(',').filter(Boolean) || [];
                    setupIncludeItemTypesDropdown('seasonal_season', fullIndex, availableTypes);
                }
            }
        };
        
        async function addCustomSection() {
            const sectionsList = modalInstance.dialogContent.querySelector('#customSections_list');
            if (!sectionsList) return;
            
            const sectionIndex = sectionsList.querySelectorAll('.customSection_section_item').length;
            const newSection = {
                id: `custom-section-${sectionIndex}`,
                enabled: true,
                name: '新自定义板块',
                type: 'Collection',
                source: '',
                itemLimit: 16,
                sortOrder: 'Random',
                sortOrderDirection: 'Ascending',
                cardFormat: 'Poster',
                order: 100,
                spotlight: false,
                discoveryEnabled: false
            };
            
            const sectionHtml = buildSectionUI('customSection', newSection, sectionIndex, false);
            sectionsList.insertAdjacentHTML('beforeend', sectionHtml);
            
            // Initialize the new section's source field
            const newSectionItem = sectionsList.querySelector(`.customSection_section_item[data-section-index="${sectionIndex}"]`);
            if (newSectionItem) {
                const typeSelect = newSectionItem.querySelector('.customSection_section_type');
                if (typeSelect) {
                    const type = typeSelect.value;
                    if (type === 'Parent') {
                        // Setup Parent type input sync
                        const parentInput = newSectionItem.querySelector(`.customSection_section_source[data-section-index="${sectionIndex}"]`);
                        const parentHidden = newSectionItem.querySelector(`.customSection_section_source_hidden[data-section-index="${sectionIndex}"]`);
                        if (parentInput && parentHidden) {
                            parentInput.addEventListener('input', () => {
                                parentHidden.value = parentInput.value;
                            });
                        }
                    } else {
                        await setupBadgeAutocomplete('customSection', sectionIndex, type);
                        if (type === 'Collection' || type === 'Playlist') {
                            await loadBadgeNames('customSection', sectionIndex, type);
                        }
                    }
                }
                // Setup summary update listeners for custom sections
                setupCustomSectionSummaryListeners(newSectionItem, sectionIndex);
                
                // Initialize Include Item Types autocomplete
                const includeItemTypesContainer = newSectionItem.querySelector(`.includeItemTypes-badge-container[data-section-index="${sectionIndex}"]`);
                if (includeItemTypesContainer) {
                    const availableTypes = includeItemTypesContainer.getAttribute('data-available-types')?.split(',').filter(Boolean) || [];
                    setupIncludeItemTypesDropdown('customSection', sectionIndex, availableTypes);
                }
            }
        };
        
        // Setup event listeners to update section summary when name/order changes
        // Works for both custom sections and seasonal nested sections
        function setupCustomSectionSummaryListeners(sectionItem, sectionIndex) {
            const prefix = sectionItem.classList.contains('customSection_section_item') ? 'customSection' : 'seasonal_season';
            const sanitizedIndex = sectionIndex.toString().replace(/[^a-zA-Z0-9]/g, '_');
            
            // Find inputs based on prefix
            const nameInput = sectionItem.querySelector(`.${prefix}_section_name[data-section-index="${sectionIndex}"]`);
            const orderInput = sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_order`);
            const enabledCheckbox = sectionItem.querySelector(`#${prefix}_section_enabled_${sanitizedIndex}`) || sectionItem.querySelector(`.${prefix}_section_enabled[data-section-index="${sectionIndex}"]`);
            
            // Find summary display spans based on prefix
            const nameClass = prefix === 'customSection' ? 'custom-section-name' : 'seasonal-section-name';
            const orderClass = prefix === 'customSection' ? 'custom-section-order' : 'seasonal-section-order';
            const enabledClass = prefix === 'customSection' ? 'custom-section-enabled-display' : 'seasonal-section-enabled-display';
            
            const nameSpan = sectionItem.querySelector(`.${nameClass}[data-section-index="${sectionIndex}"]`);
            const orderSpan = sectionItem.querySelector(`.${orderClass}[data-section-index="${sectionIndex}"]`);
            const enabledSpan = sectionItem.querySelector(`.${enabledClass}[data-section-index="${sectionIndex}"]`);
            
            if (nameInput && nameSpan) {
                nameInput.addEventListener('input', () => {
                    nameSpan.textContent = nameInput.value || '未命名板块';
                });
            }
            
            if (orderInput && orderSpan) {
                orderInput.addEventListener('input', () => {
                    orderSpan.textContent = orderInput.value || '100';
                });
            }
            
            if (enabledCheckbox && enabledSpan) {
                enabledCheckbox.addEventListener('change', () => {
                    enabledSpan.textContent = enabledCheckbox.checked ? '已启用' : '已禁用';
                });
            }

            // Setup additional options listeners
            const additionalOptionsControls = sectionItem.querySelector(`.${prefix}_section_additionalOptions_controls[data-section-index="${sectionIndex}"]`);
            const additionalOptionsListContainer = sectionItem.querySelector(`.${prefix}_section_additionalOptions_list_container[data-section-index="${sectionIndex}"]`);
            
            if (additionalOptionsControls) {
                const addBtn = additionalOptionsControls.querySelector('.add-additional-option');
                const select = additionalOptionsControls.querySelector('.additional-option-select');
                const list = additionalOptionsListContainer ? additionalOptionsListContainer.querySelector('.additional-options-list') : null;
                
                if (addBtn && select && list) {
                    addBtn.addEventListener('click', () => {
                        const key = select.value;
                        if (!key) return;
                        
                        const meta = SUPPORTED_CUSTOM_SECTION_PARAMS[key];
                        if (!meta) return;
                        
                        const index = list.children.length;
                        const sanitizedPrefix = `${prefix}_section_${sanitizedIndex}`;
                        const inputId = `${sanitizedPrefix}_additionalOption_${Date.now()}_${index}`;
                        
                        let inputField = '';
                        if (meta.type === 'boolean') {
                            inputField = buildJellyfinCheckbox(inputId, meta.default === true, meta.label, { 
                                'data-key': key, 
                                'class': 'additional-option-value',
                                'data-type': 'boolean'
                            });
                        } else {
                            inputField = `
                                <div style="flex: 1;">
                                    <div class="listItemBodyText" style="margin-bottom: 0.25em;">${meta.label}</div>
                                    <input type="text" id="${inputId}" class="fld emby-input additional-option-value" value="" data-key="${key}" data-type="${meta.type}" placeholder="${meta.hint || ''}" style="width: 100%;">
                                </div>
                            `;
                        }
                        
                        const row = document.createElement('div');
                        row.className = 'additional-option-row';
                        row.style.cssText = 'display: flex; align-items: flex-end; gap: 0.5em; margin-top: 0.5em; padding: 0.5em; background: rgba(255,255,255,0.05); border-radius: 4px;';
                        row.innerHTML = `
                            ${inputField}
                            <button type="button" class="remove-additional-option" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0.25em; display: flex; align-items: center;" title="删除选项">
                                <span class="material-icons">close</span>
                            </button>
                        `;
                        
                        // Add delete listener for new row
                        row.querySelector('.remove-additional-option').addEventListener('click', () => {
                            row.remove();
                        });
                        
                        list.appendChild(row);
                        
                        // Reset select
                        select.value = '';
                    });
                }
            }
            
            // Add listeners for existing delete buttons
            if (additionalOptionsListContainer) {
                additionalOptionsListContainer.querySelectorAll('.remove-additional-option').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const row = e.target.closest('.additional-option-row');
                        if (row) row.remove();
                    });
                });
            }
        }
        
        function deleteSection(prefix, sectionIndex, isSeasonalNested) {
            console.log('[KefinTweaks Configuration] Deleting section:', prefix, sectionIndex, isSeasonalNested);
            // Try both string and number comparison for data-section-index
            const sectionItem = modalInstance.dialogContent.querySelector(
                `.${prefix}_section_item[data-section-index="${sectionIndex}"], .${prefix}_section_item[data-section-index='${sectionIndex}']`
            );
            if (sectionItem && confirm('确定要删除此板块吗？')) {
                sectionItem.remove();
                
                // For seasonal sections, sectionIndex is compound (e.g., "0_1"), need special handling
                if (isSeasonalNested && typeof sectionIndex === 'string' && sectionIndex.includes('_')) {
                    const [seasonIndex, deletedSectionIndex] = sectionIndex.split('_');
                    const sectionsList = modalInstance.dialogContent.querySelector(`.seasonal_season_sections_list[data-season-index="${seasonIndex}"]`);
                    if (sectionsList) {
                        // Re-index only sections within the same season
                        const remainingItems = Array.from(sectionsList.querySelectorAll(`.${prefix}_section_item`))
                            .sort((a, b) => {
                                const aIdx = a.getAttribute('data-section-index');
                                const bIdx = b.getAttribute('data-section-index');
                                if (!aIdx || !bIdx) return 0;
                                // Extract section index part (after underscore)
                                const aSectionIdx = aIdx.includes('_') ? parseInt(aIdx.split('_')[1]) : parseInt(aIdx);
                                const bSectionIdx = bIdx.includes('_') ? parseInt(bIdx.split('_')[1]) : parseInt(bIdx);
                                return aSectionIdx - bSectionIdx;
                            });
                        
                        remainingItems.forEach((item, newSectionIndex) => {
                            const newFullIndex = `${seasonIndex}_${newSectionIndex}`;
                            const oldIndex = item.getAttribute('data-section-index');
                            item.setAttribute('data-section-index', newFullIndex);
                            
                            // Update all inputs within this section
                            item.querySelectorAll(`[data-section-index="${oldIndex}"]`).forEach(el => {
                                el.setAttribute('data-section-index', newFullIndex);
                            });
                            
                            // Update summary displays
                            const summaryName = item.querySelector(`.seasonal-section-name[data-section-index="${oldIndex}"]`);
                            if (summaryName) {
                                summaryName.setAttribute('data-section-index', newFullIndex);
                            }
                            const summaryEnabled = item.querySelector(`.seasonal-section-enabled-display[data-section-index="${oldIndex}"]`);
                            if (summaryEnabled) {
                                summaryEnabled.setAttribute('data-section-index', newFullIndex);
                            }
                            const summaryOrder = item.querySelector(`.seasonal-section-order[data-section-index="${oldIndex}"]`);
                            if (summaryOrder) {
                                summaryOrder.setAttribute('data-section-index', newFullIndex);
                            }
                            
                            // Update delete and preview button data attributes
                            const deleteBtn = item.querySelector('.delete-section-btn');
                            if (deleteBtn) {
                                deleteBtn.setAttribute('data-section-index', newFullIndex);
                            }
                            const previewBtn = item.querySelector('.preview-section-btn');
                            if (previewBtn) {
                                previewBtn.setAttribute('data-section-index', newFullIndex);
                            }
                        });
                    }
                } else {
                    // Regular custom sections - simple re-indexing
                    const remainingItems = Array.from(modalInstance.dialogContent.querySelectorAll(`.${prefix}_section_item`))
                        .sort((a, b) => {
                            const aIndex = parseInt(a.getAttribute('data-section-index')) || 0;
                            const bIndex = parseInt(b.getAttribute('data-section-index')) || 0;
                            return aIndex - bIndex;
                        });
                    
                    remainingItems.forEach((item, newIndex) => {
                        const oldIndex = item.getAttribute('data-section-index');
                        item.setAttribute('data-section-index', newIndex);
                        
                        // Update all inputs within this section
                        item.querySelectorAll(`[data-section-index="${oldIndex}"]`).forEach(el => {
                            el.setAttribute('data-section-index', newIndex);
                        });
                        
                        // Update summary displays that reference section index
                        const summaryName = item.querySelector(`.custom-section-name[data-section-index="${oldIndex}"]`);
                        if (summaryName) {
                            summaryName.setAttribute('data-section-index', newIndex);
                        }
                        const summaryEnabled = item.querySelector(`.custom-section-enabled-display[data-section-index="${oldIndex}"]`);
                        if (summaryEnabled) {
                            summaryEnabled.setAttribute('data-section-index', newIndex);
                        }
                        const summaryOrder = item.querySelector(`.custom-section-order[data-section-index="${oldIndex}"]`);
                        if (summaryOrder) {
                            summaryOrder.setAttribute('data-section-index', newIndex);
                        }
                        
                        // Update delete button data attribute
                        const deleteBtn = item.querySelector('.delete-section-btn');
                        if (deleteBtn) {
                            deleteBtn.setAttribute('data-section-index', newIndex);
                        }
                        const previewBtn = item.querySelector('.preview-section-btn');
                        if (previewBtn) {
                            previewBtn.setAttribute('data-section-index', newIndex);
                        }
                    });
                }
            }
        };
        
        async function previewSection(prefix, sectionIndex) {
            if (!window.ModalSystem) {
                alert('模态框系统不可用，请确保已加载 modal.js。');
                return;
            }
            
            const sectionConfig = getSectionConfigFromUI(modalInstance.dialogContent, prefix, sectionIndex);
            if (!sectionConfig) {
                alert('无法为此板块生成预览，请检查配置值。');
                return;
            }
            
            const modalId = `sectionPreview_${prefix}_${sectionIndex}_${Date.now()}`;
            const contentId = `${modalId}_content`;
            
            const previewModal = window.ModalSystem.create({
                id: modalId,
                title: `预览：${sectionConfig.name || '自定义板块'}`,
                content: `
                    <div id="${contentId}" class="preview-section-container" style="min-height: 320px; display: flex; align-items: center; justify-content: center; padding: 1.5em;>
                        <div style="opacity: 0.75;">正在准备预览…</div>
                    </div>
                `,
                footer: `
                    <button class="emby-button raised" id="${modalId}_closeBtn" style="padding: 0.75em 2em; font-size: 1em;">
                        <span>关闭</span>
                    </button>
                `,
                closeOnBackdrop: true,
                closeOnEscape: true,
                size: 'large',
                onOpen: async (previewInstance) => {
                    previewInstance.dialogContent.style.width = '1400px';

                    const closeBtn = previewInstance.dialogFooter?.querySelector(`#${modalId}_closeBtn`);
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => previewInstance.close());
                    }
                    
                    const container = previewInstance.dialogContent.querySelector(`#${contentId}`);
                    if (!container) {
                        return;
                    }
                    
                    container.innerHTML = `<div style="opacity: 0.75;">正在加载预览…</div>`;
                    
                    try {
                        const items = await fetchItemsForSectionPreview(sectionConfig);
                        if (!items || items.length === 0) {
                            container.innerHTML = `<div style="opacity: 0.75; text-align: center;">暂无符合此配置的条目。</div>`;
                            return;
                        }
                        
                        if (!window.cardBuilder) {
                            container.innerHTML = `<div style="color: #ff6b6b; text-align: center;">卡片构建工具不可用。</div>`;
                            return;
                        }
                        
                        let previewElement = null;
                        if (sectionConfig.spotlight && typeof window.cardBuilder.renderSpotlightSection === 'function') {
                            previewElement = window.cardBuilder.renderSpotlightSection(items, sectionConfig.name || '预览', {
                                autoPlay: false,
                                showDots: true,
                                showNavButtons: true,
                                viewMoreUrl: null
                            });
                        } else if (typeof window.cardBuilder.renderCards === 'function') {
                            previewElement = window.cardBuilder.renderCards(
                                items,
                                sectionConfig.name || '预览',
                                null,
                                true,
                                sectionConfig.cardFormat || 'Poster',
                                sectionConfig.sortOrder || 'Random',
                                sectionConfig.sortOrderDirection || 'Ascending'
                            );
                        }
                        
                        container.innerHTML = '';
                        if (previewElement) {
                            container.appendChild(previewElement);
                        } else {
                            container.innerHTML = `<div style="opacity: 0.75; text-align: center;">无法使用当前配置渲染预览。</div>`;
                        }
                    } catch (error) {
                        console.error('[KefinTweaks Configuration] Error rendering preview:', error);
                        container.innerHTML = `<div style="color: #ff6b6b; text-align: center;">加载预览失败：${error?.message || error}</div>`;
                    }
                }
            });
            
            previewModal.open();
        }
        
        async function updateSectionSourceField(prefix, sectionIndex, isSeasonalNested) {
            const sectionItem = modalInstance.dialogContent.querySelector(`.${prefix}_section_item[data-section-index="${sectionIndex}"]`);
            if (!sectionItem) {
                console.warn(`[KefinTweaks Configuration] Section item not found for prefix: ${prefix}, index: ${sectionIndex}`);
                return;
            }
            
            const typeSelect = sectionItem.querySelector(`.${prefix}_section_type[data-section-index="${sectionIndex}"]`);
            if (!typeSelect) {
                console.warn(`[KefinTweaks Configuration] Type select not found for prefix: ${prefix}, index: ${sectionIndex}`);
                return;
            }
            const type = typeSelect.value || 'Genre';
            
            // Find the source field container using the specific class
            const sourceContainer = sectionItem.querySelector(`.${prefix}_section_source_container[data-section-index="${sectionIndex}"]`);
            if (!sourceContainer) {
                console.warn(`[KefinTweaks Configuration] Source container not found for prefix: ${prefix}, index: ${sectionIndex}`);
                return;
            }
            
            // Get current source value
            const currentSourceInput = sectionItem.querySelector(`.${prefix}_section_source[data-section-index="${sectionIndex}"]`);
            const badgeContainer = sourceContainer?.querySelector(`.tag-badge-container[data-section-index="${sectionIndex}"][data-type]`) || null;
            let currentSource = '';
            
            if (badgeContainer) {
                // Extract from existing badges
                const badges = badgeContainer.querySelectorAll('.tag-badge');
                currentSource = Array.from(badges).map(badge => badge.getAttribute('data-value')).filter(Boolean).join(', ');
            } else if (currentSourceInput) {
                // Extract from dropdown/input
                currentSource = currentSourceInput.value || '';
            }
            
            // Clear badges whenever the source type changes
            // This ensures a clean state when switching between any types
            const currentType = currentSourceInput?.dataset?.type || badgeContainer?.dataset?.type;
            if (currentType && currentType !== type) {
                currentSource = '';
            }
            
            let newSourceHtml = '';
            
            if (type === 'Parent') {
                // Parent type uses simple text input
                newSourceHtml = `
                    <div style="position: relative;">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">父级 ID（逗号分隔，留空表示“任意”）</div>
                        <input type="text" class="${prefix}_section_source fld emby-input" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-type="${type}" value="${currentSource}" placeholder="输入父级 ID（如 collection-id、playlist-id），或留空" style="width: 100%;">
                        <input type="hidden" class="${prefix}_section_source_hidden" data-section-index="${sectionIndex}" value="${currentSource}">
                    </div>
                `;
            } else {
                // Build new badge-based UI for other types
                const sourceArray = currentSource ? currentSource.split(',').map(s => s.trim()).filter(Boolean) : [];
                const badgesHtml = sourceArray.map(val => {
                    if (type === 'Tag' || type === 'Genre') {
                        return `<span class="tag-badge" data-value="${val}" style="display: inline-flex; align-items: center; gap: 0.25em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; margin: 0.25em; font-size: 0.9em;">
                            ${val}
                            <button type="button" class="tag-badge-remove" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0; margin-left: 0.25em; font-size: 1.2em; line-height: 1; display: flex; align-items: center;" title="删除">×</button>
                        </span>`;
                    } else {
                        return `<span class="tag-badge" data-value="${val}" data-loading="true" style="display: inline-flex; align-items: center; gap: 0.25em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; margin: 0.25em; font-size: 0.9em;">
                            ${val}
                            <button type="button" class="tag-badge-remove" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0; margin-left: 0.25em; font-size: 1.2em; line-height: 1; display: flex; align-items: center;" title="删除">×</button>
                        </span>`;
                    }
                }).join('');
                
                newSourceHtml = `
                    <div style="position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em;">
                            <div class="listItemBodyText">${type}</div>
                            <button type="button" class="badge-clear-all" data-section-index="${sectionIndex}" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; color: rgba(255,255,255,0.87); cursor: pointer; font-size: 0.85em;" title="清空全部">清空全部</button>
                        </div>
                        <div class="tag-badge-container" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-type="${type}" style="min-height: 2.5em; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.5em; margin-bottom: 0.5em; background: rgba(0,0,0,0.2); display: flex; gap: 0.5em; align-items: flex-start; overflow: hidden;">
                            <input type="text" class="${prefix}_section_source fld emby-input autocomplete-input" data-section-index="${sectionIndex}" data-prefix="${prefix}" data-type="${type}" placeholder="输入以添加 ${type.toLowerCase()}…" autocomplete="off" style="flex: 0 0 auto; width: 120px; min-width: 200px; max-width: 120px; border: none; background: transparent; outline: none; color: rgba(255,255,255,0.87); padding: 0.25em;">
                            <div style="flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 0.25em; align-items: flex-start; overflow-wrap: break-word;">
                                ${badgesHtml}
                            </div>
                        </div>
                        <input type="hidden" class="${prefix}_section_source_hidden" data-section-index="${sectionIndex}" value="${currentSource}">
                        <div class="autocomplete-suggestions" data-section-index="${sectionIndex}" style="display: none; position: absolute; z-index: 10000; background: #1a1a1a !important; color: rgba(255,255,255,0.87) !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; max-height: 200px; overflow-y: auto; margin-top: 2px; width: 100%; box-sizing: border-box; opacity: 1 !important; top: 100%; left: 0;"></div>
                    </div>
                `;
            }
            
            sourceContainer.innerHTML = newSourceHtml;
            
            // Setup event listener for Parent type to sync input with hidden field
            if (type === 'Parent') {
                const parentInput = sourceContainer.querySelector(`.${prefix}_section_source[data-section-index="${sectionIndex}"]`);
                const parentHidden = sourceContainer.querySelector(`.${prefix}_section_source_hidden[data-section-index="${sectionIndex}"]`);
                if (parentInput && parentHidden) {
                    parentInput.addEventListener('input', () => {
                        parentHidden.value = parentInput.value;
                    });
                }
            } else {
                // Initialize autocomplete for other types
                await setupBadgeAutocomplete(prefix, sectionIndex, type);
                
                // Load names for Collections/Playlists
                if (type === 'Collection' || type === 'Playlist') {
                    await loadBadgeNames(prefix, sectionIndex, type);
                }
            }
            
            // Update Include Item Types field to reflect available types based on source type
            const includeItemTypesContainer = sectionItem.querySelector(`.${prefix}_section_includeItemTypes_container[data-section-index="${sectionIndex}"]`);
            if (includeItemTypesContainer) {
                const currentBadges = includeItemTypesContainer.querySelectorAll('.tag-badge');
                const currentTypes = Array.from(currentBadges).map(badge => badge.getAttribute('data-value')).filter(Boolean);
                const availableTypes = type === 'Parent' 
                    ? ['Movie', 'Series', 'Season', 'Episode', 'MusicArtist', 'MusicAlbum', 'Audio', 'MusicVideo', 'Book', 'BoxSet', 'Playlist']
                    : ['Movie', 'Series', 'Season', 'Episode', 'MusicArtist', 'MusicAlbum', 'Audio', 'MusicVideo', 'Book'];
                
                // Remove invalid types (types not available for current source type)
                const validTypes = currentTypes.filter(t => availableTypes.includes(t));
                
                // Rebuild the Include Item Types field
                const sanitizedPrefix = `${prefix}_section_${sectionIndex.toString().replace(/[^a-zA-Z0-9]/g, '_')}`;
                const newIncludeItemTypesHtml = buildIncludeItemTypesField(prefix, sectionIndex, sanitizedPrefix, validTypes, type);
                includeItemTypesContainer.outerHTML = newIncludeItemTypesHtml;
                
                // Re-initialize autocomplete for Include Item Types
                const newContainer = sectionItem.querySelector(`.includeItemTypes-badge-container[data-section-index="${sectionIndex}"]`);
                if (newContainer) {
                    setupIncludeItemTypesDropdown(prefix, sectionIndex, availableTypes);
                }
            }
        }
        
        // Generic badge management system
        const BadgeSystem = {
            /**
             * Creates a badge element
             * @param {string} value - The value to store (ID for collections/playlists, name for tags/genres)
             * @param {string} displayText - The text to display
             * @returns {HTMLElement} Badge element
             */
            createBadge(value, displayText) {
                const badge = document.createElement('span');
                badge.className = 'tag-badge';
                badge.setAttribute('data-value', value);
                badge.style.cssText = 'display: inline-flex; align-items: center; gap: 0.25em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.25em 0.5em; margin: 0.25em; font-size: 0.9em;';
                badge.innerHTML = `${displayText}<button type="button" class="tag-badge-remove" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0; margin-left: 0.25em; font-size: 1.2em; line-height: 1; display: flex; align-items: center;" title="删除">×</button>`;
                return badge;
            },
            
            /**
             * Adds a badge to the container
             */
            addBadge(prefix, sectionIndex, value, displayText, badgeContainer, input, hiddenInput) {
                // Check if badge already exists
                const existingBadges = badgeContainer.querySelectorAll('.tag-badge');
                const alreadyExists = Array.from(existingBadges).some(badge => 
                    badge.getAttribute('data-value') === value
                );
                if (alreadyExists) return;
                
                // Find the badges wrapper div (sibling of the input in new layout, or container in old layout)
                const badgesWrapper = input.nextElementSibling && input.nextElementSibling.matches('div') 
                    ? input.nextElementSibling 
                    : badgeContainer;
                
                const badge = this.createBadge(value, displayText);
                badgesWrapper.appendChild(badge);
                input.value = '';
                this.updateHiddenInput(prefix, sectionIndex, badgeContainer, hiddenInput);
            },
            
            /**
             * Removes a badge from the container
             */
            removeBadge(prefix, sectionIndex, badge, badgeContainer, hiddenInput) {
                badge.remove();
                this.updateHiddenInput(prefix, sectionIndex, badgeContainer, hiddenInput);
            },
            
            /**
             * Removes all badges from the container
             */
            clearAll(prefix, sectionIndex, badgeContainer, hiddenInput) {
                const badges = badgeContainer.querySelectorAll('.tag-badge');
                badges.forEach(badge => badge.remove());
                this.updateHiddenInput(prefix, sectionIndex, badgeContainer, hiddenInput);
            },
            
            /**
             * Updates hidden input from badges
             */
            updateHiddenInput(prefix, sectionIndex, badgeContainer, hiddenInput) {
                const badges = badgeContainer.querySelectorAll('.tag-badge');
                const values = Array.from(badges).map(badge => badge.getAttribute('data-value')).filter(Boolean);
                if (hiddenInput) {
                    hiddenInput.value = values.join(', ');
                }
            },
            
            /**
             * Gets existing badge values (for deduplication)
             */
            getExistingBadges(badgeContainer) {
                const badges = badgeContainer.querySelectorAll('.tag-badge');
                return Array.from(badges).map(badge => badge.getAttribute('data-value').toLowerCase());
            }
        };
        
        // Generic autocomplete setup for badge-based inputs
        // Supports: Tag, Genre, Collection, Playlist
        async function setupBadgeAutocomplete(prefix, sectionIndex, type) {
            const badgeContainer = modalInstance.dialogContent.querySelector(
                `.tag-badge-container[data-section-index="${sectionIndex}"][data-type="${type}"]`
            );
            const input = modalInstance.dialogContent.querySelector(
                `.${prefix}_section_source.autocomplete-input[data-section-index="${sectionIndex}"]`
            );
            const suggestionsDiv = modalInstance.dialogContent.querySelector(
                `.autocomplete-suggestions[data-section-index="${sectionIndex}"]`
            );
            const hiddenInput = modalInstance.dialogContent.querySelector(
                `.${prefix}_section_source_hidden[data-section-index="${sectionIndex}"]`
            );
            const clearAllBtn = modalInstance.dialogContent.querySelector(
                `.badge-clear-all[data-section-index="${sectionIndex}"]`
            );
            
            if (!badgeContainer || !input || !suggestionsDiv) return;
            
            // Setup badge remove handlers
            badgeContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-badge-remove') || e.target.closest('.tag-badge-remove')) {
                    const badge = e.target.closest('.tag-badge');
                    if (badge) {
                        BadgeSystem.removeBadge(prefix, sectionIndex, badge, badgeContainer, hiddenInput);
                    }
                }
            });
            
            // Setup clear all button
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => {
                    BadgeSystem.clearAll(prefix, sectionIndex, badgeContainer, hiddenInput);
                });
            }
            
            // Fetch available options based on type
            let options = [];
            try {
                const userId = window.ApiClient.getCurrentUserId();
                const serverAddress = window.ApiClient.serverAddress();
                
                if (type === 'Tag' || type === 'Genre') {
                    const url = `${serverAddress}/Items/Filters?UserId=${userId}&IncludeItemTypes=Movie`;
                    const data = await window.apiHelper.getData(url, true);
                    options = type === 'Tag' ? (data.Tags || []) : (data.Genres || []);
                } else if (type === 'Collection' || type === 'Playlist') {
                    // Fetch Collections/Playlists using getItems with caching
                    const itemType = type === 'Playlist' ? 'Playlist' : 'BoxSet,CollectionFolder';
                    const data = await window.apiHelper.getItems(
                        {
                            IncludeItemTypes: itemType,
                            Recursive: true,
                            Fields: 'ItemCounts'
                        },
                        true,
                        300000
                    );
                    options = (data.Items || []).map(item => ({
                        id: item.Id,
                        name: item.Name
                    }));
                }
            } catch (err) {
                console.error('[KefinTweaks Configuration] Error fetching options:', err);
            }
            
            let currentSuggestions = [];
            let selectedIndex = -1;
            
            const getExistingBadges = () => BadgeSystem.getExistingBadges(badgeContainer);
            
            input.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length === 0) {
                    suggestionsDiv.style.display = 'none';
                    return;
                }
                
                const existing = getExistingBadges();
                
                // Filter options based on type
                if (type === 'Tag' || type === 'Genre') {
                    currentSuggestions = options.filter(opt => 
                        opt.toLowerCase().includes(value.toLowerCase()) &&
                        !existing.includes(opt.toLowerCase())
                    ).slice(0, 10);
                } else {
                    // Collections/Playlists: search by name, exclude by ID
                    currentSuggestions = options.filter(opt => 
                        opt.name.toLowerCase().includes(value.toLowerCase()) &&
                        !existing.includes(opt.id.toLowerCase())
                    ).slice(0, 10);
                }
                
                if (currentSuggestions.length > 0) {
                    suggestionsDiv.innerHTML = currentSuggestions.map((opt, idx) => {
                        const display = type === 'Tag' || type === 'Genre' ? opt : opt.name;
                        const dataValue = type === 'Tag' || type === 'Genre' ? opt : opt.id;
                        return `<div class="autocomplete-suggestion" data-index="${idx}" data-value="${dataValue}" data-display="${display}" style="padding: 0.5em; cursor: pointer; border-left: 3px solid transparent;">${display}</div>`;
                    }).join('');
                    suggestionsDiv.style.display = 'block';
                    selectedIndex = -1;
                    // Set up mouse event handlers for each suggestion
                    const suggestionItems = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
                    suggestionItems.forEach((item, idx) => {
                        item.addEventListener('mouseenter', () => {
                            // Clear keyboard selection
                            selectedIndex = -1;
                            updateSuggestionHighlight();
                            // Highlight hovered item
                            item.style.background = 'rgba(255,255,255,0.1)';
                        });
                        item.addEventListener('mouseleave', () => {
                            item.style.background = '';
                        });
                    });
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            });
            
            // Handle suggestion clicks
            suggestionsDiv.addEventListener('click', (e) => {
                const suggestion = e.target.closest('.autocomplete-suggestion');
                if (!suggestion) return;
                
                const selectedValue = suggestion.getAttribute('data-value');
                const displayText = suggestion.getAttribute('data-display') || selectedValue;
                
                BadgeSystem.addBadge(prefix, sectionIndex, selectedValue, displayText, badgeContainer, input, hiddenInput);
                suggestionsDiv.style.display = 'none';
                selectedIndex = -1;
                input.focus();
            });
            
            // Function to show all available suggestions (excluding already selected)
            function showAllSuggestions() {
                const existing = getExistingBadges();
                
                // Filter options based on type, excluding already selected
                if (type === 'Tag' || type === 'Genre') {
                    currentSuggestions = options.filter(opt => 
                        !existing.includes(opt.toLowerCase())
                    ).slice(0, 30);
                } else {
                    // Collections/Playlists: exclude by ID
                    currentSuggestions = options.filter(opt => 
                        !existing.includes(opt.id.toLowerCase())
                    ).slice(0, 30);
                }
                
                if (currentSuggestions.length > 0) {
                    suggestionsDiv.innerHTML = currentSuggestions.map((opt, idx) => {
                        const display = type === 'Tag' || type === 'Genre' ? opt : opt.name;
                        const dataValue = type === 'Tag' || type === 'Genre' ? opt : opt.id;
                        return `<div class="autocomplete-suggestion" data-index="${idx}" data-value="${dataValue}" data-display="${display}" style="padding: 0.5em; cursor: pointer; border-left: 3px solid transparent;">${display}</div>`;
                    }).join('');
                    suggestionsDiv.style.display = 'block';
                    selectedIndex = 0;
                    updateSuggestionHighlight();
                    // Set up mouse event handlers for each suggestion
                    const suggestionItems = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
                    suggestionItems.forEach((item, idx) => {
                        item.addEventListener('mouseenter', () => {
                            // Clear keyboard selection
                            selectedIndex = -1;
                            updateSuggestionHighlight();
                            // Highlight hovered item
                            item.style.background = 'rgba(255,255,255,0.1)';
                        });
                        item.addEventListener('mouseleave', () => {
                            item.style.background = '';
                        });
                    });
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            }
            
            // Handle keyboard navigation
            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    // If input is empty and no suggestions shown, show all suggestions
                    if (input.value.trim().length === 0 && suggestionsDiv.style.display === 'none') {
                        showAllSuggestions();
                        return;
                    }
                    // If suggestions are shown, navigate
                    if (currentSuggestions.length > 0) {
                        selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
                        updateSuggestionHighlight();
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (currentSuggestions.length > 0) {
                        selectedIndex = Math.max(selectedIndex - 1, -1);
                        updateSuggestionHighlight();
                        // If we go above the first item, hide suggestions
                        if (selectedIndex < 0) {
                            suggestionsDiv.style.display = 'none';
                        }
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
                        const selected = currentSuggestions[selectedIndex];
                        const value = type === 'Tag' || type === 'Genre' ? selected : selected.id;
                        const display = type === 'Tag' || type === 'Genre' ? selected : selected.name;
                        BadgeSystem.addBadge(prefix, sectionIndex, value, display, badgeContainer, input, hiddenInput);
                        suggestionsDiv.style.display = 'none';
                        selectedIndex = -1;
                    }
                    // No free-form entry - require autocomplete selection
                } else if (e.key === 'Escape') {
                    suggestionsDiv.style.display = 'none';
                    selectedIndex = -1;
                } else if (e.key === 'Backspace' && input.value === '') {
                    const badges = badgeContainer.querySelectorAll('.tag-badge');
                    if (badges.length > 0) {
                        const lastBadge = badges[badges.length - 1];
                        BadgeSystem.removeBadge(prefix, sectionIndex, lastBadge, badgeContainer, hiddenInput);
                    }
                }
            });
            
            function updateSuggestionHighlight() {
                const items = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
                items.forEach((item, idx) => {
                    if (idx === selectedIndex) {
                        item.style.background = 'rgba(0, 122, 255, 0.3)';
                        item.style.borderLeft = '3px solid rgba(0, 122, 255, 0.8)';
                        item.style.fontWeight = '500';
                        // Scroll into view if needed
                        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    } else {
                        item.style.background = '';
                        item.style.borderLeft = '3px solid transparent';
                        item.style.fontWeight = '';
                    }
                });
            }

            // Hide suggestions when focus leaves the input
            input.addEventListener('blur', () => {
                suggestionsDiv.style.display = 'none';
            });
        }
        
        // Loads and updates badge display text for Collections/Playlists
        // Replaces IDs with names after fetching from API
        async function loadBadgeNames(prefix, sectionIndex, type) {
            if (type !== 'Collection' && type !== 'Playlist') return;
            
            const badgeContainer = modalInstance.dialogContent.querySelector(
                `.tag-badge-container[data-section-index="${sectionIndex}"][data-type="${type}"]`
            );
            if (!badgeContainer) return;
            
            const badges = badgeContainer.querySelectorAll('.tag-badge[data-loading="true"]');
            if (badges.length === 0) return;
            
            try {
                const itemType = type === 'Playlist' ? 'Playlist' : 'BoxSet,CollectionFolder';
                const data = await window.apiHelper.getItems(
                    {
                        IncludeItemTypes: itemType,
                        Recursive: true,
                        Fields: 'ItemCounts'
                    },
                    true,
                    300000
                );
                
                const items = data.Items || [];
                const itemMap = new Map(items.map(item => [item.Id, item]));
                
                badges.forEach(badge => {
                    const id = badge.getAttribute('data-value');
                    const item = itemMap.get(id);
                    if (item) {
                        const displayText = item.Name;
                        badge.innerHTML = `${displayText}<button type="button" class="tag-badge-remove" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 0; margin-left: 0.25em; font-size: 1.2em; line-height: 1; display: flex; align-items: center;" title="删除">×</button>`;
                        badge.removeAttribute('data-loading');
                    } else {
                        // Item not found, keep ID display
                        badge.removeAttribute('data-loading');
                    }
                });
            } catch (err) {
                console.error('[KefinTweaks Configuration] Error loading badge names:', err);
                badges.forEach(badge => badge.removeAttribute('data-loading'));
            }
        }
        
        // Setup dropdown for Include Item Types field
        function setupIncludeItemTypesDropdown(prefix, sectionIndex, availableTypes) {
            const badgeContainer = modalInstance.dialogContent.querySelector(
                `.includeItemTypes-badge-container[data-section-index="${sectionIndex}"]`
            );
            const toggleButton = badgeContainer?.querySelector('.includeItemTypes-dropdown-toggle');
            const dropdown = badgeContainer?.querySelector('.includeItemTypes-dropdown');
            const checkboxNodes = badgeContainer ? Array.from(badgeContainer.querySelectorAll('.includeItemTypes-option')) : [];
            const proxyInput = modalInstance.dialogContent.querySelector(
                `.${prefix}_section_includeItemTypes[data-section-index="${sectionIndex}"]`
            );
            const hiddenInput = modalInstance.dialogContent.querySelector(
                `.${prefix}_section_includeItemTypes_hidden[data-section-index="${sectionIndex}"]`
            );
            const badgesWrapper = badgeContainer?.querySelector('.includeItemTypes-badges');
            const emptyState = badgeContainer?.querySelector('.includeItemTypes-empty');
            const clearAllBtn = modalInstance.dialogContent.querySelector(
                `.badge-clear-all[data-section-index="${sectionIndex}"][data-field="includeItemTypes"]`
            );
            const allowedTypeSet = new Set((availableTypes || []).map(type => type.toLowerCase()));
            
            if (!badgeContainer || !dropdown || !proxyInput || !hiddenInput || !badgesWrapper) return;
            
            const closeDropdown = () => {
                dropdown.style.display = 'none';
                toggleButton?.setAttribute('aria-expanded', 'false');
            };
            
            const openDropdown = () => {
                dropdown.style.display = 'block';
                toggleButton?.setAttribute('aria-expanded', 'true');
            };
            
            toggleButton?.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.style.display === 'block';
                if (isOpen) {
                    closeDropdown();
                } else {
                    openDropdown();
                }
            });
            
            document.addEventListener('click', (e) => {
                if (!badgeContainer.contains(e.target)) {
                    closeDropdown();
                }
            });
            
            const updateEmptyState = () => {
                const hasBadges = badgesWrapper.querySelector('.tag-badge');
                if (hasBadges) {
                    emptyState?.setAttribute('hidden', 'true');
                } else {
                    emptyState?.removeAttribute('hidden');
                }
            };
            
            // Setup badge remove handlers
            badgeContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-badge-remove') || e.target.closest('.tag-badge-remove')) {
                    const badge = e.target.closest('.tag-badge');
                    if (badge) {
                        const value = badge.getAttribute('data-value');
                        const checkbox = checkboxNodes.find(cb => cb.value === value);
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                        BadgeSystem.removeBadge(prefix, sectionIndex, badge, badgeContainer, hiddenInput);
                        updateEmptyState();
                        syncToggleLabel();
                    }
                }
            });
            
            const syncToggleLabel = () => {
                const count = badgesWrapper.querySelectorAll('.tag-badge').length;
                if (toggleButton) {
                    const textSpan = toggleButton.querySelector('.includeItemTypes-toggle-label');
                    if (textSpan) {
                        textSpan.textContent = count > 0 ? `已选择 ${count} 个` : '选择条目类型';
                    }
                }
            };
            
            const handleCheckboxChange = (checkbox) => {
                const value = checkbox.value;
                if (!value || (allowedTypeSet.size && !allowedTypeSet.has(value.toLowerCase()))) return;
                
                if (checkbox.checked) {
                    BadgeSystem.addBadge(prefix, sectionIndex, value, value, badgeContainer, proxyInput, hiddenInput);
                } else {
                    const badge = badgesWrapper.querySelector(`.tag-badge[data-value="${value}"]`);
                    if (badge) {
                        BadgeSystem.removeBadge(prefix, sectionIndex, badge, badgeContainer, hiddenInput);
                    } else {
                        BadgeSystem.updateHiddenInput(prefix, sectionIndex, badgeContainer, hiddenInput);
                    }
                }
                updateEmptyState();
                syncToggleLabel();
            };
            
            checkboxNodes.forEach(checkbox => {
                checkbox.addEventListener('change', () => handleCheckboxChange(checkbox));
            });
            
            // Setup clear all button
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => {
                    checkboxNodes.forEach(cb => {
                        cb.checked = false;
                    });
                    BadgeSystem.clearAll(prefix, sectionIndex, badgeContainer, hiddenInput);
                    updateEmptyState();
                    syncToggleLabel();
                });
            }
            
            // Ensure badges match checked state on init
            checkboxNodes.forEach(cb => {
                if (cb.checked && !badgesWrapper.querySelector(`.tag-badge[data-value="${cb.value}"]`)) {
                    BadgeSystem.addBadge(prefix, sectionIndex, cb.value, cb.value, badgeContainer, proxyInput, hiddenInput);
                }
            });
            updateEmptyState();
            syncToggleLabel();
        }
        
        // Seasonal season management functions (exposed globally for onclick handlers)
        window.addNewSeasonalSeason = function() {
            const seasonsList = modalInstance.dialogContent.querySelector('#homeScreen_seasonal_seasons_list');
            if (!seasonsList) return;
            
            const newIndex = seasonsList.querySelectorAll('.seasonal-season-item').length;
            const newSeason = {
                id: `season-${newIndex}`,
                enabled: true,
                name: '新季',
                startDate: '',
                endDate: '',
                order: 100,
                sections: []
            };
            
            const newSeasonHtml = `
                <details class="seasonal-season-item" data-season-index="${newIndex}" style="border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0; margin-bottom: 1em; background: rgba(255,255,255,0.02);">
                    <summary class="seasonal-season-summary" data-season-index="${newIndex}" style="display: flex; justify-content: space-between; align-items: center; padding: 1em; cursor: pointer; list-style: none; user-select: none;">
                        <div class="listItemBodyText" style="font-weight: 500; display: flex; align-items: center; gap: 0.5em;">
                            <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                        <span class="seasonal-season-name-display" data-season-index="${newIndex}">新季</span>
                        <span class="listItemBodyText secondary" style="font-size: 0.9em; font-weight: normal;">(<span class="seasonal-season-enabled-display" data-season-index="${newIndex}">已启用</span>，排序: <span class="seasonal-season-order" data-season-index="${newIndex}">100</span>)</span>
                        </div>
                        <div style="display: flex; gap: 0.5em;">
                            <button class="emby-button" onclick="deleteSeasonalSeason(${newIndex})" style="padding: 0.5em 1em; font-size: 0.9em; background: rgba(255,0,0,0.2);">删除</button>
                        </div>
                    </summary>
                    <div style="padding: 0 1em 1em 1em; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75em; margin-bottom: 0.75em; margin-top: 0.75em;">
                            <div>
                                <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">启用</div>
                                ${buildJellyfinCheckbox(`seasonal-season-enabled-${newIndex}`, true, '启用', { 'data-index': newIndex, 'class': 'seasonal-season-enabled' })}
                            </div>
                            <div>
                                <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">名称</div>
                                <input type="text" class="seasonal-season-name fld emby-input" data-index="${newIndex}" value="" style="width: 100%;">
                            </div>
                            <div>
                                <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">开始日期 (MM-DD)</div>
                                <input type="text" class="seasonal-season-startDate fld emby-input" data-index="${newIndex}" value="" placeholder="10-01" style="width: 100%;">
                            </div>
                            <div>
                                <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em;">结束日期 (MM-DD)</div>
                                <input type="text" class="seasonal-season-endDate fld emby-input" data-index="${newIndex}" value="" placeholder="10-31" style="width: 100%;">
                            </div>
                            <div>
                                <div class="listItemBodyText secondary" style="font-size: 0.85em; margin-bottom: 0.25em; display: flex; align-items: center; gap: 0.4em;">排序</div>
                                <input type="number" class="seasonal-season-order-input fld emby-input" data-index="${newIndex}" value="100" min="0" style="width: 100%;">
                            </div>
                        </div>
                        <div style="margin-top: 0.75em; margin-bottom: 0.75em;">
                            <div class="listItemBodyText" style="font-weight: 500; margin-bottom: 0.5em;">板块</div>
                            <div class="seasonal_season_sections_list" data-season-index="${newIndex}">
                            </div>
                            <button type="button" class="emby-button raised add-section-to-seasonal-btn" data-season-index="${newIndex}" style="padding: 0.75em 1.5em; margin-top: 0.5em;">
                                <span>添加板块</span>
                            </button>
                        </div>
                    </div>
                </details>
            `;
            seasonsList.insertAdjacentHTML('beforeend', newSeasonHtml);
            
            // Setup listeners for the new season
            const newSeasonItem = seasonsList.querySelector(`.seasonal-season-item[data-season-index="${newIndex}"]`);
            if (newSeasonItem) {
                const nameInput = newSeasonItem.querySelector(`.seasonal-season-name[data-index="${newIndex}"]`);
                const nameSpan = newSeasonItem.querySelector(`.seasonal-season-name-display[data-season-index="${newIndex}"]`);
                const orderInput = newSeasonItem.querySelector(`.seasonal-season-order-input[data-index="${newIndex}"]`);
                const orderSpan = newSeasonItem.querySelector(`.seasonal-season-order[data-season-index="${newIndex}"]`);
                const enabledCheckbox = newSeasonItem.querySelector(`#seasonal-season-enabled-${newIndex}`) || newSeasonItem.querySelector(`.seasonal-season-enabled[data-index="${newIndex}"]`);
                const enabledSpan = newSeasonItem.querySelector(`.seasonal-season-enabled-display[data-season-index="${newIndex}"]`);
                
                if (nameInput && nameSpan) {
                    nameInput.addEventListener('input', () => {
                        nameSpan.textContent = nameInput.value || '未命名季';
                    });
                }
                
                if (orderInput && orderSpan) {
                    orderInput.addEventListener('input', () => {
                        orderSpan.textContent = orderInput.value || '100';
                    });
                }
                
                if (enabledCheckbox && enabledSpan) {
                    enabledCheckbox.addEventListener('change', () => {
                        enabledSpan.textContent = enabledCheckbox.checked ? '已启用' : '已禁用';
                    });
                }
            }
        };
        
        // Collection and Playlist picker functions
        window.openCollectionPicker = async function(seasonIndex) {
            if (!window.ModalSystem) {
                alert('模态框系统不可用');
                return;
            }
            
            try {
                // Fetch collections from server
                const userId = window.ApiClient.getCurrentUserId();
                const serverAddress = window.ApiClient.serverAddress();
                const token = window.ApiClient.accessToken();
                
                const response = await fetch(`${serverAddress}/Users/${userId}/Items?IncludeItemTypes=BoxSet,CollectionFolder&Recursive=true&Fields=ItemCounts`, {
                    headers: { 'Authorization': window.apiHelper.getAuthHeader() }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                const collections = data.Items || [];
                
                // Get currently selected collections
                const hiddenInput = modalInstance.dialogContent.querySelector(`.seasonal-season-collections[data-index="${seasonIndex}"]`);
                const selectedIds = hiddenInput ? JSON.parse(hiddenInput.value || '[]') : [];
                
                // Create picker modal
                let pickerModalInstanceRef = null;
                const pickerModal = window.ModalSystem.create({
                    id: 'collectionPickerModal',
                    title: '选择合集',
                    content: `
                        <div style="max-height: 60vh; overflow-y: auto;">
                            <div style="margin-bottom: 1em;">
                                <input type="text" id="collectionPickerSearch" class="fld emby-input" placeholder="搜索合集..." style="width: 100%;">
                            </div>
                            <div id="collectionPickerList" style="display: flex; flex-direction: column; gap: 0.5em;">
                                ${collections.map(collection => {
                                    const isSelected = selectedIds.includes(collection.Id);
                                    return `
                                        <label class="checkboxContainer" style="padding: 0.75em; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">
                                            <input type="checkbox" value="${collection.Id}" data-name="${collection.Name}" ${isSelected ? 'checked' : ''}>
                                            <span>${collection.Name} (${collection.ChildCount || 0} 个条目)</span>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `,
                    footer: `
                        <button class="emby-button raised button-submit" id="collectionPickerConfirm" style="padding: 0.75em 2em;">
                            <span>确认</span>
                        </button>
                        <button class="emby-button raised" id="collectionPickerCancel" style="padding: 0.75em 2em;">
                            <span>取消</span>
                        </button>
                    `,
                    closeOnBackdrop: true,
                    closeOnEscape: true,
                    onOpen: (pickerModalInstance) => {
                        pickerModalInstanceRef = pickerModalInstance;
                        
                        // Set up search filter
                        const searchInput = pickerModalInstance.dialogContent.querySelector('#collectionPickerSearch');
                        if (searchInput) {
                            searchInput.addEventListener('input', (e) => {
                                const list = pickerModalInstance.dialogContent.querySelector('#collectionPickerList');
                                const items = list.querySelectorAll('label');
                                const term = e.target.value.toLowerCase();
                                
                                items.forEach(item => {
                                    const name = item.querySelector('span').textContent.toLowerCase();
                                    item.style.display = name.includes(term) ? '' : 'none';
                                });
                            });
                        }
                        
                        const confirmBtn = pickerModalInstance.dialogFooter?.querySelector('#collectionPickerConfirm');
                        const cancelBtn = pickerModalInstance.dialogFooter?.querySelector('#collectionPickerCancel');
                        
                        if (confirmBtn) {
                            confirmBtn.addEventListener('click', () => {
                                const checkboxes = pickerModalInstance.dialogContent.querySelectorAll('#collectionPickerList input[type="checkbox"]:checked');
                                const selectedIds = Array.from(checkboxes).map(cb => cb.value);
                                
                                // Update hidden input
                                if (hiddenInput) {
                                    hiddenInput.value = JSON.stringify(selectedIds);
                                    
                                    // Update button text and selected count
                                    const button = modalInstance.dialogContent.querySelector(`button[onclick="openCollectionPicker(${seasonIndex})"]`);
                                    const selectedDiv = modalInstance.dialogContent.querySelector(`.seasonal-season-collections-selected[data-index="${seasonIndex}"]`);
                                    
                                    if (button) {
                                        button.querySelector('span').textContent = `选择合集 (${selectedIds.length})`;
                                    }
                                    if (selectedDiv) {
                                        selectedDiv.textContent = selectedIds.length > 0 ? `已选: ${selectedIds.length} 个合集` : '未选择合集';
                                    }
                                }
                                
                                pickerModalInstance.close();
                            });
                        }
                        
                        if (cancelBtn) {
                            cancelBtn.addEventListener('click', () => {
                                pickerModalInstance.close();
                            });
                        }
                    }
                });
                
            } catch (error) {
                console.error('[KefinTweaks Configuration] Error opening collection picker:', error);
                alert('加载合集出错，请重试。');
            }
        };
        
        window.openPlaylistPicker = async function(seasonIndex) {
            if (!window.ModalSystem) {
                alert('模态框系统不可用');
                return;
            }
            
            try {
                // Fetch playlists from server
                const userId = window.ApiClient.getCurrentUserId();
                const serverAddress = window.ApiClient.serverAddress();
                const token = window.ApiClient.accessToken();
                
                const response = await fetch(`${serverAddress}/Users/${userId}/Items?IncludeItemTypes=Playlist&Recursive=true&Fields=ItemCounts`, {
                    headers: { 'Authorization': window.apiHelper.getAuthHeader() }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                const playlists = data.Items || [];
                
                // Get currently selected playlists
                const hiddenInput = modalInstance.dialogContent.querySelector(`.seasonal-season-playlists[data-index="${seasonIndex}"]`);
                const selectedIds = hiddenInput ? JSON.parse(hiddenInput.value || '[]') : [];
                
                // Create picker modal
                let pickerModalInstanceRef = null;
                const pickerModal = window.ModalSystem.create({
                    id: 'playlistPickerModal',
                    title: '选择播放列表',
                    content: `
                        <div style="max-height: 60vh; overflow-y: auto;">
                            <div style="margin-bottom: 1em;">
                                <input type="text" id="playlistPickerSearch" class="fld emby-input" placeholder="搜索播放列表..." style="width: 100%;">
                            </div>
                            <div id="playlistPickerList" style="display: flex; flex-direction: column; gap: 0.5em;">
                                ${playlists.map(playlist => {
                                    const isSelected = selectedIds.includes(playlist.Id);
                                    return `
                                        <label class="checkboxContainer" style="padding: 0.75em; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">
                                            <input type="checkbox" value="${playlist.Id}" data-name="${playlist.Name}" ${isSelected ? 'checked' : ''}>
                                            <span>${playlist.Name} (${playlist.ChildCount || 0} 个条目)</span>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `,
                    footer: `
                        <button class="emby-button raised button-submit" id="playlistPickerConfirm" style="padding: 0.75em 2em;">
                            <span>确认</span>
                        </button>
                        <button class="emby-button raised" id="playlistPickerCancel" style="padding: 0.75em 2em;">
                            <span>取消</span>
                        </button>
                    `,
                    closeOnBackdrop: true,
                    closeOnEscape: true,
                    onOpen: (pickerModalInstance) => {
                        pickerModalInstanceRef = pickerModalInstance;
                        
                        // Set up search filter
                        const searchInput = pickerModalInstance.dialogContent.querySelector('#playlistPickerSearch');
                        if (searchInput) {
                            searchInput.addEventListener('input', (e) => {
                                const list = pickerModalInstance.dialogContent.querySelector('#playlistPickerList');
                                const items = list.querySelectorAll('label');
                                const term = e.target.value.toLowerCase();
                                
                                items.forEach(item => {
                                    const name = item.querySelector('span').textContent.toLowerCase();
                                    item.style.display = name.includes(term) ? '' : 'none';
                                });
                            });
                        }
                        
                        const confirmBtn = pickerModalInstance.dialogFooter?.querySelector('#playlistPickerConfirm');
                        const cancelBtn = pickerModalInstance.dialogFooter?.querySelector('#playlistPickerCancel');
                        
                        if (confirmBtn) {
                            confirmBtn.addEventListener('click', () => {
                                const checkboxes = pickerModalInstance.dialogContent.querySelectorAll('#playlistPickerList input[type="checkbox"]:checked');
                                const selectedIds = Array.from(checkboxes).map(cb => cb.value);
                                
                                // Update hidden input
                                if (hiddenInput) {
                                    hiddenInput.value = JSON.stringify(selectedIds);
                                    
                                    // Update button text and selected count
                                    const button = modalInstance.dialogContent.querySelector(`button[onclick="openPlaylistPicker(${seasonIndex})"]`);
                                    const selectedDiv = modalInstance.dialogContent.querySelector(`.seasonal-season-playlists-selected[data-index="${seasonIndex}"]`);
                                    
                                    if (button) {
                                        button.querySelector('span').textContent = `选择播放列表 (${selectedIds.length})`;
                                    }
                                    if (selectedDiv) {
                                        selectedDiv.textContent = selectedIds.length > 0 ? `已选: ${selectedIds.length} 个播放列表` : '未选择播放列表';
                                    }
                                }
                                
                                pickerModalInstance.close();
                            });
                        }
                        
                        if (cancelBtn) {
                            cancelBtn.addEventListener('click', () => {
                                pickerModalInstance.close();
                            });
                        }
                    }
                });
                
            } catch (error) {
                console.error('[KefinTweaks Configuration] Error opening playlist picker:', error);
                alert('加载播放列表出错，请重试。');
            }
        };
        
        // Picker functions for sections (used in nested sections)
        async function openCollectionPickerForSection(prefix, sectionIndex, isSeasonalNested) {
            if (!window.ModalSystem) {
                alert('模态框系统不可用');
                return;
            }
            
            try {
                const userId = window.ApiClient.getCurrentUserId();
                const serverAddress = window.ApiClient.serverAddress();
                const token = window.ApiClient.accessToken();
                
                const response = await fetch(`${serverAddress}/Users/${userId}/Items?IncludeItemTypes=BoxSet,CollectionFolder&Recursive=true&Fields=ItemCounts`, {
                    headers: { 'Authorization': window.apiHelper.getAuthHeader() }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                const collections = data.Items || [];
                
                const sectionItem = modalInstance.dialogContent.querySelector(`.${prefix}_section_item[data-section-index="${sectionIndex}"]`);
                const sourceInput = sectionItem?.querySelector(`.${prefix}_section_source[data-section-index="${sectionIndex}"]`);
                const currentSource = sourceInput ? sourceInput.value : '';
                const selectedId = currentSource || null;
                
                const pickerModal = window.ModalSystem.create({
                    id: 'collectionPickerForSectionModal',
                    title: '选择合集',
                    content: `
                        <div style="max-height: 60vh; overflow-y: auto;">
                            <div style="margin-bottom: 1em;">
                                <input type="text" id="collectionPickerForSectionSearch" class="fld emby-input" placeholder="搜索合集..." style="width: 100%;">
                            </div>
                            <div id="collectionPickerForSectionList" style="display: flex; flex-direction: column; gap: 0.5em;">
                                ${collections.map(collection => {
                                    const isSelected = collection.Id === selectedId;
                                    return `
                                        <label class="checkboxContainer" style="padding: 0.75em; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">
                                            <input type="radio" name="collectionPickerForSection" value="${collection.Id}" ${isSelected ? 'checked' : ''}>
                                            <span>${collection.Name} (${collection.ChildCount || 0} 个条目)</span>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `,
                    footer: `
                        <button class="emby-button raised" id="collectionPickerForSectionClear" style="padding: 0.75em 2em; margin-right: 0.5em;">
                            <span>清除</span>
                        </button>
                        <button class="emby-button raised button-submit" id="collectionPickerForSectionConfirm" style="padding: 0.75em 2em;">
                            <span>确认</span>
                        </button>
                        <button class="emby-button raised" id="collectionPickerForSectionCancel" style="padding: 0.75em 2em;">
                            <span>取消</span>
                        </button>
                    `,
                    closeOnBackdrop: true,
                    closeOnEscape: true,
                    onOpen: (pickerModalInstance) => {
                        const searchInput = pickerModalInstance.dialogContent.querySelector('#collectionPickerForSectionSearch');
                        if (searchInput) {
                            searchInput.addEventListener('input', (e) => {
                                const list = pickerModalInstance.dialogContent.querySelector('#collectionPickerForSectionList');
                                const items = list.querySelectorAll('label');
                                const term = e.target.value.toLowerCase();
                                items.forEach(item => {
                                    const name = item.querySelector('span').textContent.toLowerCase();
                                    item.style.display = name.includes(term) ? '' : 'none';
                                });
                            });
                        }
                        
                        const confirmBtn = pickerModalInstance.dialogFooter?.querySelector('#collectionPickerForSectionConfirm');
                        const clearBtn = pickerModalInstance.dialogFooter?.querySelector('#collectionPickerForSectionClear');
                        const cancelBtn = pickerModalInstance.dialogFooter?.querySelector('#collectionPickerForSectionCancel');
                        
                        if (confirmBtn) {
                            confirmBtn.addEventListener('click', () => {
                                const selected = pickerModalInstance.dialogContent.querySelector('#collectionPickerForSectionList input[type="radio"]:checked');
                                const selectedId = selected ? selected.value : '';
                                
                                if (sourceInput) {
                                    sourceInput.value = selectedId;
                                    
                                    const button = sectionItem?.querySelector(`button[onclick*="openCollectionPickerForSection"]`);
                                    const selectedDiv = sectionItem?.querySelector(`.${prefix}_section_collection_selected[data-section-index="${sectionIndex}"]`);
                                    
                                    if (button) {
                                        button.querySelector('span').textContent = `选择合集 ${selectedId ? '(1)' : ''}`;
                                    }
                                    if (selectedDiv) {
                                        selectedDiv.textContent = selectedId ? `已选: 1 个合集` : '未选择合集';
                                    }
                                }
                                
                                pickerModalInstance.close();
                            });
                        }
                        
                        if (clearBtn) {
                            clearBtn.addEventListener('click', () => {
                                const radios = pickerModalInstance.dialogContent.querySelectorAll('#collectionPickerForSectionList input[type="radio"]');
                                radios.forEach(radio => radio.checked = false);
                                
                                if (sourceInput) {
                                    sourceInput.value = '';
                                    
                                    const button = sectionItem?.querySelector(`button[onclick*="openCollectionPickerForSection"]`);
                                    const selectedDiv = sectionItem?.querySelector(`.${prefix}_section_collection_selected[data-section-index="${sectionIndex}"]`);
                                    
                                    if (button) {
                                        button.querySelector('span').textContent = '选择合集';
                                    }
                                    if (selectedDiv) {
                                        selectedDiv.textContent = '未选择合集';
                                    }
                                }
                                
                                pickerModalInstance.close();
                            });
                        }
                        
                        if (cancelBtn) {
                            cancelBtn.addEventListener('click', () => {
                                pickerModalInstance.close();
                            });
                        }
                    }
                });
            } catch (error) {
                console.error('[KefinTweaks Configuration] Error opening collection picker for section:', error);
                alert('加载合集出错，请重试。');
            }
        };
        
        async function openPlaylistPickerForSection(prefix, sectionIndex, isSeasonalNested) {
            if (!window.ModalSystem) {
                alert('模态框系统不可用');
                return;
            }
            
            try {
                const userId = window.ApiClient.getCurrentUserId();
                const serverAddress = window.ApiClient.serverAddress();
                const token = window.ApiClient.accessToken();
                
                const response = await fetch(`${serverAddress}/Users/${userId}/Items?IncludeItemTypes=Playlist&Recursive=true&Fields=ItemCounts`, {
                    headers: { 'Authorization': window.apiHelper.getAuthHeader() }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                const playlists = data.Items || [];
                
                const sectionItem = modalInstance.dialogContent.querySelector(`.${prefix}_section_item[data-section-index="${sectionIndex}"]`);
                const sourceInput = sectionItem?.querySelector(`.${prefix}_section_source[data-section-index="${sectionIndex}"]`);
                const currentSource = sourceInput ? sourceInput.value : '';
                const selectedId = currentSource || null;
                
                const pickerModal = window.ModalSystem.create({
                    id: 'playlistPickerForSectionModal',
                    title: '选择播放列表',
                    content: `
                        <div style="max-height: 60vh; overflow-y: auto;">
                            <div style="margin-bottom: 1em;">
                                <input type="text" id="playlistPickerForSectionSearch" class="fld emby-input" placeholder="搜索播放列表..." style="width: 100%;">
                            </div>
                            <div id="playlistPickerForSectionList" style="display: flex; flex-direction: column; gap: 0.5em;">
                                ${playlists.map(playlist => {
                                    const isSelected = playlist.Id === selectedId;
                                    return `
                                        <label class="checkboxContainer" style="padding: 0.75em; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">
                                            <input type="radio" name="playlistPickerForSection" value="${playlist.Id}" ${isSelected ? 'checked' : ''}>
                                            <span>${playlist.Name} (${playlist.ChildCount || 0} 个条目)</span>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `,
                    footer: `
                        <button class="emby-button raised" id="playlistPickerForSectionClear" style="padding: 0.75em 2em; margin-right: 0.5em;">
                            <span>清除</span>
                        </button>
                        <button class="emby-button raised button-submit" id="playlistPickerForSectionConfirm" style="padding: 0.75em 2em;">
                            <span>确认</span>
                        </button>
                        <button class="emby-button raised" id="playlistPickerForSectionCancel" style="padding: 0.75em 2em;">
                            <span>取消</span>
                        </button>
                    `,
                    closeOnBackdrop: true,
                    closeOnEscape: true,
                    onOpen: (pickerModalInstance) => {
                        const searchInput = pickerModalInstance.dialogContent.querySelector('#playlistPickerForSectionSearch');
                        if (searchInput) {
                            searchInput.addEventListener('input', (e) => {
                                const list = pickerModalInstance.dialogContent.querySelector('#playlistPickerForSectionList');
                                const items = list.querySelectorAll('label');
                                const term = e.target.value.toLowerCase();
                                items.forEach(item => {
                                    const name = item.querySelector('span').textContent.toLowerCase();
                                    item.style.display = name.includes(term) ? '' : 'none';
                                });
                            });
                        }
                        
                        const confirmBtn = pickerModalInstance.dialogFooter?.querySelector('#playlistPickerForSectionConfirm');
                        const clearBtn = pickerModalInstance.dialogFooter?.querySelector('#playlistPickerForSectionClear');
                        const cancelBtn = pickerModalInstance.dialogFooter?.querySelector('#playlistPickerForSectionCancel');
                        
                        if (confirmBtn) {
                            confirmBtn.addEventListener('click', () => {
                                const selected = pickerModalInstance.dialogContent.querySelector('#playlistPickerForSectionList input[type="radio"]:checked');
                                const selectedId = selected ? selected.value : '';
                                
                                if (sourceInput) {
                                    sourceInput.value = selectedId;
                                    
                                    const button = sectionItem?.querySelector(`button[onclick*="openPlaylistPickerForSection"]`);
                                    const selectedDiv = sectionItem?.querySelector(`.${prefix}_section_playlist_selected[data-section-index="${sectionIndex}"]`);
                                    
                                    if (button) {
                                        button.querySelector('span').textContent = `选择播放列表 ${selectedId ? '(1)' : ''}`;
                                    }
                                    if (selectedDiv) {
                                        selectedDiv.textContent = selectedId ? `已选: 1 个播放列表` : '未选择播放列表';
                                    }
                                }
                                
                                pickerModalInstance.close();
                            });
                        }
                        
                        if (clearBtn) {
                            clearBtn.addEventListener('click', () => {
                                const radios = pickerModalInstance.dialogContent.querySelectorAll('#playlistPickerForSectionList input[type="radio"]');
                                radios.forEach(radio => radio.checked = false);
                                
                                if (sourceInput) {
                                    sourceInput.value = '';
                                    
                                    const button = sectionItem?.querySelector(`button[onclick*="openPlaylistPickerForSection"]`);
                                    const selectedDiv = sectionItem?.querySelector(`.${prefix}_section_playlist_selected[data-section-index="${sectionIndex}"]`);
                                    
                                    if (button) {
                                        button.querySelector('span').textContent = '选择播放列表';
                                    }
                                    if (selectedDiv) {
                                        selectedDiv.textContent = '未选择播放列表';
                                    }
                                }
                                
                                pickerModalInstance.close();
                            });
                        }
                        
                        if (cancelBtn) {
                            cancelBtn.addEventListener('click', () => {
                                pickerModalInstance.close();
                            });
                        }
                    }
                });
            } catch (error) {
                console.error('[KefinTweaks Configuration] Error opening playlist picker for section:', error);
                alert('加载播放列表出错，请重试。');
            }
        };
        
        window.editSeasonalSeason = function(index) {
            // For now, editing is done inline - this could open a modal in the future
            console.log('Edit seasonal season', index);
        };
        
        window.deleteSeasonalSeason = function(index) {
            const seasonsList = modalInstance.dialogContent.querySelector('#homeScreen_seasonal_seasons_list');
            if (!seasonsList) return;
            
            const seasonItem = seasonsList.querySelector(`.seasonal-season-item[data-season-index="${index}"]`);
            if (seasonItem && confirm('确定要删除此季吗？')) {
                seasonItem.remove();
                // Re-index remaining items
                const remainingItems = seasonsList.querySelectorAll('.seasonal-season-item');
                remainingItems.forEach((item, newIndex) => {
                    item.setAttribute('data-season-index', newIndex);
                    item.querySelectorAll('[data-index]').forEach(el => {
                        el.setAttribute('data-index', newIndex);
                    });
                    const editBtn = item.querySelector('button[onclick*="editSeasonalSeason"]');
                    const deleteBtn = item.querySelector('button[onclick*="deleteSeasonalSeason"]');
                    if (editBtn) editBtn.setAttribute('onclick', `editSeasonalSeason(${newIndex})`);
                    if (deleteBtn) deleteBtn.setAttribute('onclick', `deleteSeasonalSeason(${newIndex})`);
                });
            }
        };

        // Toggle visibility of configuration sections based on script enable state
        const scriptCheckboxes = {
            search: modalInstance.dialogContent.querySelector('#script_search'),
            exclusiveElsewhere: modalInstance.dialogContent.querySelector('#script_exclusiveElsewhere'),
            skinManager: modalInstance.dialogContent.querySelector('#script_skinManager'),
            customMenuLinks: modalInstance.dialogContent.querySelector('#script_customMenuLinks'),
            flattenSingleSeasonShows: modalInstance.dialogContent.querySelector('#script_flattenSingleSeasonShows')
        };

        const configSections = {
            search: modalInstance.dialogContent.querySelector('#configSection_search'),
            exclusiveElsewhere: modalInstance.dialogContent.querySelector('#configSection_exclusiveElsewhere'),
            skin: modalInstance.dialogContent.querySelector('#configSection_skin'),
            theme: modalInstance.dialogContent.querySelector('#configSection_theme'),
            customMenuLinks: modalInstance.dialogContent.querySelector('#configSection_customMenuLinks'),
            flattenSingleSeasonShows: modalInstance.dialogContent.querySelector('#configSection_flattenSingleSeasonShows')
        };

        // Function to toggle section visibility
        const toggleSectionVisibility = (scriptKey, sectionKey) => {
            const checkbox = scriptCheckboxes[scriptKey];
            const section = configSections[sectionKey];
            
            if (checkbox && section) {
                const isEnabled = checkbox.checked;
                section.style.display = isEnabled ? '' : 'none';
            }
        };

        // Set up event listeners for each script checkbox
        if (scriptCheckboxes.search) {
            scriptCheckboxes.search.addEventListener('change', () => toggleSectionVisibility('search', 'search'));
        }
        
        if (scriptCheckboxes.exclusiveElsewhere) {
            scriptCheckboxes.exclusiveElsewhere.addEventListener('change', () => toggleSectionVisibility('exclusiveElsewhere', 'exclusiveElsewhere'));
                }
        
        if (scriptCheckboxes.skinManager) {
            scriptCheckboxes.skinManager.addEventListener('change', () => {
                toggleSectionVisibility('skinManager', 'skin');
                toggleSectionVisibility('skinManager', 'theme');
        });
        }
        
        // Initialize pending state for optional includes to track changes across category switches
        // Deep copy initial config to avoid mutating reference before save
        const pendingOptionalIncludes = JSON.parse(JSON.stringify(config.optionalIncludes || []));
        let currentOptionalIncludesCategory = 'global';

        // Optional includes category dropdown handler
        const optionalIncludesCategory = modalInstance.dialogContent.querySelector('#optionalIncludesCategory');
        if (optionalIncludesCategory) {
            optionalIncludesCategory.addEventListener('change', (e) => {
                const newCategory = e.target.value;
                
                // 1. Capture changes from the PREVIOUS category before switching
                const currentCheckboxes = modalInstance.dialogContent.querySelectorAll(`.optionalIncludeCheckbox[data-category="${currentOptionalIncludesCategory}"]`);
                currentCheckboxes.forEach(checkbox => {
                    const key = checkbox.getAttribute('data-key');
                    const enabled = checkbox.checked;
                    
                    const existingIndex = pendingOptionalIncludes.findIndex(item => item.key === key);
                    if (existingIndex >= 0) {
                        pendingOptionalIncludes[existingIndex].enabled = enabled;
                    } else {
                        pendingOptionalIncludes.push({ key, enabled });
                    }
                });

                // Update current category tracker
                currentOptionalIncludesCategory = newCategory;

                const editor = modalInstance.dialogContent.querySelector('#optionalIncludesEditor');
                if (editor) {
                    // Create a temporary config object that uses our pending state
                    // This ensures buildOptionalIncludesEditor renders checkboxes with the correct pending state
                    const currentConfig = { 
                        ...(window.KefinTweaksConfig || config), 
                        optionalIncludes: pendingOptionalIncludes 
                    };
                    
                    editor.innerHTML = buildOptionalIncludesEditor(newCategory, currentConfig, window.KefinTweaksSkinConfig || []);
                    // Re-attach checkbox handlers
                    attachOptionalIncludesCheckboxHandlers(modalInstance, newCategory, currentConfig);
                }
            });
        }
        
        // Attach initial checkbox handlers
        attachOptionalIncludesCheckboxHandlers(modalInstance, 'global', config);
        
        if (scriptCheckboxes.customMenuLinks) {
            scriptCheckboxes.customMenuLinks.addEventListener('change', () => toggleSectionVisibility('customMenuLinks', 'customMenuLinks'));
        }

        if (scriptCheckboxes.flattenSingleSeasonShows) {
            scriptCheckboxes.flattenSingleSeasonShows.addEventListener('change', () => toggleSectionVisibility('flattenSingleSeasonShows', 'flattenSingleSeasonShows'));
        }

        // Save button handler
        const saveBtn = modalInstance.dialogFooter?.querySelector('#saveConfigBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Capture changes from the CURRENT category one last time
                const currentCheckboxes = modalInstance.dialogContent.querySelectorAll(`.optionalIncludeCheckbox[data-category="${currentOptionalIncludesCategory}"]`);
                currentCheckboxes.forEach(checkbox => {
                    const key = checkbox.getAttribute('data-key');
                    const enabled = checkbox.checked;
                    
                    const existingIndex = pendingOptionalIncludes.findIndex(item => item.key === key);
                    if (existingIndex >= 0) {
                        pendingOptionalIncludes[existingIndex].enabled = enabled;
                    } else {
                        pendingOptionalIncludes.push({ key, enabled });
                    }
                });

                handleSaveConfig(modalInstance, pendingOptionalIncludes);
            });
        }

        const resetBtn = modalInstance.dialogFooter?.querySelector('#resetConfigBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => handleResetConfig(modalInstance));
        }

        // Export button handler
        const exportBtn = modalInstance.dialog?.querySelector('#exportConfigBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => handleExportConfig(config));
        }

        // Import button handler
        const importBtn = modalInstance.dialog?.querySelector('#importConfigBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => handleImportConfig(modalInstance));
        }

        // Remove duplicate defaults button handler
        const removeDuplicateDefaultsBtn = modalInstance.dialogContent.querySelector('#removeDuplicateDefaultsBtn');
        if (removeDuplicateDefaultsBtn) {
            removeDuplicateDefaultsBtn.addEventListener('click', () => handleRemoveDuplicateDefaults(modalInstance));
        }
    }
    
    // Handle removing custom skins that override defaults
    function handleRemoveDuplicateDefaults(modalInstance) {
        const skinsTextarea = modalInstance.dialogContent.querySelector('#skinsJson');
        if (!skinsTextarea) return;
        
        try {
            const currentSkins = JSON.parse(skinsTextarea.value || '[]');
            const defaultSkinNames = new Set((window.KefinTweaksDefaultSkinsConfig?.skins || []).map(s => s.name));
            
            // Filter out skins that match default names
            const filteredSkins = currentSkins.filter(skin => !defaultSkinNames.has(skin.name));
            const removedCount = currentSkins.length - filteredSkins.length;
            
            if (removedCount === 0) {
                if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                    window.KefinTweaksToaster.toast('配置中未发现重复的默认皮肤');
                } else {
                    alert('配置中未发现重复的默认皮肤');
                }
                return;
            }
            
            // Update textarea
            skinsTextarea.value = JSON.stringify(filteredSkins, null, 2);
            
            // Show confirmation
            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                window.KefinTweaksToaster.toast(`已移除 ${removedCount} 个覆盖默认设置的自定义皮肤`);
            } else {
                alert(`已移除 ${removedCount} 个覆盖默认设置的自定义皮肤`);
            }
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error removing duplicate defaults:', error);
            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                window.KefinTweaksToaster.toast('处理皮肤 JSON 出错', '5');
            } else {
                alert('处理皮肤 JSON 出错。请检查格式。');
            }
        }
    }

    // Export configuration via modal (with optional clipboard copy on HTTPS)
    async function handleExportConfig(config) {
        try {
            const configJson = JSON.stringify(config, null, 2);

            // Prefer modal-based export so it works even on unsecured servers
            if (window.ModalSystem) {
                const isHttps =
                    (typeof ApiClient !== 'undefined' &&
                        ApiClient._serverAddress &&
                        ApiClient._serverAddress.startsWith('https://')) ||
                    (typeof location !== 'undefined' && location.protocol === 'https:');

                const supportsClipboard = !!(navigator.clipboard && navigator.clipboard.writeText);
                const canUseClipboard = isHttps && supportsClipboard;

                window.ModalSystem.create({
                    id: 'exportConfigModal',
                    title: '导出配置',
                    content: `
                        <div class="listItemBodyText" style="margin-bottom: 1em;">
                            您当前的配置以 JSON 形式显示在下方。选中并复制此文本，即可备份或分享您的配置。
                            ${canUseClipboard ? '' : ' 剪贴板访问需要 HTTPS 连接，因此需要手动复制。'}
                        </div>
                        <textarea id="exportConfigTextarea" class="fld emby-textarea" rows="20"
                            readonly
                            style="width: 100%; font-family: monospace; font-size: 0.9em; line-height: 1.5;"></textarea>
                    `,
                    footer: `
                        ${
                            canUseClipboard
                                ? `
                        <button class="emby-button raised button-submit" id="copyExportConfigBtn"
                            style="padding: 0.75em 2em; font-size: 1em; font-weight: 500; margin-right: 1em;">
                            <span>复制到剪贴板</span>
                        </button>
                        `
                                : ''
                        }
                        <button class="emby-button raised" id="closeExportConfigBtn"
                            style="padding: 0.75em 2em; font-size: 1em;">
                            <span>关闭</span>
                        </button>
                    `,
                    closeOnBackdrop: true,
                    closeOnEscape: true,
                    onOpen: (modalInstance) => {
                        const textarea = modalInstance.dialogContent.querySelector('#exportConfigTextarea');
                        if (textarea) {
                            textarea.value = configJson;
                            // Select text to make manual copying easier
                            setTimeout(() => {
                                textarea.focus();
                                textarea.select();
                            }, 100);
                        }

                        const closeBtn = modalInstance.dialogFooter?.querySelector('#closeExportConfigBtn');
                        if (closeBtn) {
                            closeBtn.addEventListener('click', () => modalInstance.close());
                        }

                        if (canUseClipboard) {
                            const copyBtn = modalInstance.dialogFooter?.querySelector('#copyExportConfigBtn');
                            if (copyBtn) {
                                copyBtn.addEventListener('click', async () => {
                                    try {
                                        await navigator.clipboard.writeText(configJson);
                                        if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                            window.KefinTweaksToaster.toast('配置已复制到剪贴板！');
                                        } else {
                                            alert('配置已复制到剪贴板！');
                                        }
                                    } catch (copyError) {
                                        console.error(
                                            '[KefinTweaks Configuration] Error copying config to clipboard:',
                                            copyError
                                        );
                                        if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                            window.KefinTweaksToaster.toast(
                                                '复制配置到剪贴板时出错',
                                                '5'
                                            );
                                        } else {
                                            alert('复制配置到剪贴板时出错');
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                // Fallback: no modal system, but clipboard is available
                await navigator.clipboard.writeText(configJson);

                if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                    window.KefinTweaksToaster.toast('配置已导出到剪贴板！');
                } else {
                    alert('配置已导出到剪贴板！');
                }
            } else {
                // Last-resort fallback: log to console
                console.log('[KefinTweaks Configuration] Exported configuration:', configJson);
                if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                    window.KefinTweaksToaster.toast(
                        '无法打开导出弹窗或访问剪贴板；配置已输出到控制台',
                        '3'
                    );
                } else {
                    alert(
                        '无法打开导出弹窗或访问剪贴板。请在浏览器控制台中查看导出的配置。'
                    );
                }
            }
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error exporting config:', error);
            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                window.KefinTweaksToaster.toast('导出配置出错', '5');
            } else {
                alert('导出配置出错');
            }
        }
    }

    // Import configuration from clipboard
    async function handleImportConfig(modalInstance) {
        if (!window.ModalSystem) {
            alert('模态框系统不可用');
            return;
        }

        // Show import modal with textarea
        const importModal = window.ModalSystem.create({
            id: 'importConfigModal',
            title: '导入配置',
            content: `
                <div class="listItemBodyText" style="margin-bottom: 1em;">
                    请在下方粘贴您的配置 JSON。此操作将完全替换您当前的配置。
                </div>
                <textarea id="importConfigTextarea" class="fld emby-textarea" rows="20" placeholder='在此粘贴您的配置 JSON...' style="width: 100%; font-family: monospace; font-size: 0.9em; line-height: 1.5;"></textarea>
            `,
            footer: `
                <button class="emby-button raised button-submit" id="confirmImportBtn" style="padding: 0.75em 2em; font-size: 1em; font-weight: 500; margin-right: 1em;">
                    <span>导入</span>
                </button>
                <button class="emby-button raised" id="cancelImportBtn" style="padding: 0.75em 2em; font-size: 1em;">
                    <span>取消</span>
                </button>
            `,
            closeOnBackdrop: true,
            closeOnEscape: true,
            onOpen: (importModalInstance) => {
                const confirmBtn = importModalInstance.dialogFooter?.querySelector('#confirmImportBtn');
                const cancelBtn = importModalInstance.dialogFooter?.querySelector('#cancelImportBtn');
                const textarea = importModalInstance.dialogContent.querySelector('#importConfigTextarea');
                
                // Focus textarea
                if (textarea) {
                    setTimeout(() => textarea.focus(), 100);
                }
                
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', async () => {
                        const jsonText = textarea?.value.trim() || '';
                        
                        if (!jsonText) {
                            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                window.KefinTweaksToaster.toast('请粘贴配置 JSON', '3');
                            } else {
                                alert('请粘贴配置 JSON');
                            }
                            return;
                        }

                        // Validate JSON
                        let importedConfig;
                        try {
                            importedConfig = JSON.parse(jsonText);
                        } catch (parseError) {
                            console.error('[KefinTweaks Configuration] Invalid JSON:', parseError);
                            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                window.KefinTweaksToaster.toast(`无效的 JSON：${parseError.message}`, '5');
                            } else {
                                alert(`无效的 JSON：${parseError.message}`);
                            }
                            return;
                        }

                        // Validate config structure (basic check)
                        if (typeof importedConfig !== 'object' || importedConfig === null) {
                            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                window.KefinTweaksToaster.toast('配置格式无效', '5');
                            } else {
                                alert('配置格式无效');
                            }
                            return;
                        }

                        // Show confirmation dialog
                        const confirmed = await showImportConfirmation();
                        if (!confirmed) {
                            return;
                        }

                        // Close import modal
                        importModalInstance.close();

                        // Apply imported config
                        try {
                            await applyImportedConfig(importedConfig, modalInstance);
                        } catch (error) {
                            console.error('[KefinTweaks Configuration] Error applying imported config:', error);
                            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                window.KefinTweaksToaster.toast(`应用配置时出错：${error.message}`, '5');
                            } else {
                                alert(`应用配置时出错：${error.message}`);
                            }
                        }
                    });
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        importModalInstance.close();
                    });
                }
            }
        });
    }

    // Show confirmation dialog for import
    function showImportConfirmation() {
        return new Promise((resolve) => {
            if (!window.ModalSystem) {
                resolve(false);
                return;
            }

            const modal = window.ModalSystem.create({
                id: 'importConfirmation',
                title: '确认导入',
                content: `
                    <div class="listItemBodyText" style="margin-bottom: 1em;">
                        此操作将完全覆盖您当前的配置。所有现有设置都将被导入的配置替换。此操作无法撤销。
                    </div>
                `,
                footer: `
                    <button class="emby-button raised button-submit" id="confirmImportConfirmBtn" style="padding: 0.75em 2em; font-size: 1em; font-weight: 500; margin-right: 1em;">
                        <span>继续</span>
                    </button>
                    <button class="emby-button raised" id="cancelImportConfirmBtn" style="padding: 0.75em 2em; font-size: 1em;">
                        <span>取消</span>
                    </button>
                `,
                closeOnBackdrop: true,
                closeOnEscape: true,
                onOpen: (modalInstance) => {
                    const confirmBtn = modalInstance.dialogFooter?.querySelector('#confirmImportConfirmBtn');
                    const cancelBtn = modalInstance.dialogFooter?.querySelector('#cancelImportConfirmBtn');
                    
                    if (confirmBtn) {
                        confirmBtn.addEventListener('click', () => {
                            modalInstance.close();
                            resolve(true);
                        });
                    }
                    
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', () => {
                            modalInstance.close();
                            resolve(false);
                        });
                    }
                }
            });
        });
    }

    // Apply imported configuration
    async function applyImportedConfig(importedConfig, modalInstance) {
        // Save to JavaScript Injector
        await KefinTweaksUtils.saveConfigToJavaScriptInjector(importedConfig);
        
        // Reload the modal with new config
        modalInstance.close();
        
        // Show success message
        if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
            window.KefinTweaksToaster.toast('配置导入成功！正在重新加载...');
        }
        
        // Reopen modal with new config after a short delay
        setTimeout(() => {
            openConfigurationModal();
        }, 500);
    }

    const JS_INJECTOR_ALIASES = ['JavaScript Injector', 'JS Injector'];

    // Find JavaScript Injector plugin (delegates to shared utils cache)
    async function findJavaScriptInjectorPlugin() {
        try {
            if (!window.KefinTweaksUtils?.resolvePluginId) {
                throw new Error('KefinTweaksUtils.resolvePluginId is not available');
            }

            const pluginId = await window.KefinTweaksUtils.resolvePluginId(JS_INJECTOR_ALIASES);
            if (!pluginId) {
                throw new Error('未找到 JavaScript Injector 插件。请确保已安装。');
            }

            console.log('[KefinTweaks Configuration] Found JavaScript Injector plugin:', pluginId);
            return pluginId;
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error finding JavaScript Injector plugin:', error);
            throw error;
        }
    }

    // Get current JavaScript Injector configuration (delegates to shared utils)
    async function getJavaScriptInjectorConfig(pluginId) {
        try {
            if (!window.KefinTweaksUtils?.getPluginConfiguration) {
                throw new Error('KefinTweaksUtils.getPluginConfiguration is not available');
            }

            const config = await window.KefinTweaksUtils.getPluginConfiguration(pluginId || JS_INJECTOR_ALIASES);
            console.log('[KefinTweaks Configuration] Current JS Injector config:', config);
            return config;
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error getting JS Injector config:', error);
            throw error;
        }
    }

    // Save configuration to JavaScript Injector plugin (delegates to shared utils)
    async function saveConfigToJavaScriptInjector(config) {
        try {
            if (!window.KefinTweaksUtils?.saveConfigToJavaScriptInjector) {
                throw new Error('KefinTweaksUtils.saveConfigToJavaScriptInjector is not available');
            }

            const success = await window.KefinTweaksUtils.saveConfigToJavaScriptInjector(config);
            if (!success) {
                throw new Error('保存配置到 JavaScript Injector 失败');
            }

            console.log('[KefinTweaks Configuration] Configuration saved successfully');
            return true;
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error saving configuration:', error);
            throw error;
        }
    }

    // Expose injector helpers for feature-config fallbacks
    window.KefinTweaksConfiguration = Object.assign(window.KefinTweaksConfiguration || {}, {
        findJavaScriptInjectorPlugin,
        getJavaScriptInjectorConfig,
        saveConfigToJavaScriptInjector,
        openConfigurationModal
    });

    function getSectionConfigFromUI(rootElement, prefix, sectionIndex) {
        const scope = rootElement || document;
        const sectionItem = scope.querySelector(`.${prefix}_section_item[data-section-index="${sectionIndex}"]`);
        if (!sectionItem) return null;
        
        const sanitizedIndex = sectionIndex.toString().replace(/[^a-zA-Z0-9]/g, '_');
        const sectionIdAttr = sectionItem.getAttribute('data-section-id') || `${prefix}-section-${sanitizedIndex}`;
        
        const enabledCheckbox = sectionItem.querySelector(`#${prefix}_section_enabled_${sanitizedIndex}`) || sectionItem.querySelector(`.${prefix}_section_enabled[data-section-index="${sectionIndex}"]`);
        const enabled = enabledCheckbox?.checked !== false;
        const name = sectionItem.querySelector(`.${prefix}_section_name[data-section-index="${sectionIndex}"]`)?.value || '';
        const type = sectionItem.querySelector(`.${prefix}_section_type[data-section-index="${sectionIndex}"]`)?.value || 'Genre';
        
        let source = '';
        const sourceContainer = sectionItem.querySelector(`.${prefix}_section_source_container[data-section-index="${sectionIndex}"]`);
        const badgeContainer = sourceContainer?.querySelector(`.tag-badge-container[data-section-index="${sectionIndex}"][data-type]`) || null;
        if (badgeContainer) {
            const badges = badgeContainer.querySelectorAll('.tag-badge');
            source = Array.from(badges).map(badge => badge.getAttribute('data-value')).filter(Boolean).join(', ');
        } else {
            const sourceInput = sectionItem.querySelector(`.${prefix}_section_source[data-section-index="${sectionIndex}"]`);
            source = sourceInput ? sourceInput.value : '';
        }
        
        const itemLimit = parseInt(sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_itemLimit`)?.value || '16', 10);
        const sortOrder = sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_sortOrder`)?.value || 'Random';
        const sortOrderDirection = sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_sortOrderDirection`)?.value || 'Ascending';
        const cardFormat = sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_cardFormat`)?.value || 'Poster';
        const order = parseInt(sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_order`)?.value || '100', 10);
        
        const renderModeSelect = sectionItem.querySelector(`.${prefix}_section_renderMode[data-section-index="${sectionIndex}"]`);
        const renderMode = renderModeSelect ? renderModeSelect.value : 'Normal';
        const spotlight = renderMode === 'Spotlight'; // Legacy compatibility
        
        const discoveryCheckbox = sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_discovery`) || sectionItem.querySelector(`.${prefix}_section_discovery[data-section-index="${sectionIndex}"]`);
        const discoveryEnabled = discoveryCheckbox?.checked === true;
        const searchTerm = sectionItem.querySelector(`#${prefix}_section_${sanitizedIndex}_searchTerm`)?.value?.trim() || '';
        
        let includeItemTypes = [];
        const includeItemTypesContainer = sectionItem.querySelector(`.includeItemTypes-badge-container[data-section-index="${sectionIndex}"]`);
        if (includeItemTypesContainer) {
            const badges = includeItemTypesContainer.querySelectorAll('.tag-badge');
            includeItemTypes = Array.from(badges).map(badge => badge.getAttribute('data-value')).filter(Boolean);
        }
        if (includeItemTypes.length === 0 && type !== 'Parent') {
            includeItemTypes = ['Movie'];
        }

        const additionalQueryOptions = [];
        const additionalOptionsContainer = sectionItem.querySelector(`.${prefix}_section_additionalOptions_list_container[data-section-index="${sectionIndex}"]`);
        if (additionalOptionsContainer) {
            const optionRows = additionalOptionsContainer.querySelectorAll('.additional-options-list .additional-option-row');
            optionRows.forEach(row => {
                const input = row.querySelector('.additional-option-value');
                if (input) {
                    const key = input.getAttribute('data-key');
                    const type = input.getAttribute('data-type');
                    let value;
                    if (type === 'boolean') {
                        value = input.checked;
                    } else {
                        value = input.value;
                    }
                    if (key) {
                        additionalQueryOptions.push({ key, value });
                    }
                }
            });
        }
        
        return {
            id: sectionIdAttr,
            enabled: enabled,
            name: name,
            type: type,
            source: source,
            itemLimit: itemLimit,
            sortOrder: sortOrder,
            sortOrderDirection: sortOrderDirection,
            cardFormat: cardFormat,
            order: order,
            renderMode: renderMode,
            spotlight: spotlight,
            discoveryEnabled: discoveryEnabled,
            searchTerm: searchTerm,
            includeItemTypes: includeItemTypes,
            additionalQueryOptions: additionalQueryOptions
        };
    }
    
    async function fetchItemsForSectionPreview(sectionConfig) {
        const apiClient = window.ApiClient;
        if (!apiClient) {
            throw new Error('ApiClient is not available');
        }
        
        const userId = apiClient.getCurrentUserId();
        const type = sectionConfig.type || 'Genre';
        const searchTerm = sectionConfig.searchTerm?.trim() || '';
        const includeItemTypes = Array.isArray(sectionConfig.includeItemTypes) && sectionConfig.includeItemTypes.length > 0
            ? sectionConfig.includeItemTypes.join(',')
            : (sectionConfig.includeItemTypes || 'Movie');
        const sortOrder = sectionConfig.sortOrder || 'Random';
        const sortOrderDirection = sectionConfig.sortOrderDirection || 'Ascending';
        const itemLimit = parseInt(sectionConfig.itemLimit, 10) || 16;
        const sources = (sectionConfig.source || '').split(',').map(s => s.trim()).filter(Boolean);
        const fields = 'PrimaryImageAspectRatio,DateCreated,Overview,ProductionYear,ImageTags,BackdropImageTags,ParentBackdropImageTags,ParentThumbImageTag,SeriesPrimaryImageTag';
        
        // Parse additional query options
        const additionalOptions = {};
        if (Array.isArray(sectionConfig.additionalQueryOptions)) {
            sectionConfig.additionalQueryOptions.forEach(option => {
                if (option && option.key) {
                    let value = option.value;
                    if (value === 'true' || value === true) value = true;
                    else if (value === 'false' || value === false) value = false;
                    additionalOptions[option.key] = value;
                }
            });
        }

        const dedupeAndLimit = (items = []) => {
            let working = Array.isArray(items) ? [...items] : [];
            if (sortOrder === 'Random') {
                working.sort(() => Math.random() - 0.5);
            } else if (window.cardBuilder?.sortItems) {
                working = window.cardBuilder.sortItems(working, sortOrder, sortOrderDirection);
            }
            const seen = new Set();
            const limited = [];
            for (const item of working) {
                if (!item || !item.Id || seen.has(item.Id)) continue;
                seen.add(item.Id);
                limited.push(item);
                if (limited.length >= itemLimit) break;
            }
            return limited;
        };
        
        try {
            const queryBase = {
                IncludeItemTypes: includeItemTypes,
                Recursive: true,
                Fields: fields,
                SortBy: sortOrder,
                SortOrder: sortOrderDirection,
                ...additionalOptions
            };

            if (type === 'Genre' || type === 'Tag') {
                if (sources.length === 0) {
                    return [];
                }
                const paramName = type === 'Genre' ? 'Genres' : 'Tags';
                // Genres use pipe delimiter usually, tags comma?
                // homeScreen.js uses pipe for Genres, comma for Tags.
                // apiClient handles array/string? usually string.
                const delimiter = type === 'Genre' ? '|' : ',';
                const valueParam = sources.join(delimiter); 
                
                const params = {
                    ...queryBase,
                    [paramName]: valueParam,
                    Limit: itemLimit
                };
                if (searchTerm) params.SearchTerm = searchTerm;
                
                const response = await apiClient.getItems(userId, params);
                return dedupeAndLimit(response.Items || []);
            }
            
            if (type === 'Collection' || type === 'Playlist' || type === 'Parent') {
                const existingIds = new Set();
                let collected = [];
                
                const runQuery = async (params) => {
                    const response = await apiClient.getItems(userId, params);
                    if (response?.Items?.length) {
                        response.Items.forEach(item => {
                            if (item && item.Id && !existingIds.has(item.Id)) {
                                existingIds.add(item.Id);
                                collected.push(item);
                            }
                        });
                    }
                };
                
                if (type === 'Parent' && sources.length === 0) {
                    const params = {
                        ...queryBase,
                        Limit: itemLimit * 2
                    };
                    if (searchTerm) params.SearchTerm = searchTerm;
                    await runQuery(params);
                } else {
                    const multiplier = Math.max(1, sources.length);
                    for (const parentId of sources) {
                        const params = {
                            ...queryBase,
                            ParentId: parentId,
                            Limit: itemLimit * multiplier
                        };
                        if (searchTerm) params.SearchTerm = searchTerm;
                        await runQuery(params);
                    }
                }
                
                return dedupeAndLimit(collected);
            }
            
            return [];
        } catch (error) {
            console.warn('[KefinTweaks Configuration] Preview fetch failed:', error);
            throw error;
        }
    }
    
    // Handle save configuration
    async function handleSaveConfig(modalInstance, overrideOptionalIncludes = null) {
        // Verify admin status before saving
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            alert('您必须是管理员才能保存配置。');
            return;
        }

        console.log('[KefinTweaks Configuration] Saving configuration...');
        
        // Collect all form values
        // Preserve existing kefinTweaksRoot from current config (no longer editable in UI)
        const currentConfig = window.KefinTweaksCurrentConfig || window.KefinTweaksConfig || {};
        const config = currentConfig;
        config.enabled = modalInstance.dialogContent.querySelector('#kefinTweaksEnabled')?.checked !== false;
        
        // Remove scriptRoot if it exists (legacy field, no longer used)
        if (config.scriptRoot) {
            delete config.scriptRoot;
        }

        // Collect script toggles
        document.querySelectorAll('[data-script-key]').forEach(checkbox => {
            const key = checkbox.getAttribute('data-script-key');
            config.scripts[key] = checkbox.checked;
        });

        console.log('[KefinTweaks Configuration] Configuration collected:', config);

        // Save to JavaScript Injector plugin
        try {
            await KefinTweaksUtils.saveConfigToJavaScriptInjector(config);
            
            // Update global config objects so dropdown changes reflect saved values
            window.KefinTweaksConfig = config;
            window.KefinTweaksCurrentConfig = config;
            currentLoadedConfig = config;
            
            // Show success toast
            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                window.KefinTweaksToaster.toast('KefinTweaks 已保存！');
            }
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error saving configuration:', error);
            
            // Show error toast
            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                window.KefinTweaksToaster.toast(`保存配置时出错：${error.message}。请确保已安装 JavaScript Injector 插件且您拥有管理员权限。`, '5');
            } else {
                // Fallback to alert if toaster is not available
                alert(`保存配置时出错：${error.message}\n\n请确保已安装 JavaScript Injector 插件且您拥有管理员权限。`);
            }
        }
    }

    async function handleResetConfig(modalInstance) {
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            alert('您必须是管理员才能重置配置。');
            return;
        }

        const confirmed = confirm('此操作将把 KefinTweaks 配置恢复为默认值，且无法撤销。确定要继续吗？');
        if (!confirmed) {
            return;
        }

        try {
            const defaultConfig = await loadDefaultConfig();

            // Retain kefinTweaksRoot from existing config
            const existingConfig = await getKefinTweaksConfig();
            defaultConfig.kefinTweaksRoot = existingConfig.kefinTweaksRoot;
            // Note: scriptRoot is no longer used - scripts are loaded from kefinTweaksRoot + '/scripts/'

            await KefinTweaksUtils.saveConfigToJavaScriptInjector(defaultConfig);

            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                window.KefinTweaksToaster.toast('配置已重置为默认值。');
            } else {
                alert('配置已重置为默认值。');
            }

            if (modalInstance && typeof modalInstance.close === 'function') {
                modalInstance.close();
            }
            openConfigurationModal();
        } catch (error) {
            console.error('[KefinTweaks Configuration] Error resetting config:', error);
            if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                window.KefinTweaksToaster.toast(`重置配置时出错：${error.message}`, '5');
            } else {
                alert(`重置配置时出错：${error.message}`);
            }
        }
    }

    // Helper to parse JSON fields safely
    function parseJSONField(fieldId, defaultValue) {
        try {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                return defaultValue;
            }
            return JSON.parse(field.value);
        } catch (error) {
            console.error(`[KefinTweaks Configuration] Error parsing JSON field ${fieldId}:`, error);
            alert(`解析 ${fieldId} 中的 JSON 时出错：${error.message}`);
            return defaultValue;
        }
    }

    function getKefinTweaksRoot() {
        const raw = window.KefinTweaksConfig?.kefinTweaksRoot || '';
        return raw.endsWith('/') ? raw : `${raw}/`;
    }

    function getKefinTweaksLogoCssValue() {
        const root = getKefinTweaksRoot();
        if (!root) return 'none';
        return `url('${root}logo.png')`;
    }

    function ensureKefinTweaksLogoVar() {
        document.documentElement.style.setProperty(
            '--kefinTweaksLogo',
            getKefinTweaksLogoCssValue()
        );
    }

    function closeAppUserMenu() {
        const menu = document.getElementById('app-user-menu');
        if (!menu) return;
        const backdrop = menu.querySelector('.MuiBackdrop-root, .MuiModal-backdrop');
        if (backdrop) {
            backdrop.click();
            return;
        }
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
        }));
    }

    /**
     * Create KefinTweaks menu item for Jellyfin v12 #app-user-menu
     * @returns {HTMLAnchorElement}
     */
    function createAppUserMenuConfigButton() {
        ensureKefinTweaksLogoVar();

        const link = document.createElement('a');
        link.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters css-mbeig7';
        link.setAttribute('tabindex', '-1');
        link.setAttribute('role', 'menuitem');
        link.href = '#';
        link.setAttribute('data-kefintweaks-user-menu-config-button', 'true');

        const icon = document.createElement('div');
        icon.className = 'MuiListItemIcon-root';
        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-icons MuiSvgIcon-root MuiSvgIcon-fontSizeMedium';
        iconSpan.setAttribute('aria-hidden', 'true');
        icon.appendChild(iconSpan);

        const text = document.createElement('div');
        text.className = 'MuiListItemText-root';
        const span = document.createElement('span');
        span.className = 'MuiTypography-root MuiTypography-body1 MuiListItemText-primary';
        span.textContent = 'KefinTweaks';
        text.appendChild(span);

        const ripple = document.createElement('span');
        ripple.className = 'MuiTouchRipple-root';

        link.appendChild(icon);
        link.appendChild(text);
        link.appendChild(ripple);

        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAppUserMenu();
            openConfigurationModal();
        });

        return link;
    }

    /**
     * Insert KefinTweaks into #app-user-menu before the first HR after Dashboard.
     * @returns {boolean} true if button is present after this call
     */
    function addConfigButtonToAppUserMenu() {
        if (document.querySelector('[data-kefintweaks-user-menu-config-button]')) {
            return true;
        }

        const appUserMenu = document.getElementById('app-user-menu');
        if (!appUserMenu) {
            return false;
        }

        const menuList = appUserMenu.querySelector('ul[role="menu"]');
        if (!menuList) {
            return false;
        }

        const dashboardLink = menuList.querySelector('a[href="#/dashboard"]')
            || menuList.querySelector('a[href*="#/dashboard"]');
        if (!dashboardLink) {
            console.log('[KefinTweaks Configuration] #app-user-menu Dashboard link not found');
            return false;
        }

        let divider = dashboardLink.nextElementSibling;
        while (divider && !(divider.matches('hr') || divider.classList.contains('MuiDivider-root'))) {
            divider = divider.nextElementSibling;
        }
        if (!divider) {
            console.log('[KefinTweaks Configuration] #app-user-menu divider after Dashboard not found');
            return false;
        }

        const button = createAppUserMenuConfigButton();
        divider.parentNode.insertBefore(button, divider);
        console.log('[KefinTweaks Configuration] Configuration button added to #app-user-menu');
        return true;
    }

    let appUserMenuConfigObserver = null;

    /**
     * Permanent observer: keep re-injecting if #app-user-menu remounts and our button is lost.
     */
    function setupAppUserMenuConfigButtonObserver() {
        addConfigButtonToAppUserMenu();

        if (appUserMenuConfigObserver) {
            return;
        }

        if (typeof MutationObserver === 'undefined' || !document.body) {
            console.log('[KefinTweaks Configuration] Cannot observe #app-user-menu (MutationObserver/body unavailable)');
            return;
        }

        let scheduled = false;
        appUserMenuConfigObserver = new MutationObserver(() => {
            if (document.querySelector('[data-kefintweaks-user-menu-config-button]')) {
                return;
            }
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(() => {
                scheduled = false;
                addConfigButtonToAppUserMenu();
            });
        });

        appUserMenuConfigObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Create configuration button for Administration section
    function createConfigButton() {
        ensureKefinTweaksLogoVar();

        const button = document.createElement('div');
        button.style.display = 'block';
        button.style.padding = '0';
        button.style.margin = '0';
        button.className = 'listItem-border emby-button kefin-config-button';
        button.setAttribute('data-kefintweaks-config-button', 'true');
        button.onclick = (e) => {
            e.preventDefault();
            openConfigurationModal();
        };

        button.innerHTML = `
            <div class="listItem">
                <span class="material-icons listItemIcon listItemIcon-transparent" aria-hidden="true"></span>
                <div class="listItemBody">
                    <div class="listItemBodyText">KefinTweaks</div>
                </div>
            </div>
        `;

        return button;
    }

    // Create dashboard side menu button
    function createDashboardConfigButton() {
        ensureKefinTweaksLogoVar();

        // Check if button already exists
        if (document.querySelector('[data-kefintweaks-dashboard-config-button]')) {
            return null;
        }

        // Get an existing native button
        const nativeButton = document.querySelector('.MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-gutters.MuiListItemButton-root.MuiListItemButton-gutters');

        const div = document.createElement('div');
        div.className = 'MuiButtonBase-root MuiListItemButton-root MuiListItemButton-gutters MuiListItemButton-root MuiListItemButton-gutters css-yknuxp';
        div.setAttribute('tabindex', '0');
        div.setAttribute('data-kefintweaks-dashboard-config-button', 'true');
        div.onclick = () => {
            openConfigurationModal();
        };
        
        // Create icon with Material icon
        const icon = document.createElement('div');
        icon.className = 'MuiListItemIcon-root css-37qkju css-5pks8q';
        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-icons MuiSvgIcon-root MuiSvgIcon-fontSizeMedium';
        iconSpan.style.marginRight = '12px';
        iconSpan.setAttribute('aria-hidden', 'true');
        icon.appendChild(iconSpan);

        // Create text
        const text = document.createElement('div');
        text.className = 'MuiListItemText-root css-f696uz css-t3p1pa';
        const span = document.createElement('span');
        span.className = 'MuiTypography-root MuiTypography-body1 MuiListItemText-primary css-hlxkyz css-pl8nxc';
        span.textContent = 'KefinTweaks';
        text.appendChild(span);

        // Create ripple effect span
        const ripple = document.createElement('span');
        ripple.className = 'MuiTouchRipple-root css-w0pj6f css-4mb1j7';

        div.appendChild(icon);
        div.appendChild(text);
        div.appendChild(ripple);

        return div;
    }

    // Add configuration button to dashboard side menu
    function addConfigButtonToDashboard() {
        // Check if button already exists
        if (document.querySelector('[data-kefintweaks-dashboard-config-button]')) {
            return;
        }

        // Find the plugins section
        const pluginsSection = document.querySelector('ul[aria-labelledby="plugins-subheader"]');
        if (!pluginsSection) {
            console.log('[KefinTweaks Configuration] Plugins section not found, retrying...');
            //setTimeout(addConfigButtonToDashboard, 500);
            return;
        }

        // Create the button
        const button = createDashboardConfigButton();
        if (!button) {
            return;
        }

        // Add button to the plugins section
        pluginsSection.appendChild(button);

        console.log('[KefinTweaks Configuration] Configuration button added to dashboard side menu');
    }

    // Add configuration button to Administration section
    function addConfigButtonToAdminSection() {
        return;
        // Check if button already exists (check for admin section button specifically)
        if (document.querySelector('.adminSection [data-kefintweaks-config-button]')) {
            return;
        }

        // Find the Administration section
        const adminSection = document.querySelector('.adminSection.verticalSection');
        if (!adminSection) {
            console.log('[KefinTweaks Configuration] Administration section not found, retrying...');
            //setTimeout(addConfigButtonToAdminSection, 500);
            return;
        }

        // Create and add the button
        const button = createConfigButton();
        adminSection.appendChild(button);

        console.log('[KefinTweaks Configuration] Configuration button added to Administration section');
    }

    // Register onViewPage handler for mypreferencesmenu page and dashboard
    function registerViewPageHandler() {
        if (!window.KefinTweaksUtils || !window.KefinTweaksUtils.onViewPage) {
            console.log('[KefinTweaks Configuration] KefinTweaksUtils.onViewPage not available, retrying...');
            setTimeout(registerViewPageHandler, 1000);
            return;
        }

        // Handler for dashboard and preferences pages
        window.KefinTweaksUtils.onViewPage(async (view, element, hash) => {
            // Check if user is admin before adding buttons
            const userIsAdmin = await isAdmin();
            if (!userIsAdmin) {
                console.log('[KefinTweaks Configuration] User is not admin, not adding buttons');
                return;
            }

            // Check if we're on the mypreferencesmenu page
            if (hash && (hash.includes('mypreferencesmenu') || hash.includes('userpreferences') || hash.includes('preferences'))) {
                console.log('[KefinTweaks Configuration] Preferences page detected');
                // Wait a bit for the page to fully load
                setTimeout(() => {
                    addConfigButtonToAdminSection();
                }, 500);
            }

            // Check if we're on the dashboard page
            if (view === 'dashboard' || view === 'configurationpage' || hash.includes('dashboard') || hash.includes('configurationpage')) {
                console.log('[KefinTweaks Configuration] Dashboard page detected');
                // Wait a bit for the page to fully load
                    setTimeout(() => {
                    addConfigButtonToDashboard();
                    }, 500);
                }
        });

        console.log('[KefinTweaks Configuration] Registered onViewPage handler');
    }

    // Add configuration link to custom menu
    async function addConfigLinkToCustomMenu() {
        // Check if user is admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            console.log('[KefinTweaks Configuration] User is not admin, not adding menu link');
            return;
        }

        // Check if utils is available
        if (!window.KefinTweaksUtils || !window.KefinTweaksUtils.addCustomMenuLink) {
            console.log('[KefinTweaks Configuration] KefinTweaksUtils.addCustomMenuLink not available, retrying...');
            setTimeout(addConfigLinkToCustomMenu, 1000);
            return;
        }

        // Admin-only: user menu admin section + default side menu; open via JS action
        const success = await window.KefinTweaksUtils.addCustomMenuLink(
            'KefinTweaks',
            'build',
            '',
            false,
            {
                userMenu: true,
                isAdminLink: true,
                action: 'KefinTweaksConfiguration.openConfigurationModal'
            }
        );

        if (success) {
            console.log('[KefinTweaks Configuration] Configuration link added to custom menu');
        }
    }

    // Handle direct navigation to config URL
    function handleDirectConfigNavigation() {
        if (window.location.hash === '#kefintweaks-config') {
            console.log('[KefinTweaks Configuration] Direct navigation to config URL detected');
            // Remove the hash to prevent navigation
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            // Open modal
            openConfigurationModal();
        }
    }

    // Set up hashchange listener for navigation after page load
    function setupHashChangeListener() {
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#kefintweaks-config') {
                console.log('[KefinTweaks Configuration] Hash change to config URL detected');
                // Remove the hash to prevent navigation
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                // Open modal
                openConfigurationModal();
            }
        });
    }

    // Initialize when DOM is ready
    async function initialize() {
        if (!window.ApiClient || !window.ApiClient._loggedIn) {
            setTimeout(initialize, 1000);
            return;
        }

        // Run migration check during initialization
        try {
            const config = await getKefinTweaksConfig();
            // Migration is handled inside getKefinTweaksConfig
        } catch (error) {
            console.warn('[KefinTweaks Configuration] Error during initialization migration check:', error);
        }

        // Register view page handler
        registerViewPageHandler();

        // Add configuration link to custom menu (jf12 fork: configurationLauncher.js already registered it when it loaded this file)
        if (!window.KefinTweaksConfigLauncher) {
            addConfigLinkToCustomMenu();
        }

        // Set up hashchange listener
        setupHashChangeListener();

        // Handle direct navigation to config URL
        handleDirectConfigNavigation();

        // Also check current page on initial load
        const hash = window.location.hash;
        const userIsAdmin = await isAdmin();
        
        if (userIsAdmin) {
            // User-menu KefinTweaks entry is owned by addCustomMenuLink(userMenu + isAdminLink + action)

            if (hash && (hash.includes('mypreferencesmenu') || hash.includes('userpreferences') || hash.includes('preferences'))) {
                setTimeout(() => {
                    addConfigButtonToAdminSection();
                }, 1000);
            }
            
            if (hash && hash.includes('dashboard')) {
        setTimeout(() => {
                    addConfigButtonToDashboard();
                }, 1000);
            }
        }
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    console.log('[KefinTweaks Configuration] Script loaded');
})();
