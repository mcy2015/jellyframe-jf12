// KefinTweaks Thumbnail Scrubber Configuration UI
// Modular configuration modal for managing thumbnail scrubber settings

(function() {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks ThumbnailScrubber Config]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks ThumbnailScrubber Config]', ...args);

    const MODAL_ID = 'kefin-thumbnailscrubber-config';

    /**
     * Load configuration from window.KefinTweaksConfig
     */
    async function loadConfig() {
        const config = window.KefinTweaksConfig || {};
        return config.thumbnailScrubber || {};
    }

    /**
     * Save configuration to JS Injector
     */
    async function saveConfig(thumbnailScrubberConfig) {
        try {
            // Ensure window.KefinTweaksConfig exists
            if (!window.KefinTweaksConfig) {
                window.KefinTweaksConfig = {};
            }

            // Update thumbnailScrubber config
            window.KefinTweaksConfig.thumbnailScrubber = thumbnailScrubberConfig;

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
        const previewOnHover = config.PreviewOnHover === true;
        const useVideoStream = config.UseVideoStream !== false;
        let fallbackAfterMs = 500;
        if (Number.isFinite(config.FallbackAfterMs * 1) && config.FallbackAfterMs >= 0) {
            fallbackAfterMs = config.FallbackAfterMs * 1;
        } else if (Number.isFinite(config.FallbackAfterSeconds * 1) && config.FallbackAfterSeconds >= 0) {
            fallbackAfterMs = config.FallbackAfterSeconds * 1000;
        }
        const hoverDelay = Number.isFinite(config.HOVER_PREVIEW_TIMEOUT_MS * 1)
            ? config.HOVER_PREVIEW_TIMEOUT_MS * 1
            : (Number.isFinite(config.HOVER_TIMEOUT * 1) ? config.HOVER_TIMEOUT * 1 : 800);
        const hoverSpeed = Number.isFinite(config.HOVER_PREVIEW_FRAME_MS * 1)
            ? config.HOVER_PREVIEW_FRAME_MS * 1
            : 250;
        const scrubDelay = Number.isFinite(config.SCRUB_ACTIVATION_DELAY_MS * 1)
            ? config.SCRUB_ACTIVATION_DELAY_MS * 1
            : 300;

        return `
            <div style="max-width: 800px;">
                <div class="listItemBodyText secondary" style="margin-bottom: 1em; font-size: 0.9em; line-height: 1.4;">
                    将鼠标指向电影或集卡片底部边缘，即可像视频网站的时间线一样浏览它的进度条预览缩略图。它需要 Jellyfin 生成的 trickplay
                    图片（控制台 → 媒体库 → 您的媒体库 → 进度条预览）；没有这些图片的项目将不受影响。在触屏设备上不起作用。
                    下方的开关会添加被动预览并调整延迟。值为 0 表示“立即”。
                </div>
                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">悬停预览</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            启用后，鼠标悬停在符合条件的卡片上时，会在短暂延迟后自动循环播放 trickplay 缩略图作为卡片背景，
                            无需进入进度条区域。
                        </div>
                        <label class="checkboxContainer" style="display: flex; align-items: center; gap: 0.5em;">
                            <input type="checkbox" id="thumbnailScrubber_PreviewOnHover" ${previewOnHover ? 'checked' : ''}>
                            <span class="listItemBodyText">启用</span>
                        </label>
                    </div>
                </div>

                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">使用视频流预览</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            启用后，悬停预览将播放静音的视频流（<code>/Videos/{id}/stream</code>），
                            而不是循环播放 trickplay 图片作为卡片背景。这会让服务器为您停留的每张卡片发送部分视频文件，
                            因此在网速较慢或远程服务器上请保持关闭。
                        </div>
                        <label class="checkboxContainer" style="display: flex; align-items: center; gap: 0.5em;">
                            <input type="checkbox" id="thumbnailScrubber_UseVideoStream" ${useVideoStream ? 'checked' : ''}>
                            <span class="listItemBodyText">启用</span>
                        </label>
                    </div>
                </div>

                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">回退等待时间（毫秒）</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            当“使用视频流预览”开启时，等待直接串流开始播放多久后，
                            才回退到 trickplay 图片。
                            设为 0 可禁用超时（播放出错时仍会回退到 trickplay）。
                        </div>
                        <input type="number"
                               id="thumbnailScrubber_FallbackAfterMs"
                               class="fld emby-input"
                               min="0"
                               step="50"
                               value="${fallbackAfterMs}"
                               style="width: 120px;">
                    </div>
                </div>

                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">悬停预览延迟（毫秒）</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            光标需要在卡片上停留多久才会开始被动预览。
                            设为 0 表示悬停时立即开始。
                        </div>
                        <input type="number"
                               id="thumbnailScrubber_HOVER_PREVIEW_TIMEOUT_MS"
                               class="fld emby-input"
                               min="0"
                               step="50"
                               value="${hoverDelay}"
                               style="width: 120px;">
                    </div>
                </div>

                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">悬停预览速度（帧间隔毫秒）</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            悬停预览时每个 trickplay 帧之间的间隔（毫秒）。
                            保持 0 可使用内置速度（250 毫秒）。
                        </div>
                        <input type="number"
                               id="thumbnailScrubber_HOVER_PREVIEW_FRAME_MS"
                               class="fld emby-input"
                               min="0"
                               step="50"
                               value="${hoverSpeed}"
                               style="width: 120px;">
                    </div>
                </div>

                <div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 1em;">
                    <div class="listItemContent">
                        <div class="listItemBodyText" style="margin-bottom: 0.5em;">激活进度条预览的延迟（毫秒）</div>
                        <div class="listItemBodyText secondary" style="margin-bottom: 0.75em; font-size: 0.9em;">
                            光标需要在卡片底部的进度条区域内停留多久，
                            进度条预览界面才会激活。
                        </div>
                        <input type="number"
                               id="thumbnailScrubber_SCRUB_ACTIVATION_DELAY_MS"
                               class="fld emby-input"
                               min="0"
                               step="50"
                               value="${scrubDelay}"
                               style="width: 120px;">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Collect configuration from form
     */
    function collectConfig() {
        const previewOnHover = document.getElementById('thumbnailScrubber_PreviewOnHover')?.checked === true;
        const useVideoStream = document.getElementById('thumbnailScrubber_UseVideoStream')?.checked === true;
        const hoverDelayInput = document.getElementById('thumbnailScrubber_HOVER_PREVIEW_TIMEOUT_MS');
        const scrubDelayInput = document.getElementById('thumbnailScrubber_SCRUB_ACTIVATION_DELAY_MS');
        const hoverSpeedInput = document.getElementById('thumbnailScrubber_HOVER_PREVIEW_FRAME_MS');
        const fallbackAfterInput = document.getElementById('thumbnailScrubber_FallbackAfterMs');

        let hoverDelay = hoverDelayInput ? parseInt(hoverDelayInput.value, 10) : 800;
        if (!Number.isFinite(hoverDelay) || hoverDelay < 0) {
            hoverDelay = 800;
        }

        let scrubDelay = scrubDelayInput ? parseInt(scrubDelayInput.value, 10) : 300;
        if (!Number.isFinite(scrubDelay) || scrubDelay < 0) {
            scrubDelay = 300;
        }

        let hoverSpeed = hoverSpeedInput ? parseInt(hoverSpeedInput.value, 10) : 0;
        if (!Number.isFinite(hoverSpeed) || hoverSpeed < 0) {
            hoverSpeed = 0;
        }

        let fallbackAfterMs = fallbackAfterInput ? parseInt(fallbackAfterInput.value, 10) : 500;
        if (!Number.isFinite(fallbackAfterMs) || fallbackAfterMs < 0) {
            fallbackAfterMs = 500;
        }

        return {
            PreviewOnHover: previewOnHover,
            UseVideoStream: useVideoStream,
            FallbackAfterMs: fallbackAfterMs,
            // Delay before previewing on hover
            HOVER_PREVIEW_TIMEOUT_MS: hoverDelay,
            HOVER_TIMEOUT: hoverDelay, // legacy key
            // Hover preview speed (ms between frames)
            HOVER_PREVIEW_FRAME_MS: hoverSpeed,
            // Scrub activation delay
            SCRUB_ACTIVATION_DELAY_MS: scrubDelay
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
                <button class="emby-button raised block button-submit" id="save-thumbnailscrubber-config-btn">保存</button>
            `;

            // Create modal
            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: '进度条预览设置',
                content: content,
                footer: footer,
                closeOnBackdrop: true,
                closeOnEscape: true,
                showCloseButton: true,
                onOpen: (modal) => {
                    // Save button
                    const saveBtn = modal.dialogFooter.querySelector('#save-thumbnailscrubber-config-btn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', async () => {
                            const thumbnailScrubberConfig = collectConfig();
                            const success = await saveConfig(thumbnailScrubberConfig);
                            if (success) {
                                if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
                                    window.KefinTweaksToaster.toast('进度条预览配置已保存！');
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
                modalInstance.dialog.style.width = '800px';
                modalInstance.dialog.style.height = 'auto';
            }

            LOG('Thumbnail Scrubber configuration modal opened');
        } catch (error) {
            ERR('Error opening thumbnail scrubber config modal:', error);
            alert('打开配置时出错：' + error.message);
        }
    }

    // Export
    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.thumbnailScrubber = { openConfigModal };

    console.log('[KefinTweaks ThumbnailScrubber Config] Script loaded');

})();

