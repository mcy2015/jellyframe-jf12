// KefinTweaks User Manager — dashboard hooks for user templates

(function () {
    'use strict';

    const LOG = (...args) => console.log('[KefinTweaks UserManager]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks UserManager]', ...args);
    const WARN = (...args) => console.warn('[KefinTweaks UserManager]', ...args);

    const BULK_MODAL_ID = 'kefin-usermanager-bulk';
    const NONE = 'None';
    const MARKER_ADD = 'data-um-add-injected';
    const MARKER_BULK = 'data-um-bulk-injected';

    function clonePolicy(policy) {
        if (window.KefinUserManagerConfig?.clonePolicy) {
            return window.KefinUserManagerConfig.clonePolicy(policy);
        }
        return JSON.parse(JSON.stringify(policy ?? {}));
    }

    function loadConfig() {
        if (window.KefinUserManagerConfig?.loadConfig) {
            return window.KefinUserManagerConfig.loadConfig();
        }
        const raw = window.KefinTweaksConfig?.userManager || {};
        return {
            defaultTemplateName: raw.defaultTemplateName || '',
            templates: Array.isArray(raw.templates) ? raw.templates : []
        };
    }

    function getAuthHeader() {
        return window.apiHelper?.getAuthHeader?.() || '';
    }

    async function apiJson(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: getAuthHeader(),
                Accept: 'application/json',
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...(options.headers || {})
            }
        });
        if (!response.ok) {
            let detail = `${response.status}`;
            try {
                const body = await response.json();
                detail = body?.message || body?.Message || detail;
            } catch (_) {
                try {
                    const text = await response.text();
                    if (text) detail = text;
                } catch (__) { /* ignore */ }
            }
            throw new Error(detail);
        }
        if (response.status === 204) return null;
        const text = await response.text();
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch (_) {
            return text;
        }
    }

    async function createUser(name, password) {
        const url = ApiClient.getUrl('Users/New');
        return apiJson(url, {
            method: 'POST',
            body: JSON.stringify({ Name: name, Password: password })
        });
    }

    async function applyPolicy(userId, policy) {
        const url = ApiClient.getUrl(`Users/${userId}/Policy`);
        return apiJson(url, {
            method: 'POST',
            body: JSON.stringify(policy)
        });
    }

    async function deleteUser(userId) {
        return apiJson(ApiClient.getUrl(`Users/${userId}`), { method: 'DELETE' });
    }

    // jf12: a template manages exactly the settings the template editor shows. Everything else in a user's policy stays as the user has it:
    // how they sign in (AuthenticationProviderId / PasswordResetProviderId: replacing them would lock out an LDAP or SSO user), the devices and
    // channels they may use (the editor has no control for them) and the failed-login counter. The previous code POSTed the whole template policy.
    const TEMPLATE_FIELDS = {
        IsAdministrator: 'Administrator',
        IsHidden: 'Hidden from login screens',
        IsDisabled: 'Account disabled',
        EnableCollectionManagement: 'Manage collections',
        EnableSubtitleManagement: 'Edit subtitles',
        EnableLyricManagement: 'Manage lyrics',
        EnableUserPreferenceAccess: 'Change own preferences',
        EnableRemoteAccess: 'Remote connections',
        EnableRemoteControlOfOtherUsers: 'Remote control of other users',
        EnableSharedDeviceControl: 'Remote control of shared devices',
        EnableLiveTvAccess: 'Live TV access',
        EnableLiveTvManagement: 'Live TV recording management',
        EnableMediaPlayback: 'Media playback',
        EnableAudioPlaybackTranscoding: 'Audio transcoding',
        EnableVideoPlaybackTranscoding: 'Video transcoding',
        EnablePlaybackRemuxing: 'Remuxing',
        ForceRemoteSourceTranscoding: 'Force transcoding of remote sources',
        EnableSyncTranscoding: 'Sync transcoding',
        EnableMediaConversion: 'Media conversion',
        EnableContentDownloading: 'Media downloads',
        EnableContentDeletion: 'Delete media from all libraries',
        EnableContentDeletionFromFolders: 'Delete media from',
        EnableAllFolders: 'Access to all libraries',
        EnabledFolders: 'Libraries',
        BlockUnratedItems: 'Blocked unrated items',
        BlockedTags: 'Blocked tags',
        AllowedTags: 'Allowed tags',
        AccessSchedules: 'Access schedule',
        LoginAttemptsBeforeLockout: 'Failed logins before lockout',
        MaxActiveSessions: 'Simultaneous sessions',
        EnablePublicSharing: 'Public sharing',
        RemoteClientBitrateLimit: 'Internet streaming bitrate limit',
        SyncPlayAccess: 'SyncPlay'
    };

    /** The policy a user ends up with: their current one, with the template's settings on top. */
    function mergePolicy(current, templatePolicy) {
        const next = clonePolicy(current);
        Object.keys(TEMPLATE_FIELDS).forEach((key) => {
            if (templatePolicy && Object.prototype.hasOwnProperty.call(templatePolicy, key)) {
                next[key] = JSON.parse(JSON.stringify(templatePolicy[key]));
            }
        });
        return next;
    }

    function formatSchedule(s) {
        const hour = (h) => {
            const n = Number(h);
            if (n === 24) return '12:00 AM';
            return `${Math.floor(n) % 12 || 12}:${n % 1 ? '30' : '00'} ${n < 12 ? 'AM' : 'PM'}`;
        };
        return `${s.DayOfWeek} ${hour(s.StartHour)}-${hour(s.EndHour)}`;
    }

    function formatPolicyValue(key, value, folderNames) {
        if (typeof value === 'boolean') return value ? 'On' : 'Off';
        if (key === 'RemoteClientBitrateLimit') return Number(value) > 0 ? `${Math.round(Number(value) / 10000) / 100} Mbps` : 'No limit';
        if (key === 'LoginAttemptsBeforeLockout') return Number(value) === -1 ? 'Never locked out' : Number(value) === 0 ? 'Server default' : String(value);
        if (key === 'MaxActiveSessions') return Number(value) > 0 ? String(value) : 'No limit';
        if (key === 'AccessSchedules') return Array.isArray(value) && value.length ? value.map(formatSchedule).join(', ') : 'None';
        if (Array.isArray(value)) {
            if (!value.length) return 'None';
            return value.map((v) => (folderNames && folderNames[v]) || v).join(', ');
        }
        return value == null || value === '' ? 'None' : String(value);
    }

    /** What would change in a policy: [{ key, label, before, after }] for the fields a template manages. */
    function diffPolicy(current, next, folderNames) {
        const rows = [];
        Object.keys(TEMPLATE_FIELDS).forEach((key) => {
            const a = current ? current[key] : undefined;
            const b = next[key];
            if (b === undefined) return;
            // which libraries are listed does not matter while all libraries are allowed
            if ((key === 'EnabledFolders' && next.EnableAllFolders && (!current || current.EnableAllFolders))
                || (key === 'EnableContentDeletionFromFolders' && next.EnableContentDeletion && (!current || current.EnableContentDeletion))) return;
            const same = JSON.stringify(Array.isArray(a) ? [...a].sort() : a) === JSON.stringify(Array.isArray(b) ? [...b].sort() : b);
            if (same) return;
            rows.push({ key, label: TEMPLATE_FIELDS[key], before: formatPolicyValue(key, a, folderNames), after: formatPolicyValue(key, b, folderNames) });
        });
        return rows;
    }

    /** Things a template must never do to the account that is applying it. null when fine. */
    function selfProblem(user, current, next) {
        if (user.Id !== ApiClient.getCurrentUserId()) return null;
        if (current.IsAdministrator && !next.IsAdministrator) return 'This would remove your own administrator rights, so it is skipped.';
        if (!current.IsDisabled && next.IsDisabled) return 'This would disable your own account, so it is skipped.';
        return null;
    }

    async function fetchFolderNames() {
        try {
            const data = await apiJson(ApiClient.getUrl('Library/MediaFolders'), { method: 'GET' });
            const items = Array.isArray(data?.Items) ? data.Items : (Array.isArray(data) ? data : []);
            return Object.fromEntries(items.map((f) => [f.Id, f.Name]));
        } catch (e) {
            WARN('Could not load the library names', e);
            return {};
        }
    }

    async function fetchUsers() {
        if (typeof ApiClient?.getUsers === 'function') {
            const users = await ApiClient.getUsers();
            return Array.isArray(users) ? users : [];
        }
        const users = await apiJson(ApiClient.getUrl('Users'), { method: 'GET' });
        return Array.isArray(users) ? users : [];
    }

    function toast(msg) {
        window.KefinTweaksToaster?.toast?.(msg);
    }

    function isAddUserPage(hash) {
        const h = hash || window.location.hash || '';
        return /\/dashboard\/users\/usernew\b/i.test(h) || /\/dashboard\/users\/add\b/i.test(h);
    }

    function isUsersListPage(hash) {
        const h = hash || window.location.hash || '';
        if (isAddUserPage(h)) return false;
        if (/\/dashboard\/users\/user\b/i.test(h)) return false;
        return /\/dashboard\/users\/?(\?|$|#|$)/i.test(h) || /#\/dashboard\/users\/?$/i.test(h);
    }

    function getNewUserPage() {
        return document.querySelector('#newUserPage')
            || document.querySelector('.newUserPage')
            || document.querySelector('[data-role="page"].newUserPage');
    }

    function waitForElement(getter, timeoutMs = 8000, intervalMs = 100) {
        return new Promise((resolve) => {
            const start = Date.now();
            const tick = () => {
                const el = getter();
                if (el) {
                    resolve(el);
                    return;
                }
                if (Date.now() - start >= timeoutMs) {
                    resolve(null);
                    return;
                }
                setTimeout(tick, intervalMs);
            };
            tick();
        });
    }

    function getTemplateOptionsHtml(config, includeNone) {
        const names = (config.templates || []).map((t) => t.name);
        const options = [];
        if (includeNone) {
            options.push(`<option value="${NONE}">${NONE}</option>`);
        }
        names.forEach((name) => {
            options.push(`<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`);
        });
        return options.join('');
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(str) {
        return escapeHtml(str).replace(/'/g, '&#39;');
    }

    function findNativeSaveButton(page) {
        return page.querySelector('.newUserProfileForm .emby-button.button-submit:not(.um-kefin-save)')
            || page.querySelector('form .emby-button.button-submit:not(.um-kefin-save)')
            || page.querySelector('.button-submit:not(.um-kefin-save)');
    }

    function updateSaveVisibility(page, templateName) {
        const useTemplate = templateName && templateName !== NONE;
        page.setAttribute('data-user-template', useTemplate ? templateName : NONE);

        const nativeSave = findNativeSaveButton(page);
        const kefinSave = page.querySelector('.um-kefin-save');
        if (nativeSave) {
            nativeSave.style.display = useTemplate ? 'none' : '';
        }
        if (kefinSave) {
            kefinSave.style.display = useTemplate ? '' : 'none';
        }
    }

    async function handleKefinSave(page) {
        const select = page.querySelector('#um-template-select');
        const templateName = select?.value || NONE;
        if (templateName === NONE) return;

        const config = loadConfig();
        const template = config.templates.find((t) => t.name === templateName);
        if (!template?.policy) {
            toast('Selected template was not found');
            return;
        }

        const nameInput = page.querySelector('#txtUsername')
            || page.querySelector('input[type="text"]');
        const passwordInput = page.querySelector('#txtPassword')
            || page.querySelector('input[type="password"]');
        const name = (nameInput?.value || '').trim();
        const password = passwordInput?.value || '';

        if (!name) {
            toast('Username is required');
            nameInput?.focus();
            return;
        }

        const kefinSave = page.querySelector('.um-kefin-save');
        if (kefinSave) kefinSave.disabled = true;

        let created = null;
        try {
            created = await createUser(name, password);
            const userId = created?.Id || created?.id;
            if (!userId) throw new Error('User created but no Id returned');

            // the template on top of what the server gave the new account (its sign-in settings stay as they are)
            const base = created.Policy || (await apiJson(ApiClient.getUrl(`Users/${userId}`), { method: 'GET' }))?.Policy || {};
            const policy = mergePolicy(base, template.policy);
            try {
                await applyPolicy(userId, policy);
            } catch (first) {
                WARN('Applying the template failed, trying once more', first);
                await applyPolicy(userId, policy);
            }
            toast(`User "${name}" created with template "${templateName}"`);
            window.location.hash = '#/dashboard/users';
        } catch (e) {
            ERR('Failed to create user with template', e);
            const createdId = created?.Id || created?.id;
            if (createdId) {
                // The account exists with the server's default access (every library). Do not leave it behind half set up.
                try {
                    await deleteUser(createdId);
                    toast(`Could not apply template "${templateName}" (${e.message || e}). The new user was not kept.`);
                } catch (removeError) {
                    ERR('Could not remove the half-configured user', removeError);
                    toast(`User "${name}" was created, but template "${templateName}" could not be applied. Check their access under Users.`);
                }
            } else {
                toast(`Failed to create user: ${e.message || e}`);
            }
        } finally {
            if (kefinSave) kefinSave.disabled = false;
        }
    }

    async function injectAddUserPage() {
        const page = await waitForElement(getNewUserPage);
        if (!page) {
            WARN('New user page not found');
            return;
        }
        if (page.getAttribute(MARKER_ADD) === '1') {
            // Refresh template options in case config changed
            refreshAddUserTemplateSelect(page);
            return;
        }

        const passwordField = await waitForElement(() =>
            page.querySelector('#txtPassword')
            || page.querySelector('input[type="password"]')
        );
        if (!passwordField) {
            WARN('Password field not found on new user page');
            return;
        }

        const config = loadConfig();
        const defaultName = config.defaultTemplateName && config.templates.some((t) => t.name === config.defaultTemplateName)
            ? config.defaultTemplateName
            : NONE;

        const templatesContainer = document.createElement('div');
        templatesContainer.className = 'um-template-field inputContainer';
        templatesContainer.innerHTML = `
            <div class="um-template-field-row">
                <div class="selectContainer">
                    <label class="selectLabel" for="um-template-select">Template</label>
                    <select is="emby-select" id="um-template-select" class="emby-select-withcolor emby-select">
                        ${getTemplateOptionsHtml(config, true)}
                    </select>
                </div>
            </div>
        `;

        const editTemplatesContainer = document.createElement('div');
        editTemplatesContainer.className = 'um-template-field inputContainer';
        editTemplatesContainer.innerHTML = `
            <div class="um-template-field-row">
                <button type="button" class="emby-button raised um-edit-templates-btn block" title="Edit Templates">
                    Edit Templates
                </button>
            </div>
        `;

        const passwordContainer = passwordField.closest('.inputContainer') || passwordField.parentElement;
        if (passwordContainer?.parentElement) {
            passwordContainer.parentElement.insertBefore(templatesContainer, passwordContainer.nextSibling);
            passwordContainer.parentElement.insertBefore(editTemplatesContainer, templatesContainer.nextSibling);
        } else {
            passwordField.insertAdjacentElement('afterend', templatesContainer);
            passwordField.insertAdjacentElement('afterend', editTemplatesContainer);
        }

        const select = templatesContainer.querySelector('#um-template-select');
        if (select) {
            select.value = defaultName;
            if (![...select.options].some((o) => o.value === defaultName)) {
                select.value = NONE;
            }
        }

        editTemplatesContainer.querySelector('.um-edit-templates-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.KefinUserManagerConfig?.openConfigModal) {
                window.KefinUserManagerConfig.openConfigModal();
            } else if (window.KefinTweaksFeatureConfigs?.userManager?.openConfigModal) {
                window.KefinTweaksFeatureConfigs.userManager.openConfigModal();
            } else {
                toast('User Manager configuration is not available');
            }
        });

        select?.addEventListener('change', () => {
            updateSaveVisibility(page, select.value || NONE);
        });

        // Kefin Save button next to native submit
        const nativeSave = await waitForElement(() => findNativeSaveButton(page), 5000);
        const kefinSave = document.createElement('button');
        kefinSave.type = 'button';
        kefinSave.className = 'raised button-submit block emby-button um-kefin-save';
        kefinSave.textContent = 'Save';
        kefinSave.style.display = 'none';
        kefinSave.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleKefinSave(page);
        });

        if (nativeSave?.parentElement) {
            nativeSave.parentElement.insertBefore(kefinSave, nativeSave.nextSibling);
        } else {
            const form = page.querySelector('form') || page;
            form.appendChild(kefinSave);
        }

        // Enter in the name or password field submits the form through its (hidden) native Save button, which would create the user WITHOUT the
        // template the page shows as selected. With a template chosen, the form submits through our own Save instead.
        page.addEventListener('submit', (e) => {
            const chosen = page.querySelector('#um-template-select')?.value || NONE;
            if (chosen === NONE) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            handleKefinSave(page);
        }, true);

        select?.addEventListener('change', () => updateTemplateNote(page, select.value || NONE));
        updateTemplateNote(page, select?.value || NONE);

        page.setAttribute(MARKER_ADD, '1');
        updateSaveVisibility(page, select?.value || NONE);
        LOG('Injected template controls on add-user page');
    }

    /** One line under the Template select: what a new user gets. Administrator rights are called out. */
    function updateTemplateNote(page, templateName) {
        let note = page.querySelector('.um-template-note');
        const field = page.querySelector('.um-template-field');
        if (!field) return;
        if (!note) {
            note = document.createElement('div');
            note.className = 'um-template-note fieldDescription';
            field.appendChild(note);
        }
        const template = templateName && templateName !== NONE ? loadConfig().templates.find((t) => t.name === templateName) : null;
        if (!template?.policy) {
            note.textContent = '';
            note.style.display = 'none';
            return;
        }
        const p = template.policy;
        const parts = [
            p.IsAdministrator ? 'Administrator (full control of the server)' : 'Not an administrator',
            p.EnableAllFolders ? 'all libraries' : `${(p.EnabledFolders || []).length} librar${(p.EnabledFolders || []).length === 1 ? 'y' : 'ies'}`,
            ...(p.IsDisabled ? ['account disabled'] : [])
        ];
        note.textContent = `This template gives the new user: ${parts.join(', ')}.`;
        note.classList.toggle('um-template-note-admin', !!p.IsAdministrator);
        note.style.display = '';
    }

    function refreshAddUserTemplateSelect(page) {
        const select = page.querySelector('#um-template-select');
        if (!select) return;
        const prev = select.value;
        const config = loadConfig();
        select.innerHTML = getTemplateOptionsHtml(config, true);
        if ([...select.options].some((o) => o.value === prev)) {
            select.value = prev;
        } else if (config.defaultTemplateName && [...select.options].some((o) => o.value === config.defaultTemplateName)) {
            select.value = config.defaultTemplateName;
        } else {
            select.value = NONE;
        }
        updateSaveVisibility(page, select.value || NONE);
        updateTemplateNote(page, select.value || NONE);
    }

    async function openBulkEditor() {
        if (!window.ModalSystem?.create) {
            toast('Modal system not available');
            return;
        }

        const config = loadConfig();
        if (!config.templates.length) {
            toast('Create a template first: KefinTweaks configuration > User Manager');
            return;
        }

        let users = [];
        try {
            users = await fetchUsers();
        } catch (e) {
            ERR('Failed to load users', e);
            toast(`Failed to load users: ${e.message || e}`);
            return;
        }

        users = users
            .filter((u) => u?.Id && u.Name)
            .sort((a, b) => String(a.Name).localeCompare(String(b.Name), undefined, { sensitivity: 'base' }));
        const myId = ApiClient.getCurrentUserId();

        const defaultTemplate = config.defaultTemplateName && config.templates.some((t) => t.name === config.defaultTemplateName)
            ? config.defaultTemplateName
            : config.templates[0].name;

        const content = document.createElement('div');
        content.className = 'um-bulk-root';
        const selectStep = document.createElement('div');
        selectStep.className = 'um-bulk-select-step';
        selectStep.innerHTML = `
            <div class="selectContainer">
                <label class="selectLabel" for="um-bulk-template">Template</label>
                <select is="emby-select" id="um-bulk-template" class="emby-select-withcolor emby-select">
                    ${getTemplateOptionsHtml(config, false)}
                </select>
            </div>
            <div class="um-bulk-toolbar">
                <button type="button" class="emby-button raised" id="um-bulk-select-all">Select all</button>
                <button type="button" class="emby-button raised" id="um-bulk-select-none">Select none</button>
            </div>
            <div class="um-bulk-user-list">
                ${users.map((u) => `
                    <label class="um-bulk-user-item">
                        <input type="checkbox" class="um-bulk-user-check" value="${escapeAttr(u.Id)}" data-name="${escapeAttr(u.Name)}" />
                        <span>${escapeHtml(u.Name)}${u.Id === myId ? ' (you)' : ''}${u.Policy?.IsAdministrator ? ' <span class="um-bulk-tag">administrator</span>' : ''}</span>
                    </label>
                `).join('') || '<div style="padding:0.75em;opacity:0.7;">No users found</div>'}
            </div>
            <div class="fieldDescription">Nothing is changed yet: the next step shows what would change for each account.</div>
        `;
        const reviewStep = document.createElement('div');
        reviewStep.className = 'um-bulk-review-step';
        reviewStep.style.display = 'none';
        const statusEl = document.createElement('div');
        statusEl.className = 'um-bulk-status';
        statusEl.id = 'um-bulk-status';
        content.append(selectStep, reviewStep, statusEl);

        const templateSelect = selectStep.querySelector('#um-bulk-template');
        if (templateSelect) templateSelect.value = defaultTemplate;

        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex;gap:0.75em;justify-content:flex-end;flex-wrap:wrap;';
        footer.innerHTML = `
            <button type="button" class="emby-button raised" id="um-bulk-cancel">Cancel</button>
            <button type="button" class="emby-button raised" id="um-bulk-back" style="display:none;">Back</button>
            <button type="button" class="emby-button raised button-submit" id="um-bulk-review" disabled>Review changes</button>
            <button type="button" class="emby-button raised button-submit" id="um-bulk-apply" style="display:none;">Apply</button>
        `;
        const btn = (id) => footer.querySelector(id);

        function syncReviewEnabled() {
            const any = !!selectStep.querySelector('.um-bulk-user-check:checked');
            btn('#um-bulk-review').disabled = !any;
        }
        selectStep.querySelector('#um-bulk-select-all')?.addEventListener('click', () => {
            selectStep.querySelectorAll('.um-bulk-user-check').forEach((cb) => { cb.checked = true; });
            syncReviewEnabled();
        });
        selectStep.querySelector('#um-bulk-select-none')?.addEventListener('click', () => {
            selectStep.querySelectorAll('.um-bulk-user-check').forEach((cb) => { cb.checked = false; });
            syncReviewEnabled();
        });
        selectStep.querySelectorAll('.um-bulk-user-check').forEach((cb) => cb.addEventListener('change', syncReviewEnabled));
        btn('#um-bulk-cancel')?.addEventListener('click', () => window.ModalSystem.close(BULK_MODAL_ID));

        function showStep(step) {
            selectStep.style.display = step === 'select' ? '' : 'none';
            reviewStep.style.display = step === 'review' ? '' : 'none';
            btn('#um-bulk-back').style.display = step === 'review' ? '' : 'none';
            btn('#um-bulk-review').style.display = step === 'select' ? '' : 'none';
            btn('#um-bulk-apply').style.display = step === 'review' ? '' : 'none';
            statusEl.textContent = '';
        }
        btn('#um-bulk-back')?.addEventListener('click', () => showStep('select'));

        // What will be written: [{ user, current, next, rows, problem }] for the reviewed template and accounts.
        let plan = [];
        let planTemplateName = '';

        btn('#um-bulk-review')?.addEventListener('click', async () => {
            const templateName = templateSelect?.value;
            const template = loadConfig().templates.find((t) => t.name === templateName);
            if (!template?.policy) {
                toast('Selected template was not found');
                return;
            }
            const ids = new Set([...selectStep.querySelectorAll('.um-bulk-user-check:checked')].map((cb) => cb.value));
            if (!ids.size) return;

            const reviewBtn = btn('#um-bulk-review');
            reviewBtn.disabled = true;
            statusEl.textContent = 'Loading the current settings...';
            let fresh = [];
            let folderNames = {};
            try {
                [fresh, folderNames] = await Promise.all([fetchUsers(), fetchFolderNames()]);
            } catch (e) {
                ERR('Failed to load users for the review', e);
                toast(`Failed to load users: ${e.message || e}`);
                reviewBtn.disabled = false;
                statusEl.textContent = '';
                return;
            }
            plan = fresh.filter((u) => ids.has(u.Id)).map((user) => {
                const current = user.Policy || {};
                const next = mergePolicy(current, template.policy);
                const problem = selfProblem(user, current, next);
                return { user, current, next, rows: diffPolicy(current, next, folderNames), problem };
            });
            planTemplateName = templateName;

            const toWrite = plan.filter((p) => !p.problem && p.rows.length);
            reviewStep.innerHTML = `
                <div class="listItemBodyText" style="margin-bottom:0.75em;">
                    Template <strong>${escapeHtml(templateName)}</strong> would change ${toWrite.length} of ${plan.length} selected account${plan.length === 1 ? '' : 's'}.
                    Nothing is written until you press Apply.
                </div>
                ${plan.map((p) => `
                    <div class="um-review-user" data-user-id="${escapeAttr(p.user.Id)}">
                        <div class="um-review-user-name">${escapeHtml(p.user.Name)}${p.user.Id === myId ? ' (you)' : ''}</div>
                        ${p.problem
                            ? `<div class="um-review-problem">${escapeHtml(p.problem)}</div>`
                            : p.rows.length
                                ? `<ul class="um-review-rows">${p.rows.map((r) => `
                                    <li class="${r.key === 'IsAdministrator' && r.after === 'On' ? 'um-review-danger' : ''}"><span class="um-review-label">${escapeHtml(r.label)}</span>
                                    <span class="um-review-before">${escapeHtml(r.before)}</span> <span aria-hidden="true">&rarr;</span> <span class="um-review-after">${escapeHtml(r.after)}</span></li>`).join('')}</ul>`
                                : '<div class="um-review-same">Already matches the template. Nothing to change.</div>'}
                    </div>`).join('')}`;
            const applyBtn = btn('#um-bulk-apply');
            applyBtn.textContent = toWrite.length ? `Apply to ${toWrite.length} account${toWrite.length === 1 ? '' : 's'}` : 'Nothing to apply';
            applyBtn.disabled = !toWrite.length;
            showStep('review');
            reviewBtn.disabled = false;
        });

        btn('#um-bulk-apply')?.addEventListener('click', async () => {
            const applyBtn = btn('#um-bulk-apply');
            const template = loadConfig().templates.find((t) => t.name === planTemplateName);
            if (!template?.policy) {
                toast('Selected template was not found');
                return;
            }
            const toWrite = plan.filter((p) => !p.problem && p.rows.length);
            if (!toWrite.length) return;

            applyBtn.disabled = true;
            btn('#um-bulk-back').disabled = true;
            let ok = 0;
            let fail = 0;
            for (let i = 0; i < toWrite.length; i++) {
                const { user, next } = toWrite[i];
                statusEl.textContent = `Applying (${i + 1}/${toWrite.length}): ${user.Name}`;
                try {
                    await applyPolicy(user.Id, next);
                    ok++;
                } catch (e) {
                    fail++;
                    ERR(`Failed policy apply for ${user.Name}`, e);
                }
            }

            const summary = fail
                ? `Applied template to ${ok} user(s); ${fail} failed`
                : `Applied template to ${ok} user(s)`;
            statusEl.textContent = summary;
            toast(summary);
            btn('#um-bulk-back').disabled = false;
            if (!fail) {
                window.ModalSystem.close(BULK_MODAL_ID);
            } else {
                applyBtn.disabled = false;
            }
        });

        const modal = window.ModalSystem.create({
            id: BULK_MODAL_ID,
            title: 'Bulk edit user accounts',
            content,
            footer,
            closeOnBackdrop: true,
            closeOnEscape: true,
            showCloseButton: true
        });
        if (modal?.dialog) {
            modal.dialog.style.maxWidth = '720px';
            modal.dialog.style.width = '90vw';
        }
        syncReviewEnabled();
    }

    async function injectUsersListPage() {
        const addBtn = await waitForElement(() =>
            document.querySelector('#btnAddUser')
            || document.querySelector('button[title*="Add user" i]')
            || document.querySelector('.btnAddUser')
        );
        if (!addBtn) {
            WARN('Add user button not found on users list');
            return;
        }

        const parent = addBtn.parentElement || addBtn.closest('.fabSection') || addBtn.closest('.sectionTitleContainer');
        if (!parent) return;
        if (parent.querySelector('.um-bulk-fab') || parent.getAttribute(MARKER_BULK) === '1') return;

        const fab = document.createElement('button');
        fab.type = 'button';
        fab.className = 'fab btnFloating um-bulk-fab sectionTitleButton';
        fab.title = 'Bulk edit user accounts';
        fab.setAttribute('is', 'emby-button');
        fab.innerHTML = '<span class="material-icons edit" aria-hidden="true"></span>';
        fab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openBulkEditor();
        });

        // Place next to add-user fab
        if (addBtn.nextSibling) {
            parent.insertBefore(fab, addBtn.nextSibling);
        } else {
            parent.appendChild(fab);
        }
        parent.setAttribute(MARKER_BULK, '1');
        LOG('Injected bulk-edit fab on users list');
    }

    async function handleView(hash) {
        try {
            const admin = !!(await window.apiHelper?.isAdmin?.());
            if (!admin) return;

            if (isAddUserPage(hash)) {
                await injectAddUserPage();
            } else if (isUsersListPage(hash)) {
                await injectUsersListPage();
            }
        } catch (e) {
            ERR('onViewPage handler error', e);
        }
    }

    function register() {
        if (!window.KefinTweaksUtils?.onViewPage) {
            WARN('onViewPage unavailable, retrying...');
            setTimeout(register, 500);
            return;
        }

        window.KefinTweaksUtils.onViewPage((view, element, hash) => {
            // Defer slightly so Jellyfin finishes painting the form
            setTimeout(() => handleView(hash || window.location.hash), 250);
        }, {
            pages: ['dashboard/users']
        });

        // Immediate check for already-open page
        setTimeout(() => handleView(window.location.hash), 400);
        LOG('User Manager handlers registered');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', register);
    } else {
        register();
    }
})();
