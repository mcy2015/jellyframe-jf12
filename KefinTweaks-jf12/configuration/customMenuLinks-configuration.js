// KefinTweaks Custom Menu Links Configuration UI
// A list editor for the custom menu links: add, edit, reorder and delete them, with the JSON behind the list one click away.
// (jf12 fork: upstream had only the JSON box.) Save is one write of KefinTweaks-Config; a reload applies it.

(function() {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks CustomMenuLinks Config]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks CustomMenuLinks Config]', ...args);

    const MODAL_ID = 'kefin-custommenulinks-config';
    const STYLE_ID = 'kefin-cml-config-styles';

    // Material icon names that suit a menu link (any name from https://fonts.google.com/icons works; these are just suggestions)
    const ICON_SUGGESTIONS = [
        'link', 'open_in_new', 'star', 'bookmark', 'favorite', 'home', 'movie', 'theaters', 'live_tv', 'tv', 'music_note', 'library_music', 'queue_music', 'photo_library',
        'sports_esports', 'settings', 'build', 'extension', 'bolt', 'insights', 'analytics', 'dashboard', 'menu_book', 'article', 'help', 'info', 'search', 'history',
        'cloud', 'download', 'upload', 'notifications', 'person', 'group', 'public', 'language', 'explore', 'category', 'folder', 'shopping_cart', 'videocam', 'rocket_launch'
    ];

    const esc = (value) => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const NEW_LINK = () => ({ name: '', icon: 'link', url: '', sideMenu: true, topNavigation: 'none', userMenu: false });

    function normalizeTopNavigation(value) {
        const v = String(value == null ? 'none' : value).toLowerCase().trim();
        return v === 'main' || v === 'right' ? v : 'none';
    }

    /**
     * Load configuration from window.KefinTweaksConfig
     */
    async function loadConfig() {
        const config = window.KefinTweaksConfig || {};
        return {
            customMenuLinks: Array.isArray(config.customMenuLinks) ? config.customMenuLinks : [],
            options: { topDivider: !(config.customMenuLinksOptions && config.customMenuLinksOptions.topDivider === false) },
            featureOn: !!(config.scripts && config.scripts.customMenuLinks === true)
        };
    }

    /**
     * Save configuration to JS Injector (one write). The in-memory config is put back if the write fails.
     */
    async function saveConfig(customMenuLinks, options) {
        if (!window.KefinTweaksConfig) {
            window.KefinTweaksConfig = {};
        }
        const cfg = window.KefinTweaksConfig;
        const before = { links: cfg.customMenuLinks, options: cfg.customMenuLinksOptions, legacy: cfg.showCustomMenuLinksInTopNav };
        try {
            cfg.customMenuLinks = customMenuLinks;
            cfg.customMenuLinksOptions = options;
            // Placement is per-link; do not keep the legacy global top-nav flag
            delete cfg.showCustomMenuLinksInTopNav;

            let ok = false;
            if (window.KefinTweaksUtils && window.KefinTweaksUtils.saveConfigToJavaScriptInjector) {
                ok = (await window.KefinTweaksUtils.saveConfigToJavaScriptInjector()) !== false;
            } else if (window.KefinTweaksConfiguration && window.KefinTweaksConfiguration.findJavaScriptInjectorPlugin) {
                const pluginId = await window.KefinTweaksConfiguration.findJavaScriptInjectorPlugin();
                if (pluginId) {
                    await window.KefinTweaksConfiguration.saveConfigToJavaScriptInjector(cfg);
                    ok = true;
                }
            } else {
                ERR('saveConfigToJavaScriptInjector not available');
            }
            if (!ok) throw new Error('the JavaScript Injector configuration could not be written');
            LOG('Configuration saved to JS Injector');
            return true;
        } catch (error) {
            ERR('Error saving config:', error);
            cfg.customMenuLinks = before.links;
            cfg.customMenuLinksOptions = before.options;
            if (before.legacy !== undefined) cfg.showCustomMenuLinksInTopNav = before.legacy;
            return false;
        }
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
.kefin-cml { max-width: 880px; }
.kefin-cml .kefin-cml-intro { font-size: 0.9em; line-height: 1.5; margin-bottom: 0.75em; }
.kefin-cml .kefin-cml-intro code, .kefin-cml .kefin-cml-note code, .kefin-cml .kefin-cml-hint code { background: rgba(255,255,255,0.08); padding: 0 0.3em; border-radius: 3px; }
.kefin-cml .kefin-cml-warn { border: 1px solid rgba(255, 193, 7, 0.5); background: rgba(255, 193, 7, 0.08); border-radius: 6px; padding: 0.6em 0.85em; margin-bottom: 0.85em; font-size: 0.9em; }
.kefin-cml .kefin-cml-bar { display: flex; align-items: center; justify-content: space-between; gap: 0.75em; margin: 0.25em 0 0.75em; }
.kefin-cml .kefin-cml-count { font-size: 0.9em; opacity: 0.75; }
.kefin-cml .kefin-cml-row { border: 1px solid rgba(255,255,255,0.14); border-radius: 8px; padding: 0.7em 0.85em; margin-bottom: 0.75em; background: rgba(255,255,255,0.03); }
.kefin-cml .kefin-cml-row.kefin-cml-invalid { border-color: rgba(244, 67, 54, 0.85); }
.kefin-cml .kefin-cml-head { display: flex; align-items: center; gap: 0.6em; margin-bottom: 0.55em; }
.kefin-cml .kefin-cml-num { opacity: 0.6; font-size: 0.85em; min-width: 1.6em; }
.kefin-cml .kefin-cml-preview { font-size: 24px; width: 24px; height: 24px; overflow: hidden; flex: none; }
.kefin-cml .kefin-cml-preview.kefin-cml-badicon { font-size: 0; }
.kefin-cml .kefin-cml-preview.kefin-cml-badicon::after { content: "?"; font: 700 16px/24px sans-serif; opacity: 0.6; }
.kefin-cml .kefin-cml-title { flex: 1; min-width: 0; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kefin-cml .kefin-cml-tools { display: flex; gap: 0.25em; flex: none; }
.kefin-cml .kefin-cml-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; padding: 0; border: 1px solid rgba(255,255,255,0.18); border-radius: 6px; background: transparent; color: inherit; cursor: pointer; }
.kefin-cml .kefin-cml-btn:hover:not(:disabled), .kefin-cml .kefin-cml-btn:focus-visible { background: rgba(255,255,255,0.1); }
.kefin-cml .kefin-cml-btn:disabled { opacity: 0.3; cursor: default; }
.kefin-cml .kefin-cml-btn .material-icons { font-size: 20px; }
.kefin-cml .kefin-cml-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.6em 0.85em; }
.kefin-cml .kefin-cml-grid .kefin-cml-wide { grid-column: 1 / -1; }
.kefin-cml .kefin-cml-field > span { display: block; font-size: 0.85em; opacity: 0.75; margin-bottom: 0.2em; }
.kefin-cml .kefin-cml-field input.fld, .kefin-cml .kefin-cml-field select.fld { width: 100%; box-sizing: border-box; }
.kefin-cml .kefin-cml-hint { display: block; font-size: 0.8em; opacity: 0.6; margin-top: 0.2em; }
.kefin-cml .kefin-cml-opts { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35em 1.25em; margin-top: 0.65em; }
.kefin-cml .kefin-cml-opts .kefin-cml-field { display: inline-flex; align-items: center; gap: 0.5em; }
.kefin-cml .kefin-cml-opts .kefin-cml-field > span { margin: 0; }
.kefin-cml .kefin-cml-opts .checkboxContainer, .kefin-cml .kefin-cml-global .checkboxContainer { margin: 0; width: auto; flex: 0 0 auto; }
.kefin-cml .kefin-cml-opts .kefin-cml-field > span { white-space: nowrap; }
.kefin-cml a { color: inherit; text-decoration: underline; }
.kefin-cml details.kefin-cml-adv { margin-top: 0.6em; }
.kefin-cml details.kefin-cml-adv > summary { cursor: pointer; font-size: 0.85em; opacity: 0.8; }
.kefin-cml .kefin-cml-error { color: #ff8a80; font-size: 0.85em; margin-top: 0.5em; }
.kefin-cml .kefin-cml-empty { border: 1px dashed rgba(255,255,255,0.25); border-radius: 8px; padding: 1.2em; text-align: center; opacity: 0.8; margin-bottom: 0.75em; }
.kefin-cml .kefin-cml-global { border-top: 1px solid rgba(255,255,255,0.12); padding-top: 0.75em; margin-top: 0.5em; }
.kefin-cml textarea.kefin-cml-json { width: 100%; box-sizing: border-box; font-family: monospace; font-size: 0.85em; line-height: 1.5; min-height: 14em; margin-top: 0.5em; }
.kefin-cml .kefin-cml-note { font-size: 0.85em; opacity: 0.75; line-height: 1.5; margin-top: 0.6em; }
@media (max-width: 600px) { .kefin-cml .kefin-cml-grid { grid-template-columns: minmax(0, 1fr); } }
`;
        document.head.appendChild(style);
    }

    function checkbox(field, checked, label) {
        if (window.KefinTweaksUI && typeof window.KefinTweaksUI.buildCheckbox === 'function') {
            return window.KefinTweaksUI.buildCheckbox('', !!checked, label, { className: 'kefin-cml-f', dataAttributes: { f: field } });
        }
        return `<label class="checkboxContainer"><input type="checkbox" class="kefin-cml-f" data-f="${field}" ${checked ? 'checked' : ''}> <span>${esc(label)}</span></label>`;
    }

    function rowHtml(link) {
        const top = normalizeTopNavigation(link.topNavigation);
        const sideMenu = link.sideMenu !== false;
        const order = link.order != null && link.order !== '' && Number.isFinite(Number(link.order)) ? Number(link.order) : '';
        return `
            <div class="kefin-cml-row" data-row>
                <div class="kefin-cml-head">
                    <span class="kefin-cml-num" data-num></span>
                    <span class="material-icons kefin-cml-preview" data-preview aria-hidden="true">${esc(link.icon || 'link')}</span>
                    <div class="kefin-cml-title" data-title>${esc(link.name || '新链接')}</div>
                    <div class="kefin-cml-tools">
                        <button type="button" class="kefin-cml-btn" data-act="up" title="上移" aria-label="上移"><span class="material-icons" aria-hidden="true">arrow_upward</span></button>
                        <button type="button" class="kefin-cml-btn" data-act="down" title="下移" aria-label="下移"><span class="material-icons" aria-hidden="true">arrow_downward</span></button>
                        <button type="button" class="kefin-cml-btn" data-act="delete" title="删除此链接" aria-label="删除此链接"><span class="material-icons" aria-hidden="true">delete</span></button>
                    </div>
                </div>
                <div class="kefin-cml-grid">
                    <label class="kefin-cml-field"><span>名称</span><input type="text" class="fld emby-input" data-f="name" value="${esc(link.name)}" placeholder="链接显示的文字" autocomplete="off"></label>
                    <label class="kefin-cml-field"><span>图标（Material 图标名称）</span><input type="text" class="fld emby-input" data-f="icon" list="kefin-cml-icons" value="${esc(link.icon || 'link')}" placeholder="link" autocomplete="off" spellcheck="false"></label>
                    <label class="kefin-cml-field kefin-cml-wide"><span>链接</span><input type="text" class="fld emby-input" data-f="url" value="${esc(link.url)}" placeholder="#/home?tab=1  或  https://example.com" autocomplete="off" spellcheck="false">
                        <small class="kefin-cml-hint">Jellyfin 页面（<code>#/search</code>、<code>#/movies?topParentId=...</code>）或完整网址（此时请勾选“在新标签页中打开”）。</small></label>
                </div>
                <div class="kefin-cml-opts">
                    ${checkbox('openInNewTab', link.openInNewTab === true, '在新标签页中打开')}
                    ${checkbox('sideMenu', sideMenu, '侧边菜单')}
                    <label class="kefin-cml-field"><span>顶栏</span>
                        <select class="fld emby-select emby-select-withcolor" data-f="topNavigation">
                            <option value="none"${top === 'none' ? ' selected' : ''}>不在顶栏显示</option>
                            <option value="main"${top === 'main' ? ' selected' : ''}>与媒体库链接一起显示</option>
                            <option value="right"${top === 'right' ? ' selected' : ''}>图标显示在右侧</option>
                        </select></label>
                    <span data-only-main${top === 'main' ? '' : ' hidden'}>${checkbox('collapsed', link.collapsed === true, '收进“更多”')}</span>
                    ${checkbox('userMenu', link.userMenu === true, '用户菜单')}
                    ${checkbox('isAdminLink', link.isAdminLink === true, '仅管理员可见')}
                </div>
                <details class="kefin-cml-adv"${link.action || order !== '' ? ' open' : ''}>
                    <summary>更多选项</summary>
                    <div class="kefin-cml-grid" style="margin-top:0.5em;">
                        <label class="kefin-cml-field"><span>在顶栏中的位置（0 = 最前，留空 = 排在其他链接之后）</span><input type="number" min="0" step="1" class="fld emby-input" data-f="order" value="${esc(order)}"></label>
                        <label class="kefin-cml-field"><span>改为运行一个函数而不是打开链接</span><input type="text" class="fld emby-input" data-f="action" value="${esc(link.action || '')}" placeholder="MyPlugin.openDialog" autocomplete="off" spellcheck="false">
                            <small class="kefin-cml-hint"><code>window</code> 上函数的点分名称；此时上面的链接可以留空。</small></label>
                    </div>
                </details>
                <div class="kefin-cml-error" data-error role="alert" hidden></div>
            </div>
        `;
    }

    function buildConfigHTML(config) {
        return `
            <div class="kefin-cml" id="kefin-cml-root">
                <datalist id="kefin-cml-icons">${ICON_SUGGESTIONS.map((n) => `<option value="${n}"></option>`).join('')}</datalist>
                ${config.featureOn ? '' : '<div class="kefin-cml-warn" data-off-warning>自定义菜单链接在功能列表中已<strong>关闭</strong>。此处保存的链接会在开启该功能并刷新页面后显示。</div>'}
                <div class="kefin-cml-intro">
                    将您自己的链接添加到 Jellyfin 的菜单中：手机上的左侧菜单和桌面端汉堡菜单，还可以选择顶栏、右侧图标区和用户菜单。
                    图标使用 <a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer">Material 图标名称</a>。链接按此处的顺序显示。更改在刷新页面后生效。
                </div>
                <div class="kefin-cml-bar">
                    <span class="kefin-cml-count" data-count></span>
                    <button type="button" class="emby-button raised" data-act="add" style="margin:0;"><span class="material-icons" aria-hidden="true" style="vertical-align:middle;margin-right:0.25em;">add</span><span>添加链接</span></button>
                </div>
                <div data-list></div>
                <div class="kefin-cml-global">
                    ${checkbox('topDivider', config.options.topDivider !== false, '在顶栏中用一条细线分隔 Jellyfin 自身的链接与这些链接')}
                </div>
                <details class="kefin-cml-adv" data-json-box style="margin-top:0.85em;">
                    <summary>高级：以 JSON 编辑</summary>
                    <textarea class="fld emby-textarea kefin-cml-json" data-json spellcheck="false" aria-label="自定义菜单链接（JSON 格式）"></textarea>
                    <div style="display:flex;gap:0.6em;align-items:center;margin-top:0.5em;">
                        <button type="button" class="emby-button raised" data-act="apply-json" style="margin:0;"><span>将此 JSON 应用到列表</span></button>
                        <span class="kefin-cml-error" data-json-error role="alert" hidden style="margin:0;"></span>
                    </div>
                </details>
                <div class="kefin-cml-note">
                    这些链接不会写入 Jellyfin 的 <code>config.json</code>，因此不运行 jellyfin-web 的应用不会显示它们。对于这些应用，请将链接添加到 <code>config.json</code>
                    （<a href="https://jellyfin.org/docs/general/clients/web-config/#custom-menu-links" target="_blank" rel="noopener noreferrer">查看方法</a>）。Jellyfin 已经从 <code>config.json</code> 显示的同名同地址的链接不会被重复添加。
                </div>
            </div>
        `;
    }

    // ---- the list (the DOM is the model: the rows in document order are the links in saved order) ----
    function getRows(root) {
        return Array.from(root.querySelectorAll('[data-list] > [data-row]'));
    }

    function field(row, f) {
        return row.querySelector(`[data-f="${f}"]`);
    }

    function updateIconPreview(row) {
        const preview = row.querySelector('[data-preview]');
        const icon = (field(row, 'icon').value || '').trim() || 'link';
        preview.textContent = icon;
        preview.classList.remove('kefin-cml-badicon');
        // an unknown name is drawn as plain text by the icon font, far wider than one icon
        requestAnimationFrame(() => {
            if (!preview.isConnected) return;
            preview.classList.toggle('kefin-cml-badicon', /[^a-z0-9_]/.test(icon) || preview.scrollWidth > 30);
        });
    }

    function refresh(root) {
        const rows = getRows(root);
        rows.forEach((row, i) => {
            row.querySelector('[data-num]').textContent = String(i + 1);
            row.querySelector('[data-act="up"]').disabled = i === 0;
            row.querySelector('[data-act="down"]').disabled = i === rows.length - 1;
            const name = (field(row, 'name').value || '').trim();
            row.querySelector('[data-title]').textContent = name || '新链接';
            row.querySelector('[data-only-main]').hidden = field(row, 'topNavigation').value !== 'main';
        });
        const count = root.querySelector('[data-count]');
        count.textContent = rows.length === 0 ? '暂无链接' : rows.length === 1 ? '1 个链接' : `${rows.length} 个链接`;
        let empty = root.querySelector('[data-empty]');
        if (rows.length === 0 && !empty) {
            empty = document.createElement('div');
            empty.className = 'kefin-cml-empty';
            empty.setAttribute('data-empty', '');
            empty.textContent = '还没有自定义链接。点击“添加链接”创建第一个。';
            root.querySelector('[data-list]').after(empty);
        } else if (rows.length > 0 && empty) {
            empty.remove();
        }
    }

    function addRow(root, link, focus) {
        const list = root.querySelector('[data-list]');
        const tpl = document.createElement('div');
        tpl.innerHTML = rowHtml(link).trim();
        const row = tpl.firstElementChild;
        row._orig = link;                                   // fields this editor does not know about survive a save
        list.appendChild(row);
        updateIconPreview(row);
        refresh(root);
        if (focus) {
            row.scrollIntoView({ block: 'nearest' });
            const name = field(row, 'name');
            if (name) name.focus();
        }
        return row;
    }

    function isExternal(url) {
        return /^(https?:)?\/\//i.test(String(url || '').trim());
    }

    /** One row -> { link } for the saved object, or { error } when it cannot be saved. */
    function readRow(row) {
        const val = (f) => (field(row, f).value || '').trim();
        const flag = (f) => !!(field(row, f) && field(row, f).checked);
        const name = val('name'), url = val('url'), action = val('action');
        if (!name) return { error: '请为链接命名。' };
        if (!url && !action) return { error: '请为链接填写地址（或要运行的函数）。' };
        const top = normalizeTopNavigation(field(row, 'topNavigation').value);
        const orderRaw = val('order');
        const order = orderRaw === '' ? NaN : Number(orderRaw);
        const base = row._orig && typeof row._orig === 'object' ? row._orig : {};
        const out = { name, icon: val('icon') || 'link' };
        if (url) out.url = url;
        if (action) out.action = action;
        if (flag('openInNewTab')) out.openInNewTab = true;
        out.sideMenu = flag('sideMenu');
        out.topNavigation = top;
        if (top === 'main' && flag('collapsed')) out.collapsed = true;
        out.userMenu = flag('userMenu');
        if (flag('isAdminLink')) out.isAdminLink = true;
        if (Number.isFinite(order) && order >= 0) out.order = Math.floor(order);
        const known = new Set(['name', 'icon', 'url', 'action', 'openInNewTab', 'sideMenu', 'topNavigation', 'collapsed', 'userMenu', 'isAdminLink', 'order']);
        Object.keys(base).forEach((k) => { if (!known.has(k)) out[k] = base[k]; });
        return { link: out };
    }

    function collectConfig(root) {
        const links = [];
        let firstBad = null;
        getRows(root).forEach((row) => {
            const errEl = row.querySelector('[data-error]');
            const r = readRow(row);
            row.classList.toggle('kefin-cml-invalid', !!r.error);
            errEl.hidden = !r.error;
            errEl.textContent = r.error || '';
            if (r.error) { if (!firstBad) firstBad = row; } else { links.push(r.link); }
        });
        if (firstBad) return { error: firstBad };
        const dividerBox = root.querySelector('.kefin-cml-global [data-f="topDivider"]');
        return { customMenuLinks: links, options: { topDivider: dividerBox ? dividerBox.checked : true } };
    }

    // the JSON view shows whatever can be read from the rows now (unfinished rows are left out)
    function collectForJson(root) {
        return getRows(root).map((row) => readRow(row)).filter((r) => r.link).map((r) => r.link);
    }

    function applyJson(root) {
        const errEl = root.querySelector('[data-json-error]');
        try {
            const parsed = JSON.parse(root.querySelector('[data-json]').value || '[]');
            if (!Array.isArray(parsed) || parsed.some((l) => !l || typeof l !== 'object' || Array.isArray(l))) {
                throw new Error('必须是链接列表：[ { "name": "...", "url": "..." }, ... ]');
            }
            getRows(root).forEach((row) => row.remove());
            parsed.forEach((l) => addRow(root, l, false));
            refresh(root);
            errEl.hidden = true;
        } catch (err) {
            errEl.textContent = '无效：' + err.message;
            errEl.hidden = false;
        }
    }

    function bindRoot(root) {
        root.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-act]');
            if (!btn || !root.contains(btn)) return;
            const act = btn.getAttribute('data-act');
            const row = btn.closest('[data-row]');
            if (act === 'add') {
                addRow(root, NEW_LINK(), true);
            } else if (act === 'delete' && row) {
                row.remove();
                refresh(root);
            } else if (act === 'up' && row && row.previousElementSibling) {
                row.parentNode.insertBefore(row, row.previousElementSibling);
                refresh(root);
                const again = row.querySelector('[data-act="up"]:not(:disabled)') || row.querySelector('[data-act="down"]:not(:disabled)');
                if (again) again.focus();
            } else if (act === 'down' && row && row.nextElementSibling) {
                row.parentNode.insertBefore(row.nextElementSibling, row);
                refresh(root);
                const again = row.querySelector('[data-act="down"]:not(:disabled)') || row.querySelector('[data-act="up"]:not(:disabled)');
                if (again) again.focus();
            } else if (act === 'apply-json') {
                applyJson(root);
            }
        });

        root.addEventListener('input', (e) => {
            const row = e.target.closest('[data-row]');
            if (!row) return;
            const f = e.target.getAttribute('data-f');
            if (f === 'icon') updateIconPreview(row);
            if (f === 'name') refresh(root);
            if (f === 'url') {
                // a web address is a site, not a Jellyfin page: open it in a new tab unless the box was set by hand
                const box = field(row, 'openInNewTab');
                if (box && !box.dataset.touched) box.checked = isExternal(e.target.value);
            }
            row.classList.remove('kefin-cml-invalid');
            const errEl = row.querySelector('[data-error]');
            if (errEl) errEl.hidden = true;
        });

        root.addEventListener('change', (e) => {
            const row = e.target.closest('[data-row]');
            if (!row) return;
            const f = e.target.getAttribute('data-f');
            if (f === 'openInNewTab') e.target.dataset.touched = '1';
            if (f === 'topNavigation') refresh(root);
        });

        const details = root.querySelector('[data-json-box]');
        details.addEventListener('toggle', () => {
            if (!details.open) return;
            root.querySelector('[data-json]').value = JSON.stringify(collectForJson(root), null, 2);
            root.querySelector('[data-json-error]').hidden = true;
        });
    }

    function toast(message) {
        if (window.KefinTweaksToaster && window.KefinTweaksToaster.toast) {
            window.KefinTweaksToaster.toast(message);
        }
    }

    /**
     * Open configuration modal
     */
    async function openConfigModal() {
        try {
            ensureStyles();
            const config = await loadConfig();

            const content = document.createElement('div');
            content.innerHTML = buildConfigHTML(config);
            const initial = config.customMenuLinks.filter((l) => l && typeof l === 'object');

            const footer = document.createElement('div');
            footer.style.display = 'flex';
            footer.style.gap = '0.75em';
            footer.style.justifyContent = 'flex-end';
            footer.innerHTML = `
                <button class="emby-button raised" id="cancel-custommenulinks-config-btn">关闭</button>
                <button class="emby-button raised block button-submit" id="save-custommenulinks-config-btn">保存</button>
            `;

            const modalInstance = window.ModalSystem.create({
                id: MODAL_ID,
                title: '自定义菜单链接',
                content: content,
                footer: footer,
                closeOnBackdrop: false,          // a long form: a stray click outside must not throw the edits away
                closeOnEscape: true,
                showCloseButton: true,
                onOpen: (modal) => {
                    const root = modal.dialogContent.querySelector('#kefin-cml-root');
                    initial.forEach((l) => addRow(root, l, false));
                    refresh(root);
                    bindRoot(root);

                    modal.dialogFooter.querySelector('#cancel-custommenulinks-config-btn').addEventListener('click', () => window.ModalSystem.close(MODAL_ID));
                    const saveBtn = modal.dialogFooter.querySelector('#save-custommenulinks-config-btn');
                    saveBtn.addEventListener('click', async () => {
                        const collected = collectConfig(root);
                        if (collected.error) {
                            collected.error.scrollIntoView({ block: 'center' });
                            toast('部分链接未填写完整：请查看标红的链接。');
                            return;
                        }
                        saveBtn.disabled = true;
                        const success = await saveConfig(collected.customMenuLinks, collected.options);
                        saveBtn.disabled = false;
                        if (success) {
                            toast('自定义菜单链接已保存。刷新页面以查看更改。');
                            window.ModalSystem.close(MODAL_ID);
                        } else {
                            toast('无法保存。必须安装 JavaScript Injector 插件，且您必须是管理员。');
                        }
                    });
                }
            });

            if (window.innerWidth >= 900) {
                modalInstance.dialog.style.maxWidth = '90vw';
                modalInstance.dialog.style.width = '960px';
                modalInstance.dialog.style.maxHeight = '90vh';
            }

            LOG('Custom Menu Links configuration modal opened');
        } catch (error) {
            ERR('Error opening custom menu links config modal:', error);
            toast('无法打开自定义菜单链接设置：' + error.message);
        }
    }

    window.KefinTweaksFeatureConfigs = window.KefinTweaksFeatureConfigs || {};
    window.KefinTweaksFeatureConfigs.customMenuLinks = { openConfigModal };

    console.log('[KefinTweaks CustomMenuLinks Config] Script loaded');

})();
