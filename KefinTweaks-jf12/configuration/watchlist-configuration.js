// KefinTweaks Watchlist Configuration UI

(function () {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks Watchlist Config]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks Watchlist Config]', ...args);

    const MODAL_ID = 'kefin-watchlist-config';

    const DEFAULTS = {
        sideMenu: true,
        topNavigation: 'main',
        userMenu: true,
        order: 2,
        autoRemovePlayed: false,   // jf12 fork: opt-in (removing played items is a server write nobody clicked for)
        statistics: false,         // jf12 fork: opt-in Statistics tab (Playback Reporting covers it); loads Chart.js on demand
        mediaBarButton: false      // jf12 fork: opt-in watchlist button in the Media Bar hero (the hero is left alone by default)
    };

    function normalizeConfig(raw) {
        const cfg = raw && typeof raw === 'object' ? raw : {};
        const orderRaw = parseInt(cfg.order, 10);
        return {
            sideMenu: cfg.sideMenu !== false,
            topNavigation: typeof cfg.topNavigation === 'boolean'
                ? (cfg.topNavigation ? 'main' : 'none')
                : cfg.topNavigation === undefined ? 'main' : cfg.topNavigation,
            userMenu: cfg.userMenu !== false,
            order: Number.isFinite(orderRaw) ? orderRaw : DEFAULTS.order,
            autoRemovePlayed: cfg.autoRemovePlayed === true,
            statistics: cfg.statistics === true,
            mediaBarButton: cfg.mediaBarButton === true
        };
    }

    async function loadConfig() {
        const config = window.KefinTweaksConfig || {};
        return normalizeConfig(config.watchlist);
    }

    async function saveConfig(watchlistConfig) {
        try {
            if (!window.KefinTweaksConfig) {
                window.KefinTweaksConfig = {};
            }
            window.KefinTweaksConfig.watchlist = watchlistConfig;

            if (window.KefinTweaksUtils && window.KefinTweaksUtils.saveConfigToJavaScriptInjector) {
                await window.KefinTweaksUtils.saveConfigToJavaScriptInjector();
                LOG('Configuration saved to JS Injector');
                return true;
            }
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
        } catch (error) {
            ERR('Error saving config:', error);
            return false;
        }
    }

    function buildToggleCard(id, checked, label, description) {
        if (typeof window.KefinTweaksUI?.buildToggleCard === 'function') {
            return window.KefinTweaksUI.buildToggleCard(id, checked, label, description);
        }
        return `
            <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 0.75em;">
                <label class="listItemBodyText" style="display:flex;align-items:center;gap:0.75em;">
                    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
                    <span>${label}</span>
                </label>
                ${description ? `<div class="listItemBodyText secondary" style="margin-top:0.35em;font-size:0.9em;">${description}</div>` : ''}
            </div>
        `;
    }

    function buildConfigHTML(config) {
        const order = Number.isFinite(config.order) ? config.order : DEFAULTS.order;
        return `
            <div style="max-width: 640px;">
                ${buildToggleCard(
                    'wl-side-menu',
                    config.sideMenu,
                    '侧边菜单',
                    '在左侧导航抽屉中显示片单链接。'
                )}
                ${buildToggleCard(
                    'wl-top-navigation',
                    config.topNavigation !== false && config.topNavigation !== 'none',
                    '顶部导航',
                    '在主顶部导航栏中显示片单。'
                )}
                ${buildToggleCard(
                    'wl-user-menu',
                    config.userMenu,
                    '用户菜单',
                    '在用户设置菜单中显示片单链接。'
                )}
                ${buildToggleCard(
                    'wl-media-bar-button',
                    config.mediaBarButton === true,
                    '媒体栏按钮',
                    '在媒体栏 Hero 区域的“播放”旁添加一个片单按钮。默认关闭。'
                )}
                ${buildToggleCard(
                    'wl-statistics',
                    config.statistics === true,
                    '统计标签页',
                    '显示统计标签页（图表；打开时加载 Chart.js）。默认关闭。'
                )}
                ${buildToggleCard(
                    'wl-auto-remove-played',
                    config.autoRemovePlayed === true,
                    '自动移除已播放的项目',
                    '当项目被标记为已播放时，在服务器上将其从片单中移除（无需点击即写入项目的评级）。默认关闭。'
                )}
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 0.75em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">菜单顺序</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            数值越小，在侧边菜单和顶部导航中的位置越靠前。
                        </div>
                        <div class="hsae-field-wrap">
                            <input type="number" id="wl-order" class="fld emby-input"
                                min="0" step="1" value="${order}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function collectConfig() {
        const side = document.getElementById('wl-side-menu');
        const top = document.getElementById('wl-top-navigation');
        const user = document.getElementById('wl-user-menu');
        const autoRemove = document.getElementById('wl-auto-remove-played');
        const statistics = document.getElementById('wl-statistics');
        const mediaBar = document.getElementById('wl-media-bar-button');
        const orderRaw = parseInt(document.getElementById('wl-order')?.value || String(DEFAULTS.order), 10);
        return {
            sideMenu: side ? side.checked : DEFAULTS.sideMenu,
            topNavigation: top
                ? (top.checked ? 'main' : 'none')
                : DEFAULTS.topNavigation,
            userMenu: user ? user.checked : DEFAULTS.userMenu,
            order: Number.isFinite(orderRaw) ? orderRaw : DEFAULTS.order,
            autoRemovePlayed: autoRemove ? autoRemove.checked : DEFAULTS.autoRemovePlayed,
            statistics: statistics ? statistics.checked : DEFAULTS.statistics,
            mediaBarButton: mediaBar ? mediaBar.checked : DEFAULTS.mediaBarButton
        };
    }

    function attachToggleHandlers(root) {
        if (typeof window.KefinTweaksUI?.bindToggleCards === 'function') {
            window.KefinTweaksUI.bindToggleCards(root);
            return;
        }
        root.querySelectorAll('.kefin-toggle-switch').forEach((btn) => {
            if (btn.dataset.kefinToggleBound === 'true') return;
            btn.dataset.kefinToggleBound = 'true';
            btn.addEventListener('click', () => {
                const next = btn.dataset.enabled !== 'true';
                btn.dataset.enabled = String(next);
                btn.setAttribute('aria-pressed', String(next));
                const checkboxId = btn.dataset.checkboxId;
                const checkbox = checkboxId ? document.getElementById(checkboxId) : null;
                if (checkbox) checkbox.checked = next;
            });
        });
    }

    async function openConfigModal() {
        try {
            const config = await loadConfig();
            const content = document.createElement('div');
            content.innerHTML = buildConfigHTML(config);

            const footer = document.createElement('div');
            footer.style.display = 'flex';
            footer.style.gap = '0.75em';
            footer.style.justifyContent = 'flex-end';
            footer.innerHTML = `
                <button class="emby-button raised" onclick="window.ModalSystem.close('${MODAL_ID}')">关闭</button>
                <button class="emby-button raised block button-submit" id="save-watchlist-config-btn">保存</button>
            `;

            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: '片单',
                content,
                footer,
                closeOnBackdrop: true,
                closeOnEscape: true,
                showCloseButton: true,
                onOpen: (modal) => {
                    attachToggleHandlers(modal.dialogContent || content);
                    const saveBtn = modal.dialogFooter.querySelector('#save-watchlist-config-btn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', async () => {
                            const next = collectConfig();
                            const success = await saveConfig(next);
                            if (success) {
                                window.KefinTweaksToaster?.toast?.('片单配置已保存！');
                                window.ModalSystem.close(MODAL_ID);
                            } else {
                                alert('保存配置时出错。请确保已安装 JavaScript Injector 插件，并且您拥有管理员权限。');
                            }
                        });
                    }
                }
            });

            if (modalInstance?.dialog) {
                modalInstance.dialog.style.maxWidth = '90vw';
                modalInstance.dialog.style.width = '560px';
            }
            LOG('Watchlist configuration modal opened');
        } catch (error) {
            ERR('Error opening Watchlist config modal:', error);
            alert('打开配置时出错：' + error.message);
        }
    }

    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.watchlist = { openConfigModal, DEFAULTS, normalizeConfig };

    console.log('[KefinTweaks Watchlist Config] Script loaded');
})();
