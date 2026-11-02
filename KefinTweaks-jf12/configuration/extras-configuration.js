// KefinTweaks jf12 fork: the settings panels of Request it (Seerr), Media Info Badges and Kids Mode (one small module for the three).
// Each panel edits its own object of KefinTweaksConfig and saves the KefinTweaks-Config entry once (KefinTweaksUtils.saveConfigToJavaScriptInjector).
(function () {
    'use strict';
    const ERR = (...a) => console.error('[KefinTweaks Extras Config]', ...a);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const box = (inner) => `<div class="listItem" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 0.75em; margin-bottom: 0.75em;"><div class="listItemContent" style="width: 100%;">${inner}</div></div>`;
    const check = (id, on, label, help) => box(`<label class="checkboxContainer" style="display: flex; align-items: center; gap: 0.5em;"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span class="listItemBodyText">${label}</span></label>${help ? `<div class="listItemBodyText secondary" style="font-size: 0.9em; margin-top: 0.4em;">${help}</div>` : ''}`);
    const val = (id) => document.getElementById(id);

    // Kids Mode's automatic answer for a user (the same rule as scripts/kidsMode.js, which may not be loaded on this page)
    const autoKid = (u) => { const p = u.Policy || {}; return !p.IsAdministrator && (p.EnableAllFolders === false || (p.MaxParentalRating !== null && p.MaxParentalRating !== undefined)) };

    const PANELS = {
        requestSeerr: {
            title: '影片请求（Seerr）',
            async html(c) {
                return box(`<div class="listItemBodyText" style="margin-bottom: 0.4em;">Seerr 地址</div>
                    <input type="url" id="kx_seerr_url" class="emby-input" style="width: 100%;" placeholder="https://seerr.example.com" value="${esc(c.url)}">
                    <div class="listItemBodyText secondary" style="font-size: 0.9em; margin-top: 0.4em;">用户打开 Seerr / Jellyseerr / Overseerr 的地址。按钮只是跳转到那里（新标签页）；KefinTweaks 自身不会调用 Seerr。</div>`) +
                    check('kx_seerr_search', c.onSearch !== false, '搜索结果为空或很少时', '用相同的关键词打开 Seerr 的搜索页。') +
                    check('kx_seerr_item', c.onItem !== false, '在没有媒体的项目上', '缺失的集和电影，以及合集（“请求其余部分”）。');
            },
            collect() {
                const url = val('kx_seerr_url').value.trim().replace(/\/+$/, '');
                if (url && !/^https?:\/\/[^\s/]+/i.test(url)) throw new Error('Seerr 地址必须以 http:// 或 https:// 开头');
                return { url, onSearch: val('kx_seerr_search').checked, onItem: val('kx_seerr_item').checked };
            }
        },
        mediaBadges: {
            title: '媒体信息徽章',
            async html(c) {
                return check('kx_mb_res', c.resolution !== false, '分辨率（4K、1080p、720p、SD）') +
                    check('kx_mb_hdr', c.hdr !== false, 'HDR 和杜比视界') +
                    check('kx_mb_audio', c.audio !== false, '音频（Atmos、TrueHD、DD+、DTS……以及 5.1 / 7.1）');
            },
            collect() { return { resolution: val('kx_mb_res').checked, hdr: val('kx_mb_hdr').checked, audio: val('kx_mb_audio').checked } }
        },
        kidsMode: {
            title: '儿童模式',
            async html(c) {
                const users = await ApiClient.getUsers().catch(() => []);
                const forced = c.users || {};
                const rows = users.map((u) => {
                    const f = forced[u.Id] || 'auto', auto = autoKid(u);
                    const opt = (v, t) => `<option value="${v}" ${f === v ? 'selected' : ''}>${t}</option>`;
                    return `<div style="display: flex; align-items: center; gap: 1em; padding: 0.35em 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <span class="listItemBodyText" style="flex: 1;">${esc(u.Name)}</span>
                        <select class="emby-select-withcolor emby-select kx-kid" data-user="${esc(u.Id)}" style="width: auto;">${opt('auto', '自动：' + (auto ? '开' : '关'))}${opt('on', '始终开启')}${opt('off', '始终关闭')}</select></div>`;
                }).join('');
                return box(`<div class="listItemBodyText secondary" style="font-size: 0.9em; margin-bottom: 0.6em;">自动 = 对被 Jellyfin 限制为部分媒体库或设有最高家长分级（在控制台 &gt; 用户 &gt; 访问/家长控制中设置）的用户开启，管理员从不自动开启。</div>${rows || '<div class="listItemBodyText">无法列出用户。</div>'}`);
            },
            collect() {
                const users = {};
                document.querySelectorAll('.kx-kid').forEach((s) => { if (s.value !== 'auto') users[s.dataset.user] = s.value });
                return { users };
            }
        }
    };

    async function openConfigModal(key) {
        const panel = PANELS[key], id = 'kefin-extras-config-' + key;
        try {
            const content = document.createElement('div');
            content.style.maxWidth = '800px';
            content.innerHTML = await panel.html((window.KefinTweaksConfig || {})[key] || {});
            const footer = document.createElement('div');
            footer.style.cssText = 'display: flex; gap: 0.75em; justify-content: flex-end;';
            footer.innerHTML = `<button class="emby-button raised" data-kx-close>关闭</button><button class="emby-button raised block button-submit" data-kx-save>保存</button>`;
            window.ModalSystem.create({
                id, title: panel.title + ' 设置', content, footer, closeOnBackdrop: true, closeOnEscape: true, showCloseButton: true,
                onOpen: (modal) => {
                    modal.dialogFooter.querySelector('[data-kx-close]').addEventListener('click', () => window.ModalSystem.close(id));
                    modal.dialogFooter.querySelector('[data-kx-save]').addEventListener('click', async () => {
                        let value;
                        try { value = panel.collect() } catch (e) { alert(e.message); return }
                        window.KefinTweaksConfig = window.KefinTweaksConfig || {};
                        window.KefinTweaksConfig[key] = value;
                        try {
                            await window.KefinTweaksUtils.saveConfigToJavaScriptInjector();
                            window.KefinTweaksToaster?.toast?.('配置已保存！');
                            window.ModalSystem.close(id);
                        } catch (e) {
                            ERR('save failed', e);
                            alert('保存配置时出错。请确保已安装 JavaScript Injector 插件，并且您拥有管理员权限。');
                        }
                    });
                }
            });
        } catch (e) {
            ERR('could not open', key, e);
            alert('打开配置时出错：' + e.message);
        }
    }

    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    for (const key of Object.keys(PANELS)) window.KefinTweaksFeatureConfigs[key] = { openConfigModal: () => openConfigModal(key) };
})();
