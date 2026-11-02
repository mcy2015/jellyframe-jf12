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
            title: 'Request it (Seerr)',
            async html(c) {
                return box(`<div class="listItemBodyText" style="margin-bottom: 0.4em;">Seerr address</div>
                    <input type="url" id="kx_seerr_url" class="emby-input" style="width: 100%;" placeholder="https://seerr.example.com" value="${esc(c.url)}">
                    <div class="listItemBodyText secondary" style="font-size: 0.9em; margin-top: 0.4em;">The address people open Seerr / Jellyseerr / Overseerr at. The button only links there (a new tab); KefinTweaks never calls Seerr itself.</div>`) +
                    check('kx_seerr_search', c.onSearch !== false, 'On searches that find nothing or little', 'Opens Seerr\'s search with the same words.') +
                    check('kx_seerr_item', c.onItem !== false, 'On items without media', 'Missing episodes and movies, and collections ("request the rest").');
            },
            collect() {
                const url = val('kx_seerr_url').value.trim().replace(/\/+$/, '');
                if (url && !/^https?:\/\/[^\s/]+/i.test(url)) throw new Error('The Seerr address must start with http:// or https://');
                return { url, onSearch: val('kx_seerr_search').checked, onItem: val('kx_seerr_item').checked };
            }
        },
        mediaBadges: {
            title: 'Media Info Badges',
            async html(c) {
                return check('kx_mb_res', c.resolution !== false, 'Resolution (4K, 1080p, 720p, SD)') +
                    check('kx_mb_hdr', c.hdr !== false, 'HDR and Dolby Vision') +
                    check('kx_mb_audio', c.audio !== false, 'Audio (Atmos, TrueHD, DD+, DTS... and 5.1 / 7.1)');
            },
            collect() { return { resolution: val('kx_mb_res').checked, hdr: val('kx_mb_hdr').checked, audio: val('kx_mb_audio').checked } }
        },
        kidsMode: {
            title: 'Kids Mode',
            async html(c) {
                const users = await ApiClient.getUsers().catch(() => []);
                const forced = c.users || {};
                const rows = users.map((u) => {
                    const f = forced[u.Id] || 'auto', auto = autoKid(u);
                    const opt = (v, t) => `<option value="${v}" ${f === v ? 'selected' : ''}>${t}</option>`;
                    return `<div style="display: flex; align-items: center; gap: 1em; padding: 0.35em 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <span class="listItemBodyText" style="flex: 1;">${esc(u.Name)}</span>
                        <select class="emby-select-withcolor emby-select kx-kid" data-user="${esc(u.Id)}" style="width: auto;">${opt('auto', 'Automatic: ' + (auto ? 'on' : 'off'))}${opt('on', 'Always on')}${opt('off', 'Always off')}</select></div>`;
                }).join('');
                return box(`<div class="listItemBodyText secondary" style="font-size: 0.9em; margin-bottom: 0.6em;">Automatic = on for users that Jellyfin limits to some libraries or to a maximum parental rating (set in Dashboard &gt; Users &gt; Access / Parental control), never for administrators.</div>${rows || '<div class="listItemBodyText">No users could be listed.</div>'}`);
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
            footer.innerHTML = `<button class="emby-button raised" data-kx-close>Close</button><button class="emby-button raised block button-submit" data-kx-save>Save</button>`;
            window.ModalSystem.create({
                id, title: panel.title + ' Configuration', content, footer, closeOnBackdrop: true, closeOnEscape: true, showCloseButton: true,
                onOpen: (modal) => {
                    modal.dialogFooter.querySelector('[data-kx-close]').addEventListener('click', () => window.ModalSystem.close(id));
                    modal.dialogFooter.querySelector('[data-kx-save]').addEventListener('click', async () => {
                        let value;
                        try { value = panel.collect() } catch (e) { alert(e.message); return }
                        window.KefinTweaksConfig = window.KefinTweaksConfig || {};
                        window.KefinTweaksConfig[key] = value;
                        try {
                            await window.KefinTweaksUtils.saveConfigToJavaScriptInjector();
                            window.KefinTweaksToaster?.toast?.('Configuration saved!');
                            window.ModalSystem.close(id);
                        } catch (e) {
                            ERR('save failed', e);
                            alert('Error saving configuration. Please ensure the JavaScript Injector plugin is installed and you have administrator permissions.');
                        }
                    });
                }
            });
        } catch (e) {
            ERR('could not open', key, e);
            alert('Error opening configuration: ' + e.message);
        }
    }

    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    for (const key of Object.keys(PANELS)) window.KefinTweaksFeatureConfigs[key] = { openConfigModal: () => openConfigModal(key) };
})();
