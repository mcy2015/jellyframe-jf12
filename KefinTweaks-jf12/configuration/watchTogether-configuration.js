// KefinTweaks Watch Together Configuration UI

(function () {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks WatchTogether Config]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks WatchTogether Config]', ...args);

    const MODAL_ID = 'kefin-watchtogether-config';
    const DEFAULT_SESSION_TIMEOUT_MINUTES = 30;

    async function loadConfig() {
        const config = window.KefinTweaksConfig || {};
        return config.watchTogether || {};
    }

    async function saveConfig(watchTogetherConfig) {
        try {
            if (!window.KefinTweaksConfig) {
                window.KefinTweaksConfig = {};
            }
            window.KefinTweaksConfig.watchTogether = watchTogetherConfig;

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

    function buildConfigHTML(config) {
        const timeout = Number.isFinite(config.sessionTimeout * 1)
            ? config.sessionTimeout * 1
            : DEFAULT_SESSION_TIMEOUT_MINUTES;

        return `
            <div style="max-width: 640px;">
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">会话超时（分钟）</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            在一台设备上，所选的一组账户算作一次观看会话的时长。一起观看到期后不会把任何人登出：视频开始时
                            的“您正在与……一起观看”提示以及播放器中的“一起观看”按钮会显示包含哪些账户。
                            账户会保持选中状态，直到有人在那里取消勾选。
                        </div>
                        <div class="hsae-field-wrap">
                            <input type="number" id="wt-session-timeout" class="fld emby-input"
                                min="1" step="1" value="${timeout}">
                        </div>
                    </div>
                </div>
                <div class="listItem" id="wt-what-is-kept" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">一起观看的功能与数据说明</div>
                        <ul class="listItemBodyText secondary" style="margin: 0; padding-left: 1.25em; font-size: 0.9em; line-height: 1.5;">
                            <li><b>会复制的内容：</b>仅限观看记录（标记为已播放）或您在项目中的观看进度。绝不涉及收藏、片单、评分或文件夹（剧集、季）。</li>
                            <li><b>数据去向：</b>您 Jellyfin 服务器上的所选账户。不会发送到其他任何地方。</li>
                            <li><b>管理员</b>从列表中添加账户且无需密码：会使用管理员自己的会话更新另一个账户，且不会存储任何机密信息。</li>
                            <li><b>其他用户</b>使用账户的用户名和密码添加。密码仅发送到此服务器用于登录，不会被保留。服务器返回的会话令牌存储在该用户自己的 Jellyfin 配置方案（显示偏好）中，以便链接在每台设备上都能生效；移除该账户会使该会话登出。</li>
                            <li><b>此设备</b>会记住选择了哪些已关联的账户（浏览器存储，不含机密信息）。</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    function collectConfig() {
        const raw = parseInt(document.querySelector('#wt-session-timeout')?.value || String(DEFAULT_SESSION_TIMEOUT_MINUTES), 10);
        const sessionTimeout = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SESSION_TIMEOUT_MINUTES;
        return { sessionTimeout };
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
                <button class="emby-button raised block button-submit" id="save-watchtogether-config-btn">保存</button>
            `;

            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: '一起观看',
                content,
                footer,
                closeOnBackdrop: true,
                closeOnEscape: true,
                showCloseButton: true,
                onOpen: (modal) => {
                    const saveBtn = modal.dialogFooter.querySelector('#save-watchtogether-config-btn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', async () => {
                            const next = collectConfig();
                            const success = await saveConfig(next);
                            if (success) {
                                window.KefinTweaksToaster?.toast?.('一起观看配置已保存！');
                                window.ModalSystem.close(MODAL_ID);
                            } else {
                                window.KefinTweaksToaster?.toast?.('保存配置时出错。请确保已安装 JavaScript Injector 插件，并且您拥有管理员权限。', '5');
                            }
                        });
                    }
                }
            });

            if (modalInstance?.dialog) {
                modalInstance.dialog.style.maxWidth = '90vw';
                modalInstance.dialog.style.width = '560px';
            }
            LOG('Watch Together configuration modal opened');
        } catch (error) {
            ERR('Error opening Watch Together config modal:', error);
            window.KefinTweaksToaster?.toast?.('打开配置时出错：' + error.message, '5');
        }
    }

    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.watchTogether = { openConfigModal };

    console.log('[KefinTweaks WatchTogether Config] Script loaded');
})();
