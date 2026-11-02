// KefinTweaks Series Episodes Configuration UI
// Modular configuration modal for managing series episodes settings

(function() {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks SeriesEpisodes Config]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks SeriesEpisodes Config]', ...args);

    const MODAL_ID = 'kefin-seriesepisodes-config';

    /**
     * Load configuration from window.KefinTweaksConfig
     */
    async function loadConfig() {
        const config = window.KefinTweaksConfig || {};
        return config.flattenSingleSeasonShows || {};
    }

    /**
     * Save configuration to JS Injector
     */
    async function saveConfig(flattenShowsConfig) {
        try {
            // Ensure window.KefinTweaksConfig exists
            if (!window.KefinTweaksConfig) {
                window.KefinTweaksConfig = {};
            }

            // Update flattenSingleSeasonShows config
            window.KefinTweaksConfig.flattenSingleSeasonShows = flattenShowsConfig;

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
        const hideSingleSeasonContainer = config.hideSingleSeasonContainer === true;
        return `
            <div style="max-width: 800px;">
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">折叠单季剧集的季选择</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">启用后，当剧集只有一季时隐藏季选择区域，因为集已经直接显示。</div>
                        <label class="checkboxContainer" style="display: flex; align-items: center; gap: 0.5em;">
                            <input type="checkbox" id="flattenSingleSeasonShows_hideSingleSeasonContainer" ${hideSingleSeasonContainer ? 'checked' : ''}>
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
        const hideSingleSeasonContainer = document.getElementById('flattenSingleSeasonShows_hideSingleSeasonContainer')?.checked === true;
        return {
            hideSingleSeasonContainer: hideSingleSeasonContainer
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
                <button class="emby-button raised block button-submit" id="save-seriesepisodes-config-btn">保存</button>
            `;

            // Create modal
            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: '剧集页面的集设置',
                content: content,
                footer: footer,
                closeOnBackdrop: true,
                closeOnEscape: true,
                showCloseButton: true,
                onOpen: (modal) => {
                    // Save button
                    const saveBtn = modal.dialogFooter.querySelector('#save-seriesepisodes-config-btn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', async () => {
                            const flattenShowsConfig = collectConfig();
                            const success = await saveConfig(flattenShowsConfig);
                            if (success) {
                                if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                    window.KefinTweaksToaster.toast('配置已保存！');
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

            LOG('Series Episodes configuration modal opened');
        } catch (error) {
            ERR('Error opening series episodes config modal:', error);
            alert('打开配置时出错：' + error.message);
        }
    }

    // Export
    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.seriesEpisodes = { openConfigModal };

    console.log('[KefinTweaks SeriesEpisodes Config] Script loaded');

})();

