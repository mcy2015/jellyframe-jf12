// KefinTweaks Skin Manager Configuration UI
// Modular configuration modal for managing skins, themes, and optional includes

(function() {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks SkinManager Config]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks SkinManager Config]', ...args);

    const MODAL_ID = 'kefin-skinmanager-config';
    
    // Store loaded config for use in listeners
    let currentLoadedConfig = null;

    // Helper function to build Jellyfin checkbox
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

    // Extract GitHub repository URL from skin configuration
    function getSkinGitHubUrl(skin) {
        if (skin.github) {
            return skin.github;
        }
        
        if (skin.url && Array.isArray(skin.url)) {
            for (const urlObj of skin.url) {
                if (urlObj.urls && Array.isArray(urlObj.urls)) {
                    for (const url of urlObj.urls) {
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
    function buildSkinToggles(skins, skinSources = {}) {
        return skins.map(skin => {
            const isEnabled = skin.enabled !== false;
            const githubUrl = getSkinGitHubUrl(skin);
            const source = skinSources[skin.name] || 'default';
            
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
            }
            
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

    // Build optional includes skin options
    function buildOptionalIncludesSkinOptions(skins) {
        const skinsWithOptionalIncludes = skins.filter(skin => 
            skin.optionalIncludes && skin.optionalIncludes.length > 0
        );
        
        return skinsWithOptionalIncludes.map(skin => 
            `<option value="${skin.name}">${skin.name}</option>`
        ).join('');
    }

    // Extract author from URL
    function extractAuthorFromUrl(url) {
        if (!url) return '';
        try {
            const jsdelivrMatch = url.match(/cdn\.jsdelivr\.net\/gh\/([^\/]+)\//);
            if (jsdelivrMatch) {
                return jsdelivrMatch[1];
            }
        } catch (e) {
            // Ignore errors
        }
        return '';
    }

    // Generate optional include key
    function generateOptionalIncludeKey(skinName, author, url) {
        const normalizedSkinName = skinName === 'global' ? 'global' : skinName.replace(/\s+/g, '_');
        const filename = url ? url.split('?')[0].split('#')[0].split('/').pop() : '';
        const normalizedAuthor = (author || '').replace(/\s+/g, '_');
        return `${normalizedSkinName}-${normalizedAuthor}-${filename}`;
    }

    // Extract filename from URL
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

    // Build optional includes editor (simplified version)
    function buildOptionalIncludesEditor(category, config, skins) {
        let optionalIncludes = [];
        
        if (category === 'global') {
            const defaultGlobalIncludes = window.KefinTweaksDefaultSkinsConfig?.globalOptionalIncludes || [];
            optionalIncludes = defaultGlobalIncludes.map(include => ({ ...include }));
            
            const adminOptionalIncludes = config.optionalIncludes || [];
            adminOptionalIncludes.forEach(adminEntry => {
                if (typeof adminEntry === 'object' && adminEntry.key) {
                    const keyParts = adminEntry.key.split('-');
                    if (keyParts[0] === 'global' && keyParts.length >= 3) {
                        const author = keyParts[1];
                        const filename = keyParts.slice(2).join('-');
                        
                        const matchingInclude = optionalIncludes.find(inc => {
                            const incAuthor = extractAuthorFromUrl(inc.url);
                            const incFilename = extractFilenameFromUrl(inc.url);
                            return incAuthor === author && incFilename === filename;
                        });
                        
                        if (matchingInclude) {
                            matchingInclude.enabled = adminEntry.enabled;
                        }
                    }
                }
            });
        } else {
            const skin = skins.find(s => s.name === category);
            if (skin && skin.optionalIncludes) {
                optionalIncludes = skin.optionalIncludes.map(include => {
                    const author = extractAuthorFromUrl(include.url);
                    const key = generateOptionalIncludeKey(category, author, include.url);
                    
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
                    ${category === 'global' ? '全局选项' : category}没有可用的可选 CSS 模块。
                </div>
            `;
        }
        
        return `
            <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                配置哪些可选 CSS 模块默认启用。用户可以单独覆盖这些设置。
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

    /**
     * Load configuration from window.KefinTweaksConfig
     */
    async function loadConfig() {
        const config = window.KefinTweaksConfig || {};
        
        // Reconstruct full skin list (enabled + disabled) for configuration
        const defaultSkins = window.KefinTweaksDefaultSkinsConfig?.skins || [];
        const adminSkins = config.skins || [];
        
        const mergedSkins = [];
        
        // Add all default skins first
        defaultSkins.forEach(skin => {
            mergedSkins.push({ ...skin, enabled: true });
        });
        
        // Override/Add with admin skins
        adminSkins.forEach(adminSkin => {
            const existingIndex = mergedSkins.findIndex(s => s.name === adminSkin.name);
            if (existingIndex >= 0) {
                mergedSkins[existingIndex] = { ...mergedSkins[existingIndex], ...adminSkin };
            } else {
                mergedSkins.push({ ...adminSkin });
            }
        });
        
        return {
            skins: mergedSkins,
            themes: config.themes || [],
            defaultSkin: config.defaultSkin || null,
            optionalIncludes: config.optionalIncludes || []
        };
    }

    /**
     * Save configuration to JS Injector
     */
    async function saveConfig(skinManagerConfig) {
        try {
            if (!window.KefinTweaksConfig) {
                window.KefinTweaksConfig = {};
            }

            // Update skin manager config
            window.KefinTweaksConfig.skins = skinManagerConfig.skins;
            window.KefinTweaksConfig.themes = skinManagerConfig.themes;
            window.KefinTweaksConfig.defaultSkin = skinManagerConfig.defaultSkin;
            window.KefinTweaksConfig.optionalIncludes = skinManagerConfig.optionalIncludes;

            // Save to JS Injector using utils
            if (window.KefinTweaksUtils && window.KefinTweaksUtils.saveConfigToJavaScriptInjector) {
                await window.KefinTweaksUtils.saveConfigToJavaScriptInjector();
                LOG('Configuration saved to JS Injector');
                return true;
            } else {
                // Fallback: use findJavaScriptInjectorPlugin and saveConfigToJavaScriptInjector from configuration.js
                if (window.KefinTweaksConfiguration && window.KefinTweaksConfiguration.findJavaScriptInjectorPlugin) {
                    const pluginId = await window.KefinTweaksConfiguration.findJavaScriptInjectorPlugin();
                    if (pluginId) {
                        await window.KefinTweaksConfiguration.saveConfigToJavaScriptInjector(window.KefinTweaksConfig);
                        LOG('Configuration saved to JS Injector (fallback)');
                        return true;
                    }
                }
                ERR('saveConfigToJavaScriptInjector not available');
                return false;
            }
        } catch (error) {
            ERR('Error saving config:', error);
            return false;
        }
    }

    /**
     * Build configuration HTML
     */
    function buildConfigHTML(config) {
        const allSkinNames = config.skins.map(skin => skin.name).filter(Boolean);
        const skinSources = window.KefinTweaksSkinManager?.getAllSkinSources?.() || {};
        const hasOverriddenSkins = Object.values(skinSources).some(source => source === 'overridden');

        return `
            <div style="max-width: 1200px;">
                <!-- Default Skin -->
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">默认皮肤</div>
                        <select id="defaultSkin" class="fld emby-select-withcolor emby-select" style="width: 100%; max-width: 400px;">
                            ${allSkinNames.map(name => `<option value="${name}" ${config.defaultSkin === name ? 'selected' : ''}>${name}</option>`).join('')}
                            ${allSkinNames.length === 0 ? '<option value="">暂无可用皮肤</option>' : ''}
                        </select>
                        <div class="listItemBodyText secondary" style="margin-top: 0.5em; font-size: 0.9em;">为所有用户选择默认皮肤</div>
                    </div>
                </div>

                <!-- Enable/Disable Skins -->
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent" style="width: 100%;">
                        <h3 class="listItemBodyText" style="margin-bottom: 0.5em;">启用/禁用皮肤</h3>
                        <div class="listItemBodyText secondary" style="margin-bottom: 1em; font-size: 0.9em;">已禁用的皮肤不会出现在用户的外观下拉菜单中</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 1em; font-size: 0.85em; color: rgba(255,255,255,0.7); line-height: 1.5;">
                            所有主题都由像您一样的社区成员用心制作。如果您喜欢他们的作品，请不要忘记感谢他们的付出与时间。
                            KefinTweaks 并未参与制作以下任何皮肤，只是尽力让大家更方便地使用它们。
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5em;">
                            ${buildSkinToggles(config.skins, skinSources)}
                        </div>
                    </div>
                </div>

                ${hasOverriddenSkins ? `
                    <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                        <div class="listItemContent">
                            <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">部分默认皮肤已被自定义配置覆盖。点击下方按钮可移除覆盖默认皮肤的自定义皮肤。</div>
                            <button type="button" id="removeDuplicateDefaultsBtn" class="emby-button raised" style="padding: 0.5em 1.5em; font-size: 0.9em;">
                                <span>移除覆盖默认皮肤的自定义皮肤</span>
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- Optional CSS Modules -->
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <h3 class="listItemBodyText" style="margin-bottom: 0.25em;">可选 CSS 模块</h3>
                        <div class="listItemBodyText secondary" style="margin-bottom: 1em; font-size: 0.9em;">配置可选 CSS 模块的默认启用/禁用状态。当用户未指定自己的偏好时，将使用这些设置。</div>
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">选择皮肤</div>
                        <select id="optionalIncludesCategory" class="fld emby-select-withcolor emby-select" style="width: 100%; max-width: 400px; margin-bottom: 1em;">
                            <option value="global">全局（应用于所有皮肤）</option>
                            ${buildOptionalIncludesSkinOptions(config.skins)}
                        </select>
                        <div id="optionalIncludesEditor">
                            ${buildOptionalIncludesEditor('global', { optionalIncludes: config.optionalIncludes }, config.skins)}
                        </div>
                    </div>
                </div>

                <!-- Skins JSON -->
                <details class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0; margin-bottom: 1em; display: grid;">
                    <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; padding: 0.75em; display: flex; align-items: center; gap: 0.5em; list-style: none; user-select: none;">
                        <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                        <span>皮肤 JSON</span>
                    </summary>
                    <div style="padding: 0.75em; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div class="listItemContent">
                            <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">添加可供所有用户使用的额外皮肤。每个皮肤可以包含针对不同服务器版本的多个 CSS 文件。您可以在下方配置 JSON 中使用相同的皮肤名称指定自定义配置，从而覆盖 KefinTweaks 的默认皮肤。此 JSON 中与 KefinTweaks 默认皮肤同名的皮肤将覆盖默认功能。默认皮肤不在此处显示，因为它们是单独管理的。</div>
                            <textarea id="skinsJson" class="fld emby-textarea" rows="15" placeholder='[{"name":"Skin Name","author":"Author","url":[...]}]' style="width: 100%; font-family: monospace; font-size: 0.9em; line-height: 1.5;">${JSON.stringify(config.skins.filter(s => {
                                const defaultSkinNames = new Set((window.KefinTweaksDefaultSkinsConfig?.skins || []).map(s => s.name));
                                return !defaultSkinNames.has(s.name);
                            }).map(s => ({
                                name: s.name,
                                author: s.author,
                                url: s.url,
                                colorSchemes: s.colorSchemes || []
                            })), null, 2)}</textarea>
                        </div>
                    </div>
                </details>

                <!-- Themes JSON -->
                <details class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0; margin-bottom: 1em; display: grid;">
                    <summary class="listItemBodyText" style="font-weight: 500; cursor: pointer; padding: 0.75em; display: flex; align-items: center; gap: 0.5em; list-style: none; user-select: none;">
                        <span class="material-icons" style="font-size: 1.2em; transition: transform 0.2s;">chevron_right</span>
                        <span>主题 JSON</span>
                    </summary>
                    <div style="padding: 0.75em; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div class="listItemContent">
                            <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">添加可供所有用户使用的额外主题。每个主题应包含名称和指向 CSS 文件的 URL。</div>
                            <textarea id="themesJson" class="fld emby-textarea" rows="12" placeholder='[{"name":"Theme Name","url":"https://..."}]' style="width: 100%; font-family: monospace; font-size: 0.9em; line-height: 1.5;">${JSON.stringify(config.themes, null, 2)}</textarea>
                        </div>
                    </div>
                </details>
            </div>
        `;
    }

    /**
     * Collect configuration from form
     */
    function collectConfig() {
        // Get default skin
        const defaultSkin = document.getElementById('defaultSkin')?.value || null;
        if (defaultSkin === '') {
            defaultSkin = null;
        }

        // Get skin enabled states
        const skinEnabledStates = {};
        document.querySelectorAll('[data-skin-name]').forEach(checkbox => {
            const skinName = checkbox.getAttribute('data-skin-name');
            skinEnabledStates[skinName] = checkbox.checked;
        });

        // Get default skin names to filter them out
        const defaultSkinNames = new Set((window.KefinTweaksDefaultSkinsConfig?.skins || []).map(s => s.name));
        
        // Parse skins JSON
        let skinsFromJson = [];
        try {
            const skinsJsonText = document.getElementById('skinsJson')?.value || '[]';
            skinsFromJson = JSON.parse(skinsJsonText);
        } catch (e) {
            ERR('Error parsing skins JSON:', e);
        }

        // Only save admin skins (from JSON textarea) - filter out any that match default names
        const customSkins = skinsFromJson
            .filter(skin => !defaultSkinNames.has(skin.name))
            .map(skin => ({
                ...skin,
                enabled: skinEnabledStates[skin.name] !== false,
                hidden: false
            }));

        // Handle disabled default skins
        const disabledDefaultSkins = [];
        defaultSkinNames.forEach(name => {
            if (skinEnabledStates[name] === false) {
                disabledDefaultSkins.push({
                    name: name,
                    enabled: false
                });
            }
        });

        // Combine custom skins and disabled default skins
        const skins = [...customSkins, ...disabledDefaultSkins];

        // Parse themes JSON
        let themes = [];
        try {
            const themesJsonText = document.getElementById('themesJson')?.value || '[]';
            themes = JSON.parse(themesJsonText);
        } catch (e) {
            ERR('Error parsing themes JSON:', e);
        }

        // Collect optional includes for the currently selected category only
        const categorySelect = document.getElementById('optionalIncludesCategory');
        const currentCategory = categorySelect ? categorySelect.value : 'global';
        
        // Get existing optional includes from config
        const existingOptionalIncludes = (window.KefinTweaksConfig?.optionalIncludes || []).slice();
        
        // Collect only the optional includes for the current category
        const currentCategoryOptionalIncludes = [];
        document.querySelectorAll('.optionalIncludeCheckbox').forEach(checkbox => {
            const category = checkbox.getAttribute('data-category');
            const key = checkbox.getAttribute('data-key');
            const enabled = checkbox.checked;
            
            // Only collect if it matches the current category
            if (category === currentCategory) {
                currentCategoryOptionalIncludes.push({
                    key: key,
                    enabled: enabled
                });
            }
        });
        
        // Merge: remove existing entries for this category, then add new ones
        const optionalIncludes = existingOptionalIncludes.filter(entry => {
            if (typeof entry === 'object' && entry.key) {
                const keyParts = entry.key.split('-');
                const entryCategory = keyParts[0];
                return entryCategory !== currentCategory;
            }
            return true;
        });
        
        // Add the current category's optional includes
        optionalIncludes.push(...currentCategoryOptionalIncludes);

        return {
            skins: skins,
            themes: themes,
            defaultSkin: defaultSkin,
            optionalIncludes: optionalIncludes
        };
    }

    /**
     * Attach event listeners
     */
    function attachListeners(modalInstance) {
        // Optional includes category change
        const categorySelect = modalInstance.dialogContent.querySelector('#optionalIncludesCategory');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                const category = categorySelect.value;
                const editor = modalInstance.dialogContent.querySelector('#optionalIncludesEditor');
                if (editor) {
                    // Use saved config from window.KefinTweaksConfig to get the actual saved optionalIncludes
                    // This ensures the UI reflects the saved state, not just what's currently visible
                    const savedOptionalIncludes = window.KefinTweaksConfig?.optionalIncludes || [];
                    const config = { optionalIncludes: savedOptionalIncludes };
                    const mergedSkins = currentLoadedConfig ? currentLoadedConfig.skins : collectConfig().skins;
                    editor.innerHTML = buildOptionalIncludesEditor(category, config, mergedSkins);
                    attachListeners(modalInstance); // Re-attach listeners for new checkboxes
                }
            });
        }

        // Remove duplicate defaults button
        const removeBtn = modalInstance.dialogContent.querySelector('#removeDuplicateDefaultsBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                // This would need to be implemented to remove overridden skins
                alert('此功能将移除覆盖默认皮肤的自定义皮肤。功能尚未实现。');
            });
        }
    }

    /**
     * Open configuration modal
     */
    async function openConfigModal() {
        try {
            // Load config
            const config = await loadConfig();
            
            // Store loaded config for use in listeners
            currentLoadedConfig = config;

            // Build content
            const content = document.createElement('div');
            content.innerHTML = buildConfigHTML(config);

            // Build footer
            const footer = document.createElement('div');
            footer.style.display = 'flex';
            footer.style.gap = '0.75em';
            footer.style.justifyContent = 'flex-end';
            footer.innerHTML = `
                <button class="emby-button raised" onclick="window.ModalSystem.close('${MODAL_ID}')">关闭</button>
                <button class="emby-button raised block button-submit" id="save-skinmanager-config-btn">保存</button>
            `;

            // Create modal
            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: '皮肤管理器设置',
                content: content,
                footer: footer,
                closeOnBackdrop: true,
                closeOnEscape: true,
                showCloseButton: true,
                onOpen: (modal) => {
                    attachListeners(modal);

                    // Save button
                    const saveBtn = modal.dialogFooter.querySelector('#save-skinmanager-config-btn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', async () => {
                            const skinManagerConfig = collectConfig();
                            const success = await saveConfig(skinManagerConfig);
                            if (success) {
                                if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                    window.KefinTweaksToaster.toast('皮肤管理器配置已保存！');
                                }
                                window.ModalSystem.close(MODAL_ID);
                            } else {
                                alert('保存配置时出错。请确保已安装 JavaScript Injector 插件，并且您拥有管理员权限。');
                            }
                        });
                    }
                }
            });

            if (window.innerWidth >= 900) {
                modalInstance.dialog.style.maxWidth = '90vw';
                modalInstance.dialog.style.width = '1400px';
                modalInstance.dialog.style.height = '90vh';
            }

            LOG('Skin Manager configuration modal opened');
        } catch (error) {
            ERR('Error opening skin manager config modal:', error);
            alert('打开配置时出错：' + error.message);
        }
    }

    // Export
    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.skinManager = { openConfigModal };

    console.log('[KefinTweaks SkinManager Config] Script loaded');

})();

