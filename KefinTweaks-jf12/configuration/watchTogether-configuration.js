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
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">Session timeout (minutes)</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            How long a choice of accounts counts as one viewing session on a device. Watch Together does not switch anyone off when it runs
                            out: the "You are watching with ..." notice when a video starts, and the Watch Together button in the player, show who is
                            included. Accounts stay selected until someone unticks them there.
                        </div>
                        <div class="hsae-field-wrap">
                            <input type="number" id="wt-session-timeout" class="fld emby-input"
                                min="1" step="1" value="${timeout}">
                        </div>
                    </div>
                </div>
                <div class="listItem" id="wt-what-is-kept" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">What Watch Together does and keeps</div>
                        <ul class="listItemBodyText secondary" style="margin: 0; padding-left: 1.25em; font-size: 0.9em; line-height: 1.5;">
                            <li><b>Copied:</b> only what was watched (marked as played) or how far you got in an item. Never favourites, the Watchlist, ratings or folders (series, seasons).</li>
                            <li><b>Where it goes:</b> to the selected accounts on your Jellyfin server. Nothing is sent anywhere else.</li>
                            <li><b>Administrators</b> add accounts from a list and need no password: the other account is updated with the administrator's own session, and nothing secret is stored.</li>
                            <li><b>Other users</b> add an account with its username and password. The password goes to this server to sign in and is not kept. The session token the server returns is stored in that person's own Jellyfin profile (display preferences) so the link works on every device; removing the account signs that session out.</li>
                            <li><b>This device</b> remembers which linked accounts are selected (browser storage, no secrets).</li>
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
                <button class="emby-button raised" onclick="window.ModalSystem.close('${MODAL_ID}')">Close</button>
                <button class="emby-button raised block button-submit" id="save-watchtogether-config-btn">Save</button>
            `;

            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: 'Watch Together',
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
                                window.KefinTweaksToaster?.toast?.('Watch Together configuration saved!');
                                window.ModalSystem.close(MODAL_ID);
                            } else {
                                window.KefinTweaksToaster?.toast?.('Error saving configuration. Please ensure the JavaScript Injector plugin is installed and you have administrator permissions.', '5');
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
            window.KefinTweaksToaster?.toast?.('Error opening configuration: ' + error.message, '5');
        }
    }

    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.watchTogether = { openConfigModal };

    console.log('[KefinTweaks WatchTogether Config] Script loaded');
})();
