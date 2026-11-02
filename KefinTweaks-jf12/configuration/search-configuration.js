// KefinTweaks Search Configuration UI
// Modular configuration modal for managing search settings

(function() {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks Search Config]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks Search Config]', ...args);

    const MODAL_ID = 'kefin-search-config';

    /**
     * Load configuration from window.KefinTweaksConfig
     */
    async function loadConfig() {
        const config = window.KefinTweaksConfig || {};
        return config.search || {};
    }

    /**
     * Save configuration to JS Injector
     */
    async function saveConfig(searchConfig) {
        try {
            // Ensure window.KefinTweaksConfig exists
            if (!window.KefinTweaksConfig) {
                window.KefinTweaksConfig = {};
            }

            // Update search config
            window.KefinTweaksConfig.search = searchConfig;

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
        return `
            <div style="max-width: 800px;">
                <div class="listItemBodyText secondary" style="margin-bottom: 1em; font-size: 0.9em; line-height: 1.4;">
                    将搜索页上的输入框替换为优先搜索电影、剧集、集和人物的版本（旁边会出现“全部”“音乐”“图书”标签，仅显示您拥有的媒体库），
                    并以普通卡片的形式展示结果，每种类型一行。它可以与 Jellyfin Enhanced 共存：当 JE 显示 Seerr 结果时，这些结果会排在这些行下方。
                </div>
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">启用 JellyfinEnhanced 的 Seerr 结果</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">如果您正在使用 Jellyfin Enhanced 的 Seerr，可以启用此项，为请求（Requests）添加一个额外的搜索切换标签</div>
                        <label class="checkboxContainer" style="display: flex; align-items: center; gap: 0.5em;">
                            <input type="checkbox" id="search_enableJellyseerr" ${config.enableJellyseerr === true ? 'checked' : ''}>
                            <span class="listItemBodyText">启用</span>
                        </label>
                    </div>
                </div>
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">记住搜索类型</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">下次打开搜索页时会重新选中上次选择的标签（全部、电影/剧集、音乐、图书、请求）。它只保存在此浏览器中，不会写入服务器。关闭此项则始终从电影/剧集开始。</div>
                        <label class="checkboxContainer" style="display: flex; align-items: center; gap: 0.5em;">
                            <input type="checkbox" id="search_rememberType" ${config.rememberType !== false ? 'checked' : ''}>
                            <span class="listItemBodyText">启用</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Collect configuration from form
     */
    function collectConfig() {
        const enableJellyseerr = document.getElementById('search_enableJellyseerr')?.checked === true;
        const rememberType = document.getElementById('search_rememberType')?.checked !== false;
        return {
            enableJellyseerr: enableJellyseerr,
            rememberType: rememberType
        };
    }

    /**
     * Open configuration modal
     */
    async function openConfigModal() {
        try {
            // Load config
            const config = await loadConfig();

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
                <button class="emby-button raised block button-submit" id="save-search-config-btn">保存</button>
            `;

            // Create modal
            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: '搜索设置',
                content: content,
                footer: footer,
                closeOnBackdrop: true,
                closeOnEscape: true,
                showCloseButton: true,
                onOpen: (modal) => {
                    // Save button
                    const saveBtn = modal.dialogFooter.querySelector('#save-search-config-btn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', async () => {
                            const searchConfig = collectConfig();
                            const success = await saveConfig(searchConfig);
                            if (success) {
                                if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                    window.KefinTweaksToaster.toast('搜索配置已保存！');
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

            LOG('Search configuration modal opened');
        } catch (error) {
            ERR('Error opening search config modal:', error);
            alert('打开配置时出错：' + error.message);
        }
    }

    // Export
    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.search = { openConfigModal };

    console.log('[KefinTweaks Search Config] Script loaded');

})();

