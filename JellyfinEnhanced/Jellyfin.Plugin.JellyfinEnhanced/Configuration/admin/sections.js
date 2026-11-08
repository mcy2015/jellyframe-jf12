/* Settings sections for every tab. Fields and cards are defined here; jeAdmin.js renders them. */

/* ===== display ===== */
/* Display tab sections. See jeAdmin.js for the field spec. */
JEAdmin.define({
        'ui-preferences': {
            title: '界面偏好',
            fields: [
                { id: 'showWatchProgress', prop: 'ShowWatchProgress', type: 'toggle', perUser: true, label: '显示观看进度',
                  desc: '在条目详情页中显示条目的观看进度。' },
                { id: 'watchProgressDefaultMode', prop: 'WatchProgressDefaultMode', type: 'select', default: 'percentage', label: '观看进度默认样式',
                  options: [['percentage', '百分比'], ['time', '已观看时长'], ['remaining', '剩余时长']],
                  desc: '选择观看进度的默认显示方式（百分比、已观看时长或剩余时长）。' },
                { id: 'watchProgressTimeFormat', prop: 'WatchProgressTimeFormat', type: 'select', default: 'hours', label: '观看进度时间格式',
                  options: [['hours', 'h:m'], ['full', 'y:mo:d:h:m']],
                  desc: '选择基于时间的进度的显示方式。' },
                { id: 'showFileSizes', prop: 'ShowFileSizes', type: 'toggle', perUser: true, label: '显示文件大小',
                  desc: '在条目详情页或合集页中显示每个条目的文件大小。' },
                { id: 'showAudioLanguages', prop: 'ShowAudioLanguages', type: 'toggle', perUser: true, label: '在条目详情页显示可用的音频语言',
                  desc: '在详情页中列出每个片目可用的音频语言标志。' },
                { id: 'removeContinueWatchingEnabled', prop: 'RemoveContinueWatchingEnabled', type: 'toggle', perUser: true, label: '启用"从继续观看中移除"',
                  desc: '在右键 / 长按上下文菜单中添加"从继续观看中移除"选项。以非破坏性方式隐藏条目，因此播放进度会保留，且条目会出现在"隐藏内容"管理页中（在每个条目上可找到"重新加入继续观看"）。恢复播放时，条目也会自动取消隐藏。' }
            ]
        },
        'icons-theme': {
            title: '图标与主题',
            fields: [
                { id: 'useIcons', prop: 'UseIcons', type: 'toggle', main: true, default: true, label: '在界面中显示图标', descClass: 'je-field-desc-lg',
                  desc: '在整个界面中显示图标（提示消息、设置面板标题等）' },
                { id: 'iconStyle', prop: 'IconStyle', type: 'select', default: 'emoji', label: '图标风格',
                  options: [['emoji', '表情符号'], ['lucide', 'Lucide 图标'], ['mui', 'Material UI 图标']],
                  desc: '在表情符号、Lucide 图标或 Material UI 图标之间选择。' }
            ]
        },
        'content-warnings': {
            title: '内容警告（DoesTheDogDie）', iconImg: 'ddd-static/favicon.ico',
            fields: [
                { id: 'doesTheDogDieEnabled', prop: 'DoesTheDogDieEnabled', type: 'toggle', main: true, label: '显示内容预警',
                  toConfig: (v) => !!v, fromConfig: (v) => !!v,
                  desc: '<ul class="je-desc-list"><li>在电影和剧集页面显示社区投票的内容警告（有狗死亡、血腥、闪光等）</li><li>每个用户可通过该区块的齿轮图标选择自己在意的触发项</li><li>需要 doesthedogdie.com 的免费 API 密钥。免费档仅限非商业使用，全服每月 5,000 次请求。结果缓存数周，只有从未被打开过的条目才消耗请求次数</li></ul>' },
                { id: 'doesTheDogDieApiKey', prop: 'DoesTheDogDieApiKey', type: 'text', label: 'DoesTheDogDie API 密钥',
                  toConfig: (v) => String(v || '').trim(), fromConfig: (v) => v || '',
                  desc: '你的 API 密钥来自 <a class="sectionTitle" href="https://www.doesthedogdie.com/profile" target="_blank">doesthedogdie.com</a> 个人资料页。' }
            ]
        },
        'awards': {
            title: '奖项',
            fields: [
                { id: 'showAwards', prop: 'ShowAwards', type: 'toggle', main: true, label: '显示奖项横幅', descClass: 'je-field-desc-sm-font-lg',
                  desc: '在条目详情页显示获奖/提名横幅，数据按 TMDB id 取自 Wikidata，准确性以 Wikidata 所载为准。' }
            ]
        },
        'random-button': {
            title: '随机按钮',
            fields: [
                { id: 'randomButtonEnabled', prop: 'RandomButtonEnabled', type: 'toggle', perUser: true, main: true, label: '启用随机按钮',
                  desc: '在 Jellyfin 页头添加"随机播放"按钮，可从用户可访问的媒体库中随机打开一个条目。' },
                { id: 'randomUnwatchedOnly', prop: 'RandomUnwatchedOnly', type: 'toggle', perUser: true, label: '仅显示未观看',
                  desc: '启用后，随机选取只会选择用户尚未观看的条目。' },
                { id: 'randomIncludeMovies', prop: 'RandomIncludeMovies', type: 'toggle', perUser: true, label: '包含电影',
                  desc: '将电影纳入随机池。' },
                { id: 'randomIncludeShows', prop: 'RandomIncludeShows', type: 'toggle', perUser: true, label: '包含剧集',
                  desc: '将剧集纳入随机池。' },
                { id: 'randomScopeCurrentContainer', prop: 'RandomScopeCurrentContainer', type: 'toggle', perUser: true, label: '限定在当前播放列表或合集内',
                  desc: '在播放列表或合集页面，随机按钮将从该容器的条目中选取，而不是整个媒体库。用户还可以在增强面板中将某个播放列表或合集固定为永久来源。' }
            ]
        },
        'audio-language-tags': {
            title: '音频语言标签', icon: 'translate',
            fields: [
                { id: 'audioLanguageTagSyncEnabled', prop: 'AudioLanguageTagSyncEnabled', type: 'toggle', main: true, label: '启用音频语言标签同步', descClass: 'je-field-desc-xl',
                  desc: '把每部电影/剧集的音频语言添加为 Jellyfin 标签。地区音轨（如 en-US）会得到基础标签（“JE Language: English”）和地区标签（“JE Language: English (United States)”）。<br/><br/>已有条目由“同步音频语言标签到 Jellyfin”计划任务打标；启用服务端标签缓存后，新增/变更条目在媒体库扫描后自动打标。' },
                { id: 'audioLanguageTagPrefix', prop: 'AudioLanguageTagPrefix', type: 'text', label: '标签前缀', placeholder: 'JE 语言：', default: 'JE Language: ',
                  desc: '加在每个语言前面的前缀，例如 "JE Language: English"。' },
                { id: 'audioLanguageTagShowAsLinks', prop: 'AudioLanguageTagShowAsLinks', type: 'toggle', default: true, label: '将音频语言链接到其标签页', descClass: 'je-field-desc-xl',
                  desc: '把条目详情页上的每个音频语言链接到 Jellyfin 中带该标签的条目列表。' }
            ]
        }
    });

/* Overview, Media Tags, Spoiler Guard, MDBList and Default Language. Fields marked manual: true keep their load/save
 * lines in configPage.html (clamps, defaults, JS-populated lists); the schema only renders them. */
(function () {
    const UL = (...li) => '<ul class="je-desc-list">' + li.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    const tog = (id, label, desc, extra) => Object.assign({ id, type: 'toggle', manual: true, label, desc }, extra);
    const sel = (id, label, options, desc, extra) => Object.assign({ id, type: 'select', manual: true, label, options, desc }, extra);
    const RS = [['tmdb', 'TMDB'], ['tomatoes', '烂番茄影评人'], ['popcorn', '烂番茄观众'], ['imdb', 'IMDb'], ['trakt', 'Trakt'],
        ['metacritic', 'Metascore'], ['metacriticuser', 'Metacritic 用户'], ['letterboxd', 'Letterboxd'], ['myanimelist', 'MAL'], ['anilist', 'AniList'], ['master', '主设置']];
    const RSN = [['', '无']].concat(RS);
    const arrow = (d) => '<i class="material-icons je-cat-arrow-icon" aria-hidden="true">arrow_' + d + 'ward</i>';

    JEAdmin.define({
        'overview-status': {
            title: '服务状态', icon: 'sensors', class: 'je-overview-section',
            items: [{ type: 'custom', html: '<div class="je-service-dashboard" id="je-service-dashboard"><div class="je-checklist-empty">Loading service status…</div></div>' }]
        },
        'overview-plugins': {
            title: '可选依赖', icon: 'extension', class: 'je-overview-section', id: 'overview-optional-plugins-section',
            items: [{ type: 'custom', html: '<div class="je-optional-plugins-dashboard" id="je-optional-plugins"></div>' }]
        },
        'overview-features': {
            title: '功能', icon: 'toggle_on', class: 'je-overview-section', id: 'overview-features-section',
            items: [{ type: 'custom', html: '<div class="je-features-dashboard" id="je-features-dashboard"><div class="je-checklist-empty">Loading features…</div></div>' }]
        },
        'overview-actions': {
            title: '快捷操作', icon: 'bolt', class: 'je-overview-section', id: 'overview-quick-actions-section',
            items: [{ type: 'custom', html: '<div class="je-quick-actions-grid" id="je-quick-actions-grid">'
                + '<button type="button" id="retestAllConnectionsBtn" class="je-quick-action" data-action="retest-all"><i class="material-icons je-quick-action-icon" aria-hidden="true">sync</i><div class="je-quick-action-text"><span class="je-quick-action-title">Re-test all service connections</span><span class="je-quick-action-detail">Re-runs the TMDB / Seerr / Sonarr / Radarr tests</span></div></button>'
                + '<button type="button" id="resetAllUserSettingsBtn" class="je-quick-action" data-action="apply-all-users"><i class="material-icons je-quick-action-icon" aria-hidden="true">group</i><div class="je-quick-action-text"><span class="je-quick-action-title">Apply all plugin settings to every user</span><span class="je-quick-action-detail">Copies every personal setting from the plugin (Display, Playback, ...) into each user, replacing the values they set for themselves</span></div></button>'
                + '<button type="button" id="clearTagCachesQuickBtn" class="je-quick-action" data-action="clear-tag-caches"><i class="material-icons je-quick-action-icon" aria-hidden="true">cleaning_services</i><div class="je-quick-action-text"><span class="je-quick-action-title">Clear all client tag caches</span><span class="je-quick-action-detail">Forces every client to rebuild its localStorage tag cache</span></div></button>'
                + '</div>' }]
        },

        // Media Tags settings (quality, genre, language, rating and the other tag groups, layout, rules, colours, the tag
        // cache and native poster tags) live on the Media Tags tab (#media-tags, outside this page's form, saved one field
        // at a time). This card has no fields, so this page's load, Save and apply-to-users never read or write any of
        // them; its links open that tab in place (configPage.html handles links to this page itself).
        'media-tags': {
            title: '媒体标签', icon: 'sell', id: 'mediaTagsCard',
            items: [{ type: 'custom', html: '<div class="je-media-tags-card"><div class="je-media-tags-card-text">'
                + '<div class="fieldDescription">Poster tags (quality, genre, language, rating, age rating, status, people), their default layout, rules and colours, the tag cache and Native Poster Tags have their own tab, Media Tags, which saves each change as you make it.</div>'
                + '<dl class="je-media-tags-card-facts" id="jeMediaTagsCardFacts" aria-live="polite"></dl></div>'
                + '<a class="jea-btn jea-btn-primary je-media-tags-open" href="#/configurationpage?name=Jellyfin%20Enhanced&amp;jeSection=media-tags"><i class="material-icons" aria-hidden="true">sell</i><span>Open Media Tags</span></a>'
                + '<div class="je-media-tags-card-links">'
                + [['layout', '布局默认值'], ['groups', '分组'], ['rules', '规则'], ['colours', '配色'], ['badges', '状态徽章'], ['server', '标签缓存与原生海报']]
                    .map(([section, label]) => '<a class="je-media-tags-card-link" href="#/configurationpage?name=Jellyfin%20Enhanced&amp;jeSection=media-tags&amp;tab=' + section + '">' + label + '</a>').join('')
                + '</div></div>' }]
        },

        'spoiler-guard': {
            title: '剧透保护', icon: 'blur_on',
            items: [
                { type: 'note', html: '<strong>Spoiler Guard</strong> hides episode thumbnails, season posters, movie posters and chapter scenes for unwatched titles each user opts into. It also strips spoiler-bearing metadata: synopses, episode titles, tags, taglines, ratings, air dates, cast on unwatched episodes, chapter names, and TMDB / user reviews on opted-in series.' },
                tog('spoilerBlurEnabled', 'Enable Spoiler Guard', 'Turns the whole feature on. While it\'s off, the per-show toggle button never appears and nothing is ever hidden. Turn it on to let users protect individual shows, movies, and collections from their own detail pages.', { main: true }),
                sel('spoilerBlurMode', 'Image replacement mode', [['hide', '显示通用卡片（完全隐藏图片，默认）'], ['blur', '模糊图片']],
                    'How protected cards look. <strong>Show stock cards</strong> (default) swaps each unwatched image for a safe parent-level placeholder: episodes show their series backdrop, seasons show the series poster, collection-opted movies show the collection art. <strong>Blur images</strong> instead applies a strong blur to the original so silhouettes and dominant colours still hint at "something is here". Pick stock cards for the strictest hide; pick blur if the placeholders feel too aggressive.'),
                { id: 'spoilerBlurIntensity', type: 'number', manual: true, label: '模糊强度', min: 5, max: 100, step: 1,
                  desc: '模糊强度。<strong>5</strong> 只是轻抹，<strong>40</strong> 为推荐默认值（人物无法辨认但颜色仍透出），<strong>100</strong> 几乎是纯色块。作用于“模糊图像”模式，以及“显示通用卡片”模式下无安全父级图可替换时（如单独加入的电影）对原图的兜底模糊。' },
                tog('spoilerBlurArtwork', 'Also hide the wide backdrop / fanart', 'By default the protection covers posters, episode thumbs, and screenshots, but leaves the wide cinematic backdrop / fanart on detail pages alone (it\'s usually atmosphere, not plot). Turn this on if you want backdrops hidden too for maximum protection.'),
                tog('spoilerKeepMoviePosters', 'Keep movie posters visible', 'When on, a protected movie\'s poster still shows in full, but the scene thumbnails inside the movie\'s detail page (chapters, screenshots) stay hidden. Useful if you find movie posters are usually marketing art that doesn\'t give plot away, while the chapter scene-thumbs inside the movie do. Doesn\'t affect TV shows.'),
                tog('spoilerBlurTrickplay', 'Hide trickplay seek previews', 'Protects the scrubbing thumbnails the player shows while you seek through an unwatched protected episode or movie. Sheets that end before your saved progress are still shown. Turn this off to always show seek previews. Users can also turn it off for themselves in their Spoiler Guard settings.'),
                tog('spoilerBlurStrictRefresh', 'Strict refresh mode (full page reload after toggle)', 'After a user flips Spoiler Guard on or off, card images update on the page instantly. By default, on-page text (description, episode titles, ratings) only refreshes when they navigate next. Turn this on to also reload the whole page after a toggle so the text updates straight away, at the cost of a brief page flash. Most users prefer it off for the smoother feel.'),
                { type: 'group', title: '自动启用', open: true, items: [
                    tog('spoilerAutoEnableOnFirstPlay', 'Auto-enable Spoiler Guard on first play of a new show', 'When on, Spoiler Guard turns itself on for a series the moment a user starts Season 1 Episode 1 of a show they\'ve never watched. They don\'t have to remember to flip the toggle before pressing play. Rewatches and jumping in at later episodes are ignored; only a fresh first-play counts.'),
                    tog('spoilerAutoEnableOnSeerrRequest', 'Auto-enable Spoiler Guard on Seerr request', 'When on, requesting something through Seerr also pre-arms Spoiler Guard for that title: when the show or movie lands in the library, protection is already on for the user who requested it. Users can also pre-arm titles manually with the "Enable Spoiler Guard" button in the Seerr details popup (always available regardless of this toggle), handy when someone else requested the title first.'),
                    tog('spoilerAutoEnableOnLibraryAdd', 'Auto-enable Spoiler Guard when new titles are added to the library', 'When on, every new show or movie that appears in the library (from a scan, a Seerr download, or a manual copy) is added to the Spoiler Guard list of every user who can see that library, so protection is in place before anyone presses play. Only brand-new titles are affected: a user who later switches Spoiler Guard off for a title isn\'t re-armed by metadata refreshes. Library scans are batched, so a big scan results in one settings write per user rather than one per title.'),
                    { type: 'custom', html: '<div id="spoilerAutoEnableScopeContainer" class="jea-subbox"><div class="jea-subbox-title">Auto-enable applies to</div><div class="fieldDescription">Shared by all three auto-enable options above.</div>'
                        + '<div class="checkboxContainer"><label><input id="spoilerAutoEnableSeries" type="checkbox"/><span>TV shows</span></label></div>'
                        + '<div class="checkboxContainer"><label><input id="spoilerAutoEnableMovies" type="checkbox"/><span>Movies</span></label></div>'
                        + '<div class="fieldDescription">Libraries: leave every library unticked to cover all of them. Doesn\'t apply to Seerr requests (the title isn\'t in a library yet).</div>'
                        + '<div id="spoilerAutoEnableLibraryList"><div class="fieldDescription">Loading libraries…</div></div></div>' },
                    { type: 'custom', html: '<div id="spoilerApplyExistingContainer" class="je-spoiler-apply-existing jea-subbox"><div class="jea-subbox-title">Titles already in the library</div>'
                        + '<div class="fieldDescription">Auto-enable only arms titles as they arrive, and a rescan doesn\'t count (so nobody who switched Spoiler Guard off for a title gets it switched back on). To guard what\'s already there, apply the <em>saved</em> scope above to existing titles, for every user who can see them. Works whether or not "when new titles are added" is on. Titles a user already has, or has fully watched, are skipped. Also available as the "Spoiler Guard: apply to existing titles" scheduled task.</div>'
                        + '<div class="checkboxContainer"><label><input id="spoilerApplyExistingSkipStarted" type="checkbox"/><span>Also skip titles a user has already started watching</span></label></div>'
                        + '<div class="jea-actions"><button id="spoilerApplyExistingBtn" type="button" class="jea-btn"><span>Apply to existing titles now…</span></button></div>'
                        + '<div id="spoilerApplyExistingStatus" class="fieldDescription" aria-live="polite"></div></div>' }
                ] },
                { type: 'group', title: '隐藏未看剧集的元数据', items: [
                    { type: 'note', html: 'These options hide spoiler-bearing text on protected TV shows and their unwatched episodes. Hidden centrally so the protection works the same in every Jellyfin client.' },
                    tog('spoilerStripSeriesOverview', 'Hide TV show descriptions', 'Swaps the description on a protected TV show\'s own detail page for the placeholder text below. Independent from episode descriptions, so you can keep the show\'s general premise visible while still hiding episode plots.'),
                    tog('spoilerStripOverview', 'Hide episode descriptions', 'Swaps the per-episode plot summary for the placeholder text below. The single biggest source of leaks, strongly recommended on.'),
                    { id: 'spoilerOverviewPlaceholder', type: 'text', manual: true, label: '占位文本', attrs: { maxlength: '200' },
                      desc: '在受保护剧集或单集简介原位置显示的文本，避免页面出现空白。默认："剧透保护已启用"。' },
                    tog('spoilerStripTags', 'Hide tags', 'Hides plot-bearing tags (phrases like "Death of a main character") and the genre / quality / language / rating chips Jellyfin Enhanced draws on top of cards. Recommended on.'),
                    tog('spoilerStripChapters', 'Hide chapter names (keep timestamps)', 'Chapter labels like "X dies" or "Y is revealed" can spoil the whole episode. Hides the names but leaves the chapter markers on the seek bar so users can still skip around. Recommended on.'),
                    tog('spoilerStripTaglines', 'Hide taglines', 'Marketing taglines like "Everything changes tonight" basically advertise the twist. Recommended on.'),
                    tog('spoilerStripRatings', 'Hide ratings', 'Hides both the community and critic ratings on unwatched episodes. A standout score like "9.8/10" on a specific episode usually signals a major event. Recommended on.'),
                    tog('spoilerStripPremiereDate', 'Hide air date', 'A long gap before a particular episode can give away "this one\'s the season finale" without even reading the title. Hides the date so the schedule itself stays a surprise.'),
                    tog('spoilerReplaceTitle', 'Replace episode titles', 'Swaps episode names like "The Death of X" for "Season 2, Episode 6". Some clients show the title in navigation tooltips and breadcrumbs where the swap can look a bit clinical; turn off if your users prefer to keep the original titles visible.'),
                    tog('spoilerStripCast', 'Hide cast on unwatched episodes', 'An unexpected guest star, or a regular suddenly missing from the cast list, can give away the whole episode. Hides the cast on unwatched episodes; pick what counts as "cast" below.'),
                    sel('spoilerStripCastMode', 'Cast hiding scope', [['GuestStars', '仅客串演员（推荐）'], ['All', '全体演职员（常驻 + 客串）']],
                        '<strong>Guest stars only</strong> keeps the regular cast visible, since they\'re in every episode anyway and don\'t give anything away. <strong>Entire cast</strong> is the strict option for shows where the recurring cast appearing or not appearing in a given episode is itself the spoiler.', { showIf: 'spoilerStripCast' }),
                    tog('spoilerStripReviews', 'Hide reviews on Spoiler Guard series', 'Hides the Reviews panel on the detail pages of shows the user has Spoiler Guard on for. Reviews very often spoil plot points from anywhere in the series. Recommended on.')
                ] },
                { type: 'group', title: '按类别逐步揭示（高级）', items: [
                    tog('spoilerAdvancedMode', 'Enable advanced per-category reveals', 'Instead of one uniform strip for every unwatched episode, the user\'s <strong>next</strong> unwatched episode and the rest of its season get the reveal settings below. Later seasons, skipped earlier seasons and specials always keep the full strip. A reveal only relaxes a strip that is enabled above; categories whose strip is off show everywhere already. Each user can opt back into the uniform full strip from their settings panel.'),
                    { type: 'note', html: 'Checked = still hidden for that category. Unchecked = revealed. The next-episode title starts revealed; that\'s the point of advanced mode: see <em>what</em> you\'re about to watch, and nothing more.' },
                    tog('spoilerNextEpisodeStripTitle', 'Next episode: keep title hidden', null, { showIf: 'spoilerAdvancedMode' }),
                    tog('spoilerNextEpisodeStripOverview', 'Next episode: keep description hidden', null, { showIf: 'spoilerAdvancedMode' }),
                    tog('spoilerNextEpisodeStripRatings', 'Next episode: keep ratings hidden', null, { showIf: 'spoilerAdvancedMode' }),
                    tog('spoilerNextEpisodeStripImage', 'Next episode: keep image hidden', null, { showIf: 'spoilerAdvancedMode' }),
                    tog('spoilerCurrentSeasonStripTitle', 'Current season: keep titles hidden', null, { showIf: 'spoilerAdvancedMode' }),
                    tog('spoilerCurrentSeasonStripOverview', 'Current season: keep descriptions hidden', null, { showIf: 'spoilerAdvancedMode' }),
                    tog('spoilerCurrentSeasonStripRatings', 'Current season: keep ratings hidden', '"Current season" is the season containing the next unwatched episode. Card rating overlays and search results stay fully protected regardless of these reveals; only the episode metadata itself (lists and detail pages) is revealed.', { showIf: 'spoilerAdvancedMode' })
                ] }
            ]
        },

        'default-language': {
            title: '默认语言', icon: 'language',
            items: [sel('DefaultLanguage', 'Default UI Language', [['', '系统默认']], 'Sets the default language for all users. Users can still override this in their own settings.')]
        },

        'mdblist': {
            title: 'MDBList 评分', iconImg: 'mdblist-static/favicon.ico',
            items: [
                tog('mdblistRatingsEnabled', 'Enable MDBList Ratings', UL('Shows TMDB, Rotten Tomatoes, IMDb, Trakt and other ratings on item-details pages', 'Can fill in Jellyfin\'s own missing Community/Critic Rating fields', 'Requires a free API key from mdblist.com'), { main: true }),
                { type: 'custom', html: '<div class="inputContainer jea-row"><label class="inputLabel" for="mdblistApiKey">MDBList API Key</label>'
                    + '<div class="je-api-row"><input id="mdblistApiKey" type="text" autocomplete="off" class="je-api-input jea-input"/><span id="mdblistStatusIndicator" class="material-icons"></span>'
                    + '<button type="button" id="checkMdblistStatusBtn" class="jea-btn">Check</button></div>'
                    + '<div id="mdblistStatusLine" class="jea-hint">&nbsp;</div></div>'
                    + '<div class="je-setting-description" data-desc-for="mdblistApiKey"><div class="fieldDescription">Your API key from <a class="sectionTitle" href="https://mdblist.com/preferences/#api" target="_blank">mdblist.com</a>.</div></div>' },
                tog('mdblistRatingsShowOnItemDetails', 'Show Ratings Row on Item Details', 'Displays the MDBList ratings row on item-details pages.'),
                tog('mdblistRatingsShowPercentSymbol', 'Show % Symbol', 'Appends "%" after each rating badge\'s number.'),
                { type: 'custom', html: '<details id="mdblistSourcesAdminDetails" class="je-details-section"><summary>Configure ratings shown</summary><div class="je-details-body"><div class="fieldDescription je-field-desc-sm">Pick which ratings appear on the item-details row, and the order they\'re shown in. Use the '
                    + arrow('up') + ' / ' + arrow('down') + ' buttons to reorder. All checked by default.</div><div id="mdblistRatingsSourcesAdmin"></div></div></details>' },
                { type: 'group', title: '拉取评分（计划任务）', items: [
                    tog('mdblistRatingsFetchEnabled', 'Fetch Ratings from MDBList', 'Enables the <strong>Fetch Ratings from MDBList</strong> scheduled task (Dashboard, Scheduled Tasks):' + UL(
                        'Looks up MDBList data for any movie/series whose cached ratings are missing or stale, and saves it. Doesn\'t touch Jellyfin\'s own rating fields',
                        'A found title stays cached for 7 days (3 days for a confirmed "no match") before being refetched. Already-fresh titles are skipped on a re-run, so it\'s safe to schedule this frequently, even daily',
                        'Stops once today\'s quota drops to the reserve below')),
                    { id: 'mdblistFetchReserve', type: 'number', manual: true, label: '拉取任务预留', min: 1, max: 100000, showIf: 'mdblistRatingsFetchEnabled',
                      desc: '当日剩余实时配额降至该数值时，抓取任务即停止，为浏览媒体库的用户保留这部分配额（详情页在无缓存时会实时抓取）。' }
                ] },
                { type: 'group', title: '同步评分进 Jellyfin（计划任务）', items: [
                    tog('mdblistRatingsAutoSyncEnabled', 'Sync Ratings from MDBList to Jellyfin', 'Enables the <strong>Sync Ratings from MDBList to Jellyfin</strong> scheduled task:' + UL(
                        'Sets Community / Critic Ratings (source selectable below, default TMDB / Rotten Tomatoes) from whatever\'s already cached (see Fetch above) into Jellyfin\'s own fields',
                        'Requires the <strong>Fetch Ratings from MDBList</strong> task to be enabled and run first')),
                    sel('mdblistCommunityRatingSource', 'Star Rating Source (Community Rating)', RS, 'The star rating shown by Jellyfin, on a 0-10 scale (e.g. 7.2). Choose which MDBList source fills it. Default TMDB.', { showIf: 'mdblistRatingsAutoSyncEnabled' }),
                    sel('mdblistCommunityRatingFallbackSource', 'Star Rating Fallback Source', RSN, 'Used when the source above has no score for a title. Default none.', { showIf: 'mdblistRatingsAutoSyncEnabled' }),
                    sel('mdblistCriticRatingSource', 'Tomato Rating Source (Critic Rating)', RS, 'The tomato rating shown by Jellyfin, on a 0-100% scale (e.g. 85%). Choose which MDBList source fills it. Default RT Critic.', { showIf: 'mdblistRatingsAutoSyncEnabled' }),
                    sel('mdblistCriticRatingFallbackSource', 'Tomato Rating Fallback Source', RSN, 'Used when the source above has no score for a title. Default none.', { showIf: 'mdblistRatingsAutoSyncEnabled' }),
                    tog('mdblistRatingsOverwriteExisting', 'Overwrite Existing Jellyfin Ratings', UL('<strong>Off</strong> (default): Only fills an empty rating, never revisits an item once both are set', '<strong>On</strong>: Every run re-sets every item\'s rating to MDBList\'s current cached value. This is also the only way ratings stay current over time'), { showIf: 'mdblistRatingsAutoSyncEnabled' })
                ] }
            ]
        }
    });
})();

/* ===== elsewhere ===== */
/* Elsewhere tab sections. See jeAdmin.js for the field spec.
 * TMDB key and region stay hand-wired (html items): the key has a Test button, is mirrored to the Seerr tab's copy,
 * and the region list is filled by populateRegionSelect() in the page script. They sit in their own section, ahead
 * of Elsewhere, because Reviews and Release Dates need them even when Elsewhere is off. */
JEAdmin.define({
    'elsewhere-tmdb': {
        title: 'TMDB', iconImg: 'selfhst/svg/tmdb.svg',
        items: [
            { type: 'custom', html:
                '<div class="inputContainer jea-row"><label class="inputLabel" for="TMDB_API_KEY">TMDB API Key</label>'
                + '<div class="je-api-row"><input id="TMDB_API_KEY" name="TMDB_API_KEY" type="text" autocomplete="off" class="je-api-input jea-input"/>'
                + '<span id="tmdbStatusIndicator" class="material-icons"></span>'
                + '<button type="button" class="testTmdbBtn jea-btn">Test</button></div></div>'
                + '<div class="je-setting-description" data-desc-for="TMDB_API_KEY"><div class="fieldDescription">Your API key from The Movie DB (TMDB). <a class="sectionTitle" href="https://www.themoviedb.org/settings/api" target="_blank">How to?</a> Shared with Seerr Settings. Needed by Elsewhere, TMDB Reviews and Release Dates.</div></div>' },
            { id: 'DEFAULT_REGION', prop: 'DEFAULT_REGION', manual: true, type: 'select', options: [], label: '默认地区',
                           desc: '流媒体提供商查询与发行日期的默认地区。留空默认美国。<a class="sectionTitle" href="https://cdn.jsdelivr.net/gh/n00bcodr/Jellyfin-Elsewhere/resources/regions.txt" target="_blank">完整列表</a>' }
        ]
    },
    'elsewhere': {
        title: 'Elsewhere（流媒体提供商）', icon: 'live_tv',
        items: [
            { id: 'elsewhereEnabled', prop: 'ElsewhereEnabled', type: 'toggle', main: true, label: '启用 Elsewhere',
              desc: '在条目详情页添加“Elsewhere”面板，显示该影片在用户所在地区的流媒体服务上架情况（数据来自 TMDB watch-provider）。' },
            { id: 'DEFAULT_PROVIDERS', prop: 'DEFAULT_PROVIDERS', type: 'text', label: '默认流媒体服务', placeholder: '例如：Netflix,Hulu',
              desc: '默认显示的流媒体服务列表。留空显示全部。<a class="sectionTitle" href="https://cdn.jsdelivr.net/gh/n00bcodr/Jellyfin-Elsewhere/resources/providers.txt" target="_blank">完整列表</a>' },
            { id: 'IGNORE_PROVIDERS', prop: 'IGNORE_PROVIDERS', type: 'text', label: '忽略的流媒体服务', placeholder: '例如：.*with Ads, Hulu',
              desc: '默认地区中要忽略的流媒体服务（支持正则）。<a class="sectionTitle" href="https://cdn.jsdelivr.net/gh/n00bcodr/Jellyfin-Elsewhere/resources/providers.txt" target="_blank">完整列表</a>' },
            { id: 'ElsewhereSeasonProviders', prop: 'ElsewhereSeasonProviders', type: 'toggle', default: true, label: '按季配置提供商',
              desc: '在剧集和季页面上，按季从 TMDB 查询流媒体提供商。只有各季不同时才会标注；TMDB 没有数据的季会回退使用整部剧集的提供商。仅在剧集使用默认（按播出日期）季顺序时生效。用户可以在 Elsewhere 搜索设置中自行关闭此功能。' },
            { type: 'group', title: '自定义品牌', items: [
                { id: 'ElsewhereCustomBrandingText', prop: 'ElsewhereCustomBrandingText', type: 'text', label: '自定义品牌消息', placeholder: '例如：仅在我的服务器上可用',
                  desc: '当内容在任何流媒体提供商处都不可用时显示的自定义消息。留空则禁用自定义品牌。' },
                { id: 'ElsewhereCustomBrandingImageUrl', prop: 'ElsewhereCustomBrandingImageUrl', type: 'text', label: '自定义品牌图标 URL', placeholder: '/web/assets/img/icon.png',
                  desc: '可选的图标 URL，显示在自定义消息旁边。留空则不显示图标。' }
            ] }
        ]
    },
    'reviews-panel': {
        title: '评论面板', icon: 'rate_review',
        items: [
            { id: 'reviewsExpandedByDefault', prop: 'ReviewsExpandedByDefault', type: 'toggle', label: '默认展开评论',
              desc: '启用后，所有用户的评论区默认展开（除非用户在会话中自行覆盖）。' }
        ]
    },
    'reviews-tmdb': {
        title: 'TMDB 评论', icon: 'reviews',
        items: [
            { id: 'showReviews', prop: 'ShowReviews', type: 'toggle', main: true, label: '显示 TMDB 评论',
              desc: '需要先设置 TMDB API 密钥。' }
        ]
    },
    'reviews-anilist': {
        title: 'AniList', iconImg: 'anilist-static/icon.svg',
        items: [
            { id: 'showAnilistReviews', prop: 'ShowAnilistReviews', type: 'toggle', main: true, label: '显示 AniList 评论',
              desc: '在评论区显示该动画在 AniList 的热门用户评论。<br>仅当 AniList 已配置为元数据提供者时可用（按 AniList ID 匹配条目）。<br>无需 API 密钥。<br>评论中的剧透段落会被隐藏。' }
        ]
    },
    'reviews-translation': {
        title: '评论翻译', icon: 'translate',
        items: [
            { id: 'reviewTranslationEnabled', prop: 'ReviewTranslationEnabled', type: 'toggle', main: true, label: '启用评论翻译',
              desc: '为英文 TMDB 和 AniList 评论添加“翻译”按钮，翻译成用户的 Jellyfin 语言。<br>桌面版 Chrome/Edge 在设备端翻译、不外发任何内容，但仅在 HTTPS 或 localhost 下可用。Firefox、Safari、移动浏览器及 Jellyfin 客户端没有内置翻译。<br>其他环境使用你在下方配置的 <a class="sectionTitle" href="https://libretranslate.com" target="_blank">LibreTranslate</a> 实例（仅发送评论文本）。<br>翻译实时进行、不做存储。按钮只对浏览器或实例支持的语言显示。' },
            { id: 'reviewTranslationUrl', prop: 'ReviewTranslationUrl', type: 'text', label: 'LibreTranslate 地址（可选）', placeholder: 'http://localhost:5000',
              toConfig: (v) => (v || '').trim(),
              desc: '供没有内置翻译器的浏览器使用的后备方案。实例的基础地址，不带末尾路径。' },
            { id: 'reviewTranslationApiKey', prop: 'ReviewTranslationApiKey', type: 'password', label: 'LibreTranslate API 密钥（可选）',
              toConfig: (v) => (v || '').trim(),
              desc: '仅当你的实例要求密钥时才需要填写。' }
        ]
    },
    'reviews-user': {
        title: '用户评论', icon: 'rate_review',
        items: [
            { type: 'note', html: 'Completely independent of Elsewhere being enabled and TMDB Reviews being enabled.' },
            { id: 'showUserReviews', prop: 'ShowUserReviews', type: 'toggle', main: true, label: '启用用户撰写评论',
              desc: '允许用户为媒体库中的条目撰写评论并评分。' },
            { id: 'hideReviewsFromHiddenUsers', prop: 'HideReviewsFromHiddenUsers', type: 'toggle', default: true, label: '隐藏已隐藏用户的评论',
              desc: '启用后，标记为“在登录界面隐藏此用户”的 Jellyfin 用户所写评论对非管理员访客隐藏。管理员始终可见全部评论。' },
            { id: 'hideReviewsFromDisabledUsers', prop: 'HideReviewsFromDisabledUsers', type: 'toggle', default: true, label: '隐藏已禁用用户的评论',
              desc: '启用后，标记为“禁用此用户”的 Jellyfin 用户所写评论对非管理员访客隐藏。管理员始终可见全部评论。' },
            { id: 'mirrorReviewRatingsToJellyfin', prop: 'MirrorReviewRatingsToJellyfin', type: 'toggle', label: '同时将评论的星级评分保存为用户的 Jellyfin 评分',
              desc: '用户在评论中给电影/剧集打分时，同时把该评分（换算为 Jellyfin 的 0-10）写入其对条目的 Jellyfin 用户评分，方便读取 Jellyfin 用户数据的联动/评分同步工具。会覆盖用户在其他地方设置的评分。删除评论或去掉星级时，仅当 Jellyfin 评分仍与评论一致才清除；若评分后来在别处改过则保留。季/单集评论不同步。' },
            { type: 'group', title: '海报卡片', items: [
                { id: 'showUserRatingOnPosters', prop: 'ShowUserRatingOnPosters', type: 'toggle', label: '在海报卡片上显示用户平均评分',
                  desc: '评分标签启用时，在海报卡片上叠加 <span class="je-msym-rounded" style="font-size:14px;vertical-align:middle;color:#e91e8c;">person_heart</span> 徽章，显示全部用户评论的平均分。' },
                { id: 'showUserRatingDash', prop: 'ShowUserRatingDash', type: 'toggle', default: true, label: '未评分条目的海报显示短横线',
                  desc: '评分标签启用时，每张海报都会显示 <span class="je-msym-rounded" style="font-size:14px;vertical-align:middle;color:#e91e8c;">person_heart</span> 徽章。勾选此项可为用户尚未评分的条目显示短横线；不勾则未评分条目完全不显示徽章。' }
            ] }
        ]
    },
    'release-dates': {
        title: '上映/播出日期', icon: 'event',
        items: [
            { id: 'showReleaseDate', prop: 'ShowReleaseDates', type: 'toggle', main: true, label: '显示上映/播出日期',
              desc: '需要 TMDB API 密钥。在电影/剧集/季/单集详情页显示上映（影院/数字/实体）或下次/上次播出日期徽章，数据来自 TMDB，并按上方 TMDB 连接里设置的默认地区优先选取国家日期。' }
        ]
    }
});

/* ===== playback ===== */
/* Playback tab sections. See jeAdmin.js for the field spec. */
JEAdmin.define({
    'pb-tabswitch': {
        title: '播放器行为', icon: 'play_circle',
        items: [
            { id: 'autoPauseEnabled', prop: 'AutoPauseEnabled', type: 'toggle', perUser: true, label: '切换标签页时自动暂停',
              desc: '切换到其他浏览器标签页时自动暂停播放。' },
            { id: 'autoResumeEnabled', prop: 'AutoResumeEnabled', type: 'toggle', perUser: true, label: '切回标签页时自动恢复',
              desc: '切回播放器标签页时自动恢复播放。' },
            { id: 'autoPipEnabled', prop: 'AutoPipEnabled', type: 'toggle', perUser: true, label: '切换标签页时自动画中画',
              desc: '切换标签页时进入浏览器画中画模式（需要浏览器支持）。' },
            { id: 'longPress2xEnabled', prop: 'LongPress2xEnabled', type: 'toggle', perUser: true, label: '长按 2 倍速播放 β',
              desc: '在播放器任意位置长按可临时 2 倍速播放，松开恢复原速。测试版，仅限触屏设备。' },
            { id: 'showPlaybackRatingBadge', prop: 'ShowPlaybackRatingBadge', type: 'toggle', label: '播放开始时显示分级',
              desc: '视频开始播放时在播放器角落短暂显示分级，随后显示一行内容提示标签（如暴力或粗口）和一行流派信息。' },
            { id: 'pauseScreenEnabled', prop: 'PauseScreenEnabled', type: 'toggle', perUser: true, label: '启用自定义暂停界面',
              desc: '暂停播放时显示当前播放内容的详情浮层。' }
        ]
    },
    'pb-autoskip': {
        title: '自动跳过', icon: 'skip_next',
        items: [
            { id: 'autoSkipIntro', prop: 'AutoSkipIntro', type: 'toggle', perUser: true, label: '自动跳过片头',
              desc: '自动跳过检测到的片头。需要 Intro Skipper 插件。' },
            { id: 'autoSkipOutro', prop: 'AutoSkipOutro', type: 'toggle', perUser: true, label: '自动跳过片尾',
              desc: '自动跳过检测到的片尾（演职员表）。需要 Intro Skipper 插件。' }
        ]
    },
    'pb-subtitles': {
        title: '字幕', icon: 'subtitles',
        items: [
            { id: 'disableCustomSubtitleStyles', prop: 'DisableCustomSubtitleStyles', type: 'toggle', perUser: true, label: '默认禁用自定义字幕样式',
              desc: '全局禁用 Jellyfin 的自定义字幕样式覆盖，按源字幕样式原样显示。' },
            { type: 'group', title: '新用户的默认外观', open: true, items: [
                { id: 'DefaultSubtitleStyle', prop: 'DefaultSubtitleStyle', type: 'select', perUser: true, default: 0, label: '默认字幕样式',
                  options: [['0', '纯白简洁'], ['1', '经典黑底'], ['2', 'Netflix 风格'], ['3', '影院黄'], ['4', '柔和灰'], ['5', '高对比']],
                  toConfig: (v) => parseInt(v, 10),
                  desc: '应用于新用户的默认字幕样式预设；用户可在个人设置中覆盖。' },
                { id: 'DefaultSubtitleSize', prop: 'DefaultSubtitleSize', type: 'select', perUser: true, default: 0, label: '默认字幕大小',
                  options: [['0', '极小'], ['1', '小'], ['2', '正常'], ['3', '大'], ['4', '特大'], ['5', '巨大']],
                  toConfig: (v) => parseInt(v, 10),
                  desc: '应用于新用户的默认字幕大小；用户可在个人设置中覆盖。' },
                { id: 'DefaultSubtitleFont', prop: 'DefaultSubtitleFont', type: 'select', perUser: true, default: 0, label: '默认字幕字体',
                  options: [['0', '默认'], ['1', 'Noto Sans'], ['2', '无衬线体'], ['3', '打字机体'], ['4', 'Roboto']],
                  toConfig: (v) => parseInt(v, 10),
                  desc: '应用于新用户的默认字幕字体；用户可在个人设置中覆盖。' },
                { id: 'DefaultSubtitleTextEffect', prop: 'DefaultSubtitleTextEffect', type: 'select', perUser: true, default: 0, label: '默认字幕文字效果',
                  options: [['0', '自动'], ['1', '无'], ['2', '阴影'], ['3', '描边'], ['4', '描边 + 阴影']],
                  toConfig: (v) => parseInt(v, 10),
                  desc: '应用于新用户的默认字幕文字效果（描边 / 投影）；用户可在个人设置中覆盖。"自动"仅在字幕背景透明时添加阴影。' }
            ] }
        ]
    },
    'pb-timing': {
        title: '快捷键面板与提示消息时序', icon: 'timer',
        items: [
            { id: 'HelpPanelAutocloseDelay', prop: 'HelpPanelAutocloseDelay', type: 'number', default: 15000, min: 0, step: 1, label: '快捷键面板自动关闭延时（毫秒）',
              desc: 'Jellyfin Enhanced 快捷键/设置面板（<kbd>?</kbd> 键打开）无操作自动关闭的等待时长。默认 15000 毫秒（15 秒）。' },
            { type: 'button', id: 'jeTestShortcutsPanel', label: '预览自动关闭' },
            { id: 'ToastDuration', prop: 'ToastDuration', type: 'number', default: 3000, min: 0, step: 1, label: '提示消息持续时间（毫秒）',
              desc: '弹出的提示消息（如“随机播放已启用”、“书签已保存”）在屏幕上停留多久后淡出。默认 3000 毫秒（3 秒）。' },
            { type: 'button', id: 'jeTestToast', label: '预览提示消息' }
        ]
    }
});

/* ===== pages ===== */
/* Pages tab sections. See jeAdmin.js for the field spec.
 * Every page feature card has the same shape: intro note, master switch, a "Where it appears" group, then options.
 * The placement checkboxes (native tab, Plugin Pages, Custom Tabs, auto-create) are rendered here as markup but are loaded and
 * saved by configPage.html's hand-written code (Custom Tabs sync, plugin detection, v12 hints), so they are not schema fields. */
(function () {
    'use strict';
    const PP = 'https://github.com/IAmParadox27/jellyfin-plugin-pages';
    const CT = 'https://github.com/IAmParadox27/jellyfin-plugin-custom-tabs';
    const ppLink = `<a class="sectionTitle" href="${PP}" target="_blank">Plugin Pages</a>`;
    const PP_NOTE = '<strong>Note:</strong> Plugin Pages 3.0 or newer applies this without a Jellyfin restart. Older versions need one after enabling this option for the first time.';
    const PP_BADGE = '<span class="je-installed-badge" data-plugin="pluginpages"><i class="material-icons" aria-hidden="true">check_circle</i>Plugin Pages detected</span>';
    const CT_BADGE = '<span class="je-installed-badge" data-plugin="customtabs"><i class="material-icons" aria-hidden="true">check_circle</i>Custom Tabs detected</span>';
    const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    /* o: p id prefix, en master toggle id, name, ppLabel, ppIntro, ctLabel, noun, hint (v12 hint id suffix), cls (embed div class), text (display text) */
    function placement(o) {
        const code = `<div class="${o.cls}"></div>`;
        const gate = `${o.p}UseCustomTabs,${o.en}`;
        const guide = `<details class="jea-howto"><summary>Custom Tabs setup guide ${CT_BADGE}</summary>`
            + `<p class="fieldDescription">Display the ${o.noun} in a Custom Tabs tab instead of the sidebar link.</p>`
            + `<p class="fieldDescription je-needs-customtabs">You need the <a class="sectionTitle" href="${CT}" target="_blank">Custom Tabs</a> plugin.</p>`
            + `<ol class="fieldDescription">`
            + `<li class="je-needs-customtabs">Install the <strong>Custom Tabs</strong> plugin and all its prerequisites.</li>`
            + `<li>Navigate to Dashboard &gt; Plugins &gt; Custom Tabs and add a new tab.</li>`
            + `<li>Add "Display Text" according to your preference (e.g., "${o.text}").</li>`
            + `<li>Copy the code below and paste it into the 'HTML Content' field.</li></ol>`
            + `<div class="je-copy-code-wrapper"><button class="je-copy-html-btn jea-btn" data-copy-text='${escAttr(code)}' type="button">`
            + `<i class="material-icons je-copy-icon">content_copy</i><span class="copy-btn-text je-copy-btn-text">Copy</span></button>`
            + `<pre class="je-code-pre"><code>${escAttr(code)}</code></pre></div>`
            + `<div class="fieldDescription">Already have Custom Tabs installed? <a class="sectionTitle je-custom-tabs-link" href="/web/#/configurationpage?name=Custom%20Tabs">Click here to configure it.</a></div>`
            + `</details>`;
        // Placement toggles are rendered here but loaded and saved by configPage.html (Custom Tabs sync, plugin detection, v12 hints).
        return {
            type: 'group', title: '显示位置', open: true, items: [
                { id: `${o.p}UseNativeTab`, type: 'toggle', manual: true, label: `Add ${o.name} as a native Home tab`,
                  desc: `Adds ${o.name} as its own tab on the Home page, no external plugin needed.<br/><strong>Recommended on Jellyfin 12's experimental layout</strong> (the default).` },
                { id: `${o.p}UsePluginPages`, type: 'toggle', manual: true, label: o.ppLabel, desc: `${o.ppIntro}<br/>${PP_NOTE} ${PP_BADGE}` },
                { id: `${o.p}UseCustomTabs`, type: 'toggle', manual: true, label: o.ctLabel, desc: guide },
                { type: 'html', html: `<div class="je-note-banner je-v12-tab-hint-banner" id="je-v12-hint-${o.hint}" style="display:none;"><i class="material-icons je-note-icon">info</i>`
                    + `<div>On Jellyfin 12, <strong>"Add ${o.name} as a native Home tab"</strong> is more reliable than Custom Tabs. The two cannot be enabled together.</div></div>` },
                { id: `${o.p}AutoCreateCustomTab`, type: 'toggle', manual: true, label: '自动添加 Custom Tabs 条目',
                  rowClass: 'je-customtabs-automanage', rowAttrs: { 'data-gated-by': gate }, descAttrs: { 'data-gated-by': gate },
                  desc: `Jellyfin Enhanced will create the matching Custom Tabs entry on save. Turning off "${o.ctLabel}" removes the entry; turning it back on re-creates it. Leave unchecked to manage the Custom Tabs entry yourself.` }
            ]
        };
    }

    const note = (html, icon) => ({ type: 'note', html: icon ? `<i class="material-icons je-info-icon">${icon}</i> ` + html : html });
    const T = (id, prop, label, desc, extra) => Object.assign({ id, prop, type: 'toggle', label, desc }, extra || {});
    const HC_DEFAULT = (id, label, desc, on) => T(id, id.charAt(0).toUpperCase() + id.slice(1), label, desc, on ? { default: true } : {});

    JEAdmin.define({
        'pages-bookmarks': {
            title: '书签', icon: 'bookmark',
            items: [
                note('<strong>用法：</strong>播放时按 <kbd class="je-kbd">B</kbd> 或点击书签图标保存当前时间。书签在进度条上显示为图钉（点击即跳转），并按 TMDB/TVDB id 记录，同一内容的不同文件版本通用。'),
                T('bookmarksEnabled', 'BookmarksEnabled', '启用书签功能',
                    '观看视频时保存自定义书签/时间点，方便快速跳回喜欢的场景或瞬间。', { main: true, default: true }),
                placement({ p: 'bookmarks', en: 'bookmarksEnabled', name: '书签', ppLabel: '用 Plugin Pages 承载书签库',
                    ppIntro: `Adds a "Bookmarks" link via ${ppLink}.`, ctLabel: '用 Custom Tabs 承载书签', noun: '书签库',
                    hint: 'bookmarks', cls: 'sections bookmarks', text: '书签' })
            ]
        },
        'pages-hidden-content': {
            title: '隐藏内容', icon: 'visibility_off',
            items: [
                note('<strong>Hidden Content</strong> lets users hide individual items from Home and Library views and browse them from a dedicated 隐藏内容页. Per-user state with a server-wide enable/disable kill switch.'),
                T('hiddenContentEnabled', 'HiddenContentEnabled', '启用隐藏内容',
                    '全服务器范围启用/禁用隐藏内容功能。禁用时，隐藏按钮、过滤、侧边栏导航与设置面板选项都会移除。用户数据保留，重新启用后恢复。', { main: true }),
                placement({ p: 'hiddenContent', en: 'hiddenContentEnabled', name: '隐藏内容', ppLabel: '用 Plugin Pages 承载隐藏内容',
                    ppIntro: `Replaces the default 隐藏内容页 with a ${ppLink} implementation.`, ctLabel: '用 Custom Tabs 承载隐藏内容',
                    noun: '隐藏内容页', hint: 'hiddenContent', cls: 'jellyfinenhanced hidden-content', text: '隐藏内容' }),
                T('hiddenContentAdmin', 'HiddenContentAdmin', 'Let admins view and manage other users\' hidden content',
                    'Adds a "user filter" dropdown on the 隐藏内容页 so an admin can see what any user has hidden, with an Edit toggle to unhide items or add new ones from the library or Seerr on that user\'s behalf. Turn this off if you don\'t want to edit/manage other users\' hidden content.', { default: true }),
                {
                    type: 'group', title: '新用户默认值', items: [
                        note('<strong>新用户默认值</strong>与 总览 &gt; 快捷操作 中的 <em>应用全部插件设置到每位用户</em> 共用此处设置。已有用户保持其当前设置，直到你执行应用。'),
                        HC_DEFAULT('hiddenContentDefaultEnabled', '默认为新用户启用隐藏内容',
                            '开启时，新用户的隐藏内容功能默认激活，可立即隐藏条目且过滤即时生效。关闭时，用户需自行开启。', true),
                        {
                            type: 'group', title: '隐藏按钮', open: true, items: [
                                HC_DEFAULT('hiddenContentDefaultShowHideButtons', 'Show "Hide" buttons by default',
                                    'When on, the Hide button shows up across the apps so users can hide things they don\'t want to see. When off, no Hide button appears anywhere, but users can still bring back items they\'ve already hidden from the 隐藏内容页.', true),
                                HC_DEFAULT('hiddenContentDefaultShowHideConfirmation', 'Show confirmation dialog before hiding',
                                    'When on, clicking Hide asks "are you sure?" first. Turn off for one-click hiding. Items can always be brought back from the 隐藏内容页.', true),
                                HC_DEFAULT('hiddenContentDefaultShowButtonJellyseerr', 'Show "Hide" button on Seerr search results',
                                    'Adds a Hide button to Seerr search and discover results, so users can hide a movie or show even before it\'s been added to their library.', true),
                                HC_DEFAULT('hiddenContentDefaultShowButtonDetails', 'Show "Hide" button on item details pages',
                                    'Adds a Hide button to the row of action buttons on movie, show, and episode detail pages.', true),
                                HC_DEFAULT('hiddenContentDefaultShowButtonLibrary', 'Show "Hide" button on library / home cards',
                                    'Adds a small eye icon to every poster on the home and library pages, so users can hide an item without opening it first. Off by default because some people find the icon on every poster busy.', false),
                                HC_DEFAULT('hiddenContentDefaultShowButtonCast', 'Show "Hide" button on cast / actor cards',
                                    'Adds a Hide button to actor cards. Hiding an actor hides every movie or show they appear in until you bring them back.', false)
                            ]
                        },
                        {
                            type: 'group', title: '隐藏条目的过滤范围', open: true, items: [
                                HC_DEFAULT('hiddenContentDefaultFilterLibrary', 'Filter Library & details pages',
                                    'When on, hidden items don\'t appear when users browse a library (Movies, Shows, etc.) or in the suggestion rows on a details page. Turn off if users still want to see hidden items while browsing.', true),
                                HC_DEFAULT('hiddenContentDefaultFilterSearch', 'Filter Search results',
                                    'When on, hidden items don\'t appear in search results. Off by default because most people still want to be able to search for something they hid in order to bring it back.', false),
                                HC_DEFAULT('hiddenContentDefaultFilterContinueWatching', 'Filter Continue Watching',
                                    'When on, hidden items don\'t appear in the Continue Watching row on the home page. Required for the "Remove from Continue Watching" button to actually do anything.', true),
                                HC_DEFAULT('hiddenContentDefaultFilterNextUp', 'Filter Next Up',
                                    'When on, hidden series don\'t appear in the Next Up row on the home page. Recommended on so a show users have hidden doesn\'t keep being suggested as the next thing to watch.', true),
                                HC_DEFAULT('hiddenContentDefaultFilterUpcoming', 'Filter Upcoming episodes',
                                    'When on, hidden series don\'t appear on the Upcoming Episodes page.', true),
                                HC_DEFAULT('hiddenContentDefaultFilterRecommendations', 'Filter Suggestions / recommendations',
                                    'When on, hidden items don\'t appear in the "Because you watched..." and "Suggested for you" rows on the home and details pages.', true),
                                HC_DEFAULT('hiddenContentDefaultFilterDiscovery', 'Filter Discovery',
                                    'When on, hidden items don\'t appear on the Discovery page (genre, similar, and recommended sections).', true),
                                HC_DEFAULT('hiddenContentDefaultFilterCalendar', 'Filter Calendar',
                                    'When on, hidden series don\'t show up on the Calendar page\'s list of upcoming episodes.', true),
                                HC_DEFAULT('hiddenContentDefaultFilterRequests', 'Filter Requests page',
                                    'When on, hidden items don\'t appear on the Requests page (the combined view of Sonarr, Radarr, and Seerr requests).', true)
                            ]
                        },
                        HC_DEFAULT('hiddenContentDefaultExperimentalHideCollections', 'Allow hiding collections, libraries, and playlists (experimental)',
                            '<strong>Warning:</strong> Extremely not recommended for average users. Will break things. Only turn this on if you 100% know what you want to use it for. Lets users hide whole collections, libraries, or playlists in addition to individual movies and shows.', false)
                    ]
                }
            ]
        },
        'pages-requests': {
            title: '请求页面', icon: 'download',
            items: [
                note('<strong>请求页</strong>在侧边栏显示请求按钮，提供 Sonarr/Radarr 活动下载与 Seerr 请求的专属视图。'
                    + '<div id="requestsPageRequirementsLine" style="display: none; margin-top: 10px;"><strong>Requirements:</strong> <span id="requestsPageRequirementsList">Configure Sonarr and/or Radarr, plus Seerr, URLs and API keys.</span></div>'),
                T('downloadsPageEnabled', 'DownloadsPageEnabled', 'Enable Requests Page',
                    'Adds a "Requests" link to the navigation showing active downloads and requests.', { main: true, default: true }),
                placement({ p: 'downloads', en: 'downloadsPageEnabled', name: '请求', ppLabel: '用 Plugin Pages 承载请求页',
                    ppIntro: `Replaces the default Requests page with a ${ppLink} implementation.`, ctLabel: '用 Custom Tabs 承载请求页',
                    noun: '请求页', hint: 'downloads', cls: 'jellyfinenhanced requests', text: '请求' }),
                T('showDownloadsInRequests', 'ShowDownloadsInRequests', 'Show Downloads in Requests Page',
                    'Shows active downloads from Sonarr/Radarr on the Requests page. (Requires *arr links and API keys to be configured)', { default: true }),
                T('downloadsFilterByUserRequests', 'DownloadsFilterByUserRequests', 'Filter Downloads by User Requests',
                    'When enabled, non-admin users only see downloads and requests they made themselves, regardless of their Seerr permissions. When disabled, all authenticated users can see every item in the download queue, and the request list follows each user\'s Seerr permissions.',
                    { default: true, showIf: 'showDownloadsInRequests' }),
                T('downloadsPageShowIssues', 'DownloadsPageShowIssues', 'Show Seerr Issues Section', 'Shows open/resolved Seerr issues beneath Requests.'),
                T('downloadsShowHistory', 'DownloadsShowHistory', 'Show Download History Section',
                    'Shows a bounded history of recently imported (or failed-to-import) Sonarr/Radarr downloads beneath Requests, so items that vanish from the active queue after finishing are still visible.', { default: true }),
                T('downloadsHistoryAdminOnly', 'DownloadsHistoryAdminOnly', 'Restrict Download History to Admins',
                    'When enabled, only Jellyfin administrators see the Download History section. Regular users won\'t see it at all.', { showIf: 'downloadsShowHistory' }),
                T('downloadsPagePollingEnabled', 'DownloadsPagePollingEnabled', 'Enable Auto-Refresh',
                    'Periodically refresh the Requests page so download progress updates without manual reload.', { default: true }),
                { id: 'downloadsPollIntervalSeconds', prop: 'DownloadsPollIntervalSeconds', type: 'number', min: 30, max: 300, default: 30, label: '轮询间隔（秒）',
                  desc: '自动刷新下载状态的频率。最小 30 秒，且仅在启用自动刷新时生效。',
                  showIf: 'downloadsPagePollingEnabled',
                  toConfig: (v) => { const n = Math.floor(Number(v)); return n >= 30 ? n : 30; } }
            ]
        },
        'pages-calendar': {
            title: '日历页面', icon: 'calendar_today',
            items: [
                note('<strong>日历页</strong>在侧边栏添加日历按钮，展示 Sonarr/Radarr 即将发布的内容。<br/><strong>前提：</strong>配置 Sonarr 和/或 Radarr 的地址与 API 密钥。'),
                T('calendarPageEnabled', 'CalendarPageEnabled', 'Enable Calendar Page',
                    'Adds a "Calendar" link to the navigation showing upcoming releases from Sonarr/Radarr.', { main: true, default: true }),
                placement({ p: 'calendar', en: 'calendarPageEnabled', name: '日历', ppLabel: '使用 Plugin Pages',
                    ppIntro: `Replaces the default Calendar page with a ${ppLink} implementation.`, ctLabel: '使用 Custom Tabs',
                    noun: '日历页', hint: 'calendar', cls: 'jellyfinenhanced calendar', text: '日历' }),
                { id: 'calendarFirstDayOfWeek', prop: 'CalendarFirstDayOfWeek', type: 'select', default: 'Monday', label: '每周第一天',
                  options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => [d, d]),
                  desc: '日历网格的第一列显示星期几。' },
                { id: 'calendarTimeFormat', prop: 'CalendarTimeFormat', type: 'select', default: '5pm/5:30pm', label: '时间格式',
                  options: [['5pm/5:30pm', '5pm/5:30pm'], ['17:00/17:30', '17:00/17:30']],
                  desc: '发行时间以 12 小时制（5pm）还是 24 小时制（17:00）格式显示。' },
                T('calendarHighlightFavorites', 'CalendarHighlightFavorites', 'Highlight Favorites/Watchlist', 'Show a golden border on calendar entries for items in your Jellyfin favorites.'),
                T('calendarHighlightWatchedSeries', 'CalendarHighlightWatchedSeries', 'Highlight Watched Series', 'Show a border on calendar entries for series you have watched episodes from.'),
                T('calendarFilterByLibraryAccess', 'CalendarFilterByLibraryAccess', 'Filter by Library Access',
                    'When enabled, the calendar only shows items from libraries the user has access to. Upcoming items not yet in Jellyfin are filtered based on their Sonarr/Radarr root folder.', { default: true }),
                T('calendarShowOnlyRequested', 'CalendarShowOnlyRequested', 'Show Requested Only (Default)',
                    'When enabled, the calendar will load showing only Requested items by default, but users can still change filters.'),
                T('calendarForceOnlyRequested', 'CalendarForceOnlyRequested', 'Force Only Requested Items',
                    'When enabled, the calendar always shows only your requested items and the Requests filter is hidden.')
            ]
        },
        'pages-recommendations': {
            title: 'Seerr 推荐页面', icon: 'auto_awesome',
            items: [
                note('<strong>Seerr Recommendations Page</strong> adds a dedicated view with Seerr-powered rows: Trending, Popular Movies, Popular TV Shows, Upcoming Movies and Upcoming TV Shows.<br/><strong>Requirements:</strong> Seerr integration must be configured and enabled.'),
                T('recommendationsPageEnabled', 'RecommendationsPageEnabled', 'Enable Recommendations Page',
                    'Adds a "Seerr Recommendations" link to the navigation showing Seerr discover rows.', { main: true }),
                placement({ p: 'recommendations', en: 'recommendationsPageEnabled', name: '推荐', ppLabel: '使用 Plugin Pages',
                    ppIntro: `Replaces the default Recommendations page with a ${ppLink} implementation.`, ctLabel: '使用 Custom Tabs',
                    noun: '推荐页', hint: 'recommendations', cls: 'jellyfinenhanced recommendations', text: '推荐' })
            ]
        },
        'pages-activity': {
            title: '动态', icon: 'history',
            items: [
                note('<strong>Activity Feed</strong> shows recently watched, favorited, and reviewed titles across the server. Each viewer only sees activity for items they themselves have library access to.'),
                T('activityFeedEnabled', 'ActivityFeedEnabled', 'Enable Activity Feed', 'Turns the feature on. While it\'s off, no activity is recorded or shown.', { main: true }),
                placement({ p: 'activityFeed', en: 'activityFeedEnabled', name: '活动', ppLabel: '使用 Plugin Pages',
                    ppIntro: `Adds an "Activity" link via ${ppLink}.`, ctLabel: '使用 Custom Tabs',
                    noun: '活动页', hint: 'activityFeed', cls: 'jellyfinenhanced activity', text: '活动' }),
                {
                    type: 'group', title: '显示内容', open: true, items: [
                        T('activityFeedShowWatched', 'ActivityFeedShowWatched', 'Show recently watched', 'Titles users finished watching.', { default: true }),
                        T('activityFeedShowFavorited', 'ActivityFeedShowFavorited', 'Show recently favorited', 'Titles users added to their favorites.', { default: true }),
                        T('activityFeedShowReviewed', 'ActivityFeedShowReviewed', 'Show recently reviewed', 'Titles users reviewed.', { default: true }),
                        T('activityFeedShowActiveStreams', 'ActivityFeedShowActiveStreams', 'Show Active Streams section',
                            'Adds a live "who\'s watching now" section to this page, independent of whether the Active Streams header widget (Extras tab) is shown. Still requires that feature\'s data collection to be enabled there.', { default: true })
                    ]
                },
                T('activityFeedOwnOnlyForNonAdmins', 'ActivityFeedOwnOnlyForNonAdmins', 'Non-admins only see their own activity',
                    'When enabled, regular users only see their own watched, favorited and reviewed entries. Administrators still see everyone.')
            ]
        },
        'pages-catchup': {
            title: '补看', icon: 'style',
            items: [
                note('<strong>Catch Up</strong> shows unwatched movies and shows as cards. Swipe right to mark watched, left to dismiss, up to add to your watchlist (the Likes flag) and down to open the title. Handy for finding out what people have already seen.'),
                T('catchUpEnabled', 'CatchUpEnabled', 'Enable Catch Up', 'Turns the feature on. Each user only sees titles they have library access to.', { main: true }),
                placement({ p: 'catchUp', en: 'catchUpEnabled', name: '补看', ppLabel: '使用 Plugin Pages',
                    ppIntro: `Adds a "Catch Up" link via ${ppLink}.`, ctLabel: '使用 Custom Tabs',
                    noun: '补看页', hint: 'catchUp', cls: 'jellyfinenhanced catchup', text: '补看' }),
                T('catchUpLogEnabled', 'CatchUpLogEnabled', 'Record Catch Up activity',
                    'Logs who swiped what (user, title, action and time) to <code>catchup-log.jsonl</code> in the plugin\'s configuration folder. Administrators can read it, with a per-user summary, in the Activity panel on the Catch Up page. The log is size-bounded (about 5&nbsp;MB per file, two files kept).', { default: true })
            ]
        }
    });
})();

/* ===== extras ===== */
/* Extras and Keyboard tab sections. See jeAdmin.js for the field spec. */
(function () {
    const shot = (alt, file, small) => '<details class="je-screenshot-details"><summary class="je-screenshot-summary">View Screenshot</summary>'
        + '<a href="https://cdn.jsdelivr.net/gh/n00bcodr/Jellyfin-Enhanced@main/docs/images/' + file + '" target="_blank">'
        + '<img alt="' + alt + '" class="' + (small ? 'je-screenshot-img-sm' : 'je-screenshot-img') + '" data-je-cdn="je-docs-img/' + file + '"/></a></details>';

    JEAdmin.define({
        'extras-ui': {
            title: '界面微调', icon: 'palette',
            items: [
                { id: 'coloredRatingsEnabled', prop: 'ColoredRatingsEnabled', type: 'toggle', label: '彩色评分背景',
                  desc: '为媒体分级套用彩色背景。如发现缺失或错误的分级，请向 <a class="sectionTitle" href="https://github.com/n00bcodr/Jellyfin-Enhanced/" target="_blank">Jellyfin-Enhanced</a> 提交 PR。' + shot('Colored Ratings Example', 'ratings.png') },
                { id: 'themeSelectorEnabled', prop: 'ThemeSelectorEnabled', type: 'toggle', label: '主题选择器（Jellyfish）',
                  desc: '添加主题选择器，快速切换 Jellyfish 配色主题。仅在原生使用 Jellyfish 时改变其配色，经 KefinTweaks 加载时无效。' + shot('Theme Selector Example', 'theme-selector.png') },
                { id: 'coloredActivityIconsEnabled', prop: 'ColoredActivityIconsEnabled', type: 'toggle', label: '彩色仪表盘图标',
                  desc: '将控制台活动图标替换为 Material Design 图标并加背景色。' + shot('Colored Activity Icons Example', 'colored-activity-icons.png') },
                { id: 'loginImageEnabled', prop: 'EnableLoginImage', type: 'toggle', label: '登录时显示头像',
                  desc: '手动登录界面显示用户头像而非用户名。选中用户后，头像会出现在密码框上方。' + shot('Login Image Example', 'login-image.png') },
                { id: 'pluginIconsEnabled', prop: 'PluginIconsEnabled', type: 'toggle', label: '自定义插件菜单图标',
                  desc: '替换控制台侧边栏插件文件夹的默认图标。当前替换（如已安装）：Jellyfin Enhanced、JavaScript Injector、Intro Skipper、Reports、JellySleep、Home Screen Sections、File Transformation、Jellyfin Helper、Newsletters、Segment Editor 和 Moonbase。' + shot('Plugin Icons Example', 'plugin-icons.png', true) }
            ]
        },
        'extras-streams': {
            title: '活动串流', icon: 'podcasts',
            items: [
                { id: 'activeStreamsEnabled', prop: 'ActiveStreamsEnabled', type: 'toggle', main: true, label: '页头活动播放流小组件',
                  desc: '在页头添加实时串流计数。点击打开面板，可查看谁在播放、在看什么、播放状态、进度及转码详情。默认仅管理员账号可见该挂件。' },
                { id: 'activeStreamsAllUsers', prop: 'ActiveStreamsAllUsers', type: 'toggle', label: '向非管理员显示小组件' }
            ]
        },
        'extras-links': {
            title: '外部链接', icon: 'link',
            items: [
                { id: 'letterboxdEnabled', prop: 'LetterboxdEnabled', type: 'toggle', main: true, label: '启用 Letterboxd 链接',
                  desc: '在电影和人物详情页添加 Letterboxd 链接。' },
                { id: 'showLetterboxdLinkAsText', prop: 'ShowLetterboxdLinkAsText', type: 'toggle', label: '以文本形式显示链接',
                  desc: '启用后以文字“Letterboxd”代替其图标显示。' }
            ]
        },
        'extras-metadata-icons': {
            title: '元数据图标与侧边栏链接', icon: 'extension',
            items: [
                { id: 'metadataIconsEnabled', prop: 'MetadataIconsEnabled', type: 'toggle', label: '启用元数据图标（Druidblack）',
                  fromConfig: (v) => !!v,
                  desc: '显示元数据图标而非文字。启用后，插件提供的链接（Letterboxd、*arr 链接）也用图标显示。' },
                { type: 'group', title: '侧边栏自定义链接', items: [
                    { id: 'customPluginLinks', prop: 'CustomPluginLinks', type: 'textarea', rows: 3, placeholder: '页面名称 | 图标名', label: '侧边栏自定义链接',
                      desc: '<strong>格式：</strong><code>配置页名称 | Material 图标名</code><br/>'
                          + '<strong>Important:</strong> Use the exact name that appears in the configuration page URL (e.g., "Jellyfin%20Tweaks" becomes "Jellyfin Tweaks").<br/>'
                          + '<a class="sectionTitle" href="https://fonts.google.com/icons?icon.set=Material+Icons" target="_blank">Browse Material Icons</a><br/>'
                          + 'Use "Test Links" to preview your links in the sidebar. They appear immediately and disappear on page refresh.' },
                    { type: 'button', id: 'testCustomPluginLinksBtn', label: '测试链接' }
                ] }
            ]
        },
        'extras-splash': {
            title: '启动画面覆盖', icon: 'wallpaper',
            items: [
                { id: 'enableCustomSplashScreen', prop: 'EnableCustomSplashScreen', type: 'toggle', main: true, label: '启用启动画面覆盖',
                  desc: '用下方指定的自定义图片 URL 替换 Jellyfin 的登录启动画面背景。' },
                { id: 'splashScreenImageUrl', prop: 'SplashScreenImageUrl', type: 'text', placeholder: '/web/assets/banner.png', label: '启动画面图片 URL',
                  desc: '启动画面图片的 URL。默认使用 Jellyfin 横幅。' },
                { type: 'note', tone: 'warn', html: 'Might cause strange behaviour if <a class="sectionTitle" href="https://github.com/IAmParadox27/jellyfin-plugin-media-bar" target="_blank">jellyfin-plugin-media-bar</a> is installed. All changes require a page refresh; if old settings persist, force clear the browser cache.' }
            ]
        },
        'extras-branding': {
            title: '自定义图像资源', icon: 'image', class: 'je-fieldset-wide',
            items: [
                { type: 'note', html: 'Uploaded icon / favicon / logo images are applied automatically at request time. Changes apply on next page load (a hard refresh may be needed if your browser cached the old image).' },
                { type: 'custom', html: '<div class="je-branding-grid">' + [
                    ['iconTransparent', 'Icon Transparent', 'The icon in the top-left beside the server version', '536×536px &nbsp;·&nbsp; PNG with transparency'],
                    ['favicon', 'Favicon', 'Favicon in the browser tab', '256×256px (.png) &nbsp;·&nbsp; ICO, PNG, or SVG'],
                    ['bannerDark', 'Banner Dark', 'Splash Screen Banner for Light Mode', '1302×378px &nbsp;·&nbsp; PNG, JPG, or WebP'],
                    ['bannerLight', 'Banner Light', 'Splash Screen Banner for Dark Mode', '1302×378px &nbsp;·&nbsp; PNG, JPG, or WebP'],
                    ['touchicon', 'Apple Touch Icon', 'Icon shown when adding to iOS Home Screen', '180×180px &nbsp;·&nbsp; PNG']
                ].map(([k, name, what, size]) => '<div class="je-branding-card">'
                    + '<label class="je-branding-label-bold">' + name + '</label>'
                    + '<label class="je-branding-label">' + what + '</label>'
                    + '<div class="je-branding-size-hint">' + size + '</div>'
                    + '<div class="je-branding-dropzone" id="' + k + 'DropZone">'
                    + '<input type="file" id="' + k + 'Input" accept="image/*" class="je-branding-file-input" />'
                    + '<div id="' + k + 'Placeholder" class="je-branding-placeholder"><i class="material-icons je-branding-placeholder-icon">image</i></div>'
                    + '<img id="' + k + 'Preview" class="je-branding-preview" style="display:none;" />'
                    + '<div id="' + k + 'Dimensions" class="je-branding-dimensions" style="display:none;"></div>'
                    + '<div id="' + k + 'Status" class="je-branding-status"></div>'
                    + '<button type="button" class="je-branding-delete" id="' + k + 'Delete" style="display:none;"><i class="material-icons">delete</i></button>'
                    + '</div></div>').join('') + '</div>' }
            ]
        },
        'keyboard': {
            title: '键盘快捷键', icon: 'keyboard',
            items: [
                { id: 'disableAllShortcuts', prop: 'DisableAllShortcuts', type: 'toggle', label: '禁用键盘快捷键',
                  desc: '禁用全部键盘快捷键，并隐藏增强面板中的“快捷键”标签页。' },
                { type: 'note', html: '<strong>Users can customize their own settings from the Enhanced Panel:</strong> press <code>?</code> (default shortcut), long-press the profile picture in the top-right corner, use the "Jellyfin Enhanced" link in the sidebar, or open it from the playback controls menu (mobile only).' },
                { type: 'html', html: '<div class="fieldDescription je-sc-help">Click a key, then press the new key combination (for example <kbd>Shift+A</kbd>). <b>Delete</b> disables the shortcut for every user, <b>Backspace</b> restores its default. Users can still change their own keys from their Enhanced Panel.</div>'
                    + '<div id="shortcut-error-comment" style="display: none; color: #ff6b6b; margin-top:5px;"></div>'
                    + '<div id="shortcut-grid"></div>' }
            ]
        }
    });
})();

/* ===== seerr ===== */
/* Seerr tab sections. See jeAdmin.js for the field spec. Fields marked manual are rendered here but still loaded
 * and saved by configPage.html (clamping, URL validation or multi-field logic). Native elements only. */
(function () {
    // Secret/key row: native input, a status icon span and a Test button, all keyed by id/class for the page's handlers.
    const keyRow = (id, name, label, statusId, btn, desc) =>
        '<div class="inputContainer jea-row"><label class="inputLabel" for="' + id + '">' + label + '</label>' +
        '<div class="jea-inline"><input id="' + id + '" name="' + name + '" type="text" class="jea-input" autocomplete="off"/>' +
        '<span id="' + statusId + '" class="material-icons"></span>' + btn + '</div></div>' +
        '<div class="je-setting-description" data-desc-for="' + id + '"><div class="fieldDescription">' + desc + '</div></div>';

JEAdmin.define({
    'seerr-connection': {
        title: 'Seerr 连接设置', icon: 'link', attrs: { 'data-dep-setup': '' },
        items: [
            { id: 'jellyseerrEnabled', prop: 'JellyseerrEnabled', type: 'toggle', main: true, label: '启用 Seerr 集成',
              desc: '启用本服务器的全部 Seerr 功能：Seerr 搜索结果、请求按钮、请求页面、自动请求与用户导入。任何 Seerr 功能都依赖此项。' },
            { id: 'jellyseerrUrls', type: 'textarea', manual: true, rows: 3, label: 'Seerr 地址（每行一条）',
              placeholder: 'http://192.168.1.10:5055\nhttps://jellyseerr.example.com',
              desc: '输入你的 Seerr 实例 URL，每行一个。脚本将使用第一个连接成功的地址。' },
            { type: 'custom', html: keyRow('JellyseerrApiKey', 'JellyseerrApiKey', 'Seerr API Key', 'jellyseerrStatusIndicator',
                '<button type="button" id="testJellyseerrBtn" class="jea-btn">Test</button>',
                'API key from Seerr. (Settings &gt; General Settings &gt; API Key)') },
            { type: 'custom', html: keyRow('jellyseerr_TMDB_API_KEY', 'TMDB_API_KEY', 'TMDB API Key', 'jellyseerrTmdbStatusIndicator',
                '<button type="button" class="testTmdbBtn jea-btn">Test</button>',
                'Your API key from The Movie DB (TMDB). <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">How to?</a><br/>TMDB API key for automatic movie collection requests and Seerr Collection Results. Shared with Elsewhere Settings') },
            { type: 'group', title: '高级地址映射', items: [
                { id: 'jellyseerrUrlMappings', type: 'textarea', manual: true, rows: 4, label: 'Seerr 地址映射',
                  placeholder: 'https://jellyfin.mydomain.com|https://jellyseerr.mydomain.com',
                  desc: '把 Jellyfin 地址映射到指定的 Seerr 地址以展示给用户。用户使用“结果标题链接到 Seerr 而非 TMDB”时，会按其访问 Jellyfin 所用的地址得到对应 Seerr 链接。<br/>格式：<code>JellyfinURL|SeerrURL</code>，每行一条。<br/>无匹配或留空时，使用上方第一个地址。' },
                { type: 'note', html: '<strong>URL Mapping Examples:</strong><br/>Remote access: <code>https://jellyfin.mydomain.com|https://jellyseerr.mydomain.com</code><br/>Local access: <code>http://192.168.1.10:8096|http://192.168.1.10:5055</code><br/>With base URL: <code>https://example.com/jellyfin|https://example.com/jellyseerr</code>' },
                { type: 'note', tone: 'warn', html: 'Make sure proper mappings are added to appropriate URLs in order for mobile clients to open Seerr links correctly.' },
                { type: 'note', html: '"<b>Enable Jellyfin Sign-In</b>" must be enabled in Seerr User Settings (/settings/users). All users must be imported to Seerr as Jellyfin users for them to be able to request content.' },
                { type: 'button', id: 'validateSeerrMappingsBtn', label: '校验映射' },
                { type: 'custom', html: '<div id="seerrMappingsValidationResult" style="display: none;"></div>' }
            ] },
            { type: 'note', html: '<b>Jellyfin Enhanced is not affiliated with Seerr.</b> Seerr is an independent project. This plugin only uses Seerr\'s public API to integrate request and discovery features into Jellyfin. Please report plugin issues to the <a href="https://github.com/n00bcodr/Jellyfin-Enhanced/issues" target="_blank" rel="noopener">Jellyfin Enhanced issue tracker</a>, not the Seerr team.' }
        ]
    },

    'seerr-search': {
        title: '搜索与请求', icon: 'search',
        items: [
            { id: 'jellyseerrShowSearchResults', prop: 'JellyseerrShowSearchResults', type: 'toggle', default: true, label: '在搜索中显示 Seerr 结果',
              desc: '在 Jellyfin 搜索中显示 Seerr 结果。<br/>用户可直接在 Jellyfin 里发现并请求缺失的电影和剧集。' },
            { id: 'jellyseerrSearchExcludeLibraryItems', prop: 'JellyseerrSearchExcludeLibraryItems', type: 'toggle', label: '排除媒体库中已有的搜索条目',
              desc: '隐藏媒体库中已有的 Seerr 搜索结果（标记为“可观看”的那些），包括仅部分季入库的剧集。<br/>关闭时，已有条目仍显示并链接到库内条目。' },
            { type: 'custom', html: '<div class="jea-note jea-note-warn" id="je-search-exclude-library-warning" style="display:none;"><strong>Warning:</strong> A movie in the library in a lower quality won\'t appear to request in higher quality like 4K, and a show with only some seasons won\'t appear to request the rest. Missing seasons can still be requested with the <strong>Request More</strong> button on the show\'s page, and anything can still be requested directly in Seerr.</div>' },
            { id: 'showCollectionsInSearch', prop: 'ShowCollectionsInSearch', type: 'toggle', default: true, label: '在 Seerr 结果中显示合集',
              desc: '在 Seerr 搜索结果中显示 TMDB 合集（如哈利·波特、漫威电影宇宙），并可一键请求整个合集。' },
            { id: 'jellyseerrEnable4kRequests', prop: 'JellyseerrEnable4KRequests', type: 'toggle', label: '启用 4K 请求',
              desc: '启用后，电影请求按钮带下拉菜单，可请求 4K 版本。' },
            { id: 'jellyseerrEnable4kTvRequests', prop: 'JellyseerrEnable4KTvRequests', type: 'toggle', label: '启用 4K 剧集请求',
              desc: '启用后，剧集请求按钮的下拉菜单会以 4K 模式打开按季请求窗口。' },
            { id: 'jellyseerrShowAdvanced', prop: 'JellyseerrShowAdvanced', type: 'toggle', label: '显示高级请求选项',
              desc: '允许用户在请求时选择服务器、质量和路径。仅对拥有 Seerr 高级请求（或管理请求）权限的用户显示。<br/>注意：会忽略 Seerr 中设置的覆盖规则。' },
            { id: 'jellyseerrSingleSeasonRequestOnly', prop: 'JellyseerrSingleSeasonRequestOnly', type: 'toggle', label: '一次仅允许请求一季',
              desc: '去掉“全选”，每次请求只能选一季。需要 Seerr 开启“部分请求”，否则 Seerr 本身会要求请求全部季。' },
            { id: 'jellyseerrShowQuotaInfo', prop: 'JellyseerrShowQuotaInfo', type: 'toggle', default: true, label: '显示请求配额信息',
              desc: '启用后，请求窗口会显示用户的请求用量徽章及下一个空位释放时间。配额错误会弹出详细说明而非一闪而过的提示。' }
        ]
    },

    'seerr-discovery': {
        title: '发现与界面附加功能', icon: 'explore',
        items: [
            { id: 'jellyseerrUseMoreInfoModal', prop: 'JellyseerrUseMoreInfoModal', type: 'toggle', label: '在“更多信息”弹窗中打开结果',
              desc: '启用后，点击 Seerr 结果标题或海报会打开应用内“更多信息”窗口。<br/>关闭则跳转到 Seerr 打开该条目。' },
            { id: 'jellyseerrAvailablePosterLinksToJellyfin', prop: 'JellyseerrAvailablePosterLinksToJellyfin', type: 'toggle', label: '将可用条目的海报直接链接到 Jellyfin',
              desc: '对媒体库中已有的 Seerr 结果，点击海报直接跳到 Jellyfin 条目（与标题链接行为一致）。若上方“以更多信息窗口打开结果”已启用，则已有条目的海报不再打开该窗口。' },
            { id: 'jellyseerrShowReportButton', prop: 'JellyseerrShowReportButton', type: 'toggle', label: '在条目上显示“报告问题”按钮',
              desc: '启用后，条目操作图标区会出现小的报告图标，用户可向 Seerr 上报播放/内容问题。' },
            { id: 'jellyseerrShowIssueIndicator', prop: 'JellyseerrShowIssueIndicator', type: 'toggle', label: '显示未解决问题指示器',
              desc: '启用后，若该条目在 Seerr 有未处理问题，报告按钮变橙色并显示数量徽章。' },
            { id: 'showElsewhereOnJellyseerr', prop: 'ShowElsewhereOnJellyseerr', type: 'toggle', label: '在海报上显示流媒体平台',
              desc: '在 Seerr 海报上显示可用的流媒体服务图标（按默认地区）。<br/><br/><b>需要在 Elsewhere 设置中配置 TMDB API 密钥</b>' },
            { id: 'jellyseerrShowDetailPageLink', prop: 'JellyseerrShowDetailPageLink', type: 'toggle', default: true, label: '在条目详情页显示 Seerr 链接',
              desc: '在电影/剧集详情页的外部链接行（TMDB/IMDb 图标及启用后的 *arr 链接所在行）添加 Seerr 标记，无论是否配置 *arr 链接都会显示。若上方“以更多信息窗口打开结果”已启用，点击它打开该窗口（状态、下载、请求人）；否则直接链接到 Seerr 的条目页。' },
            { id: 'jellyseerrShowDetailPageLinkAsText', prop: 'JellyseerrShowDetailPageLinkAsText', type: 'toggle', label: '以文本而非图标显示',
              desc: '把 Seerr 详情页链接渲染为文字“Seerr”而非图标。独立于 *arr 链接的“显示为文字”设置，即使 *arr 链接关闭也生效。' },
            { type: 'group', title: '条目页发现内容', items: [
                { id: 'jellyseerrShowSimilar', prop: 'JellyseerrShowSimilar', type: 'toggle', default: true, label: '显示相似条目',
                  desc: '在条目详情页显示来自 Seerr 的相似电影/剧集，最多 20 条。' },
                { id: 'jellyseerrShowRecommended', prop: 'JellyseerrShowRecommended', type: 'toggle', default: true, label: '显示推荐条目',
                  desc: '在条目详情页显示来自 Seerr 的推荐电影/剧集，最多 20 条。' },
                { id: 'jellyseerrShowRequestMoreOnSeries', prop: 'JellyseerrShowRequestMoreOnSeries', type: 'toggle', default: true, label: '在剧集上显示“请求更多”按钮',
                  desc: '当剧集在 Seerr 存在未请求的季时，在剧集详情页“季”标题旁显示“请求更多”按钮，无需经过搜索即可补请。' },
                { id: 'jellyseerrExcludeLibraryItems', prop: 'JellyseerrExcludeLibraryItems', type: 'toggle', default: true, label: '排除媒体库中已有的条目',
                  desc: '从相似/推荐结果中隐藏媒体库已有的条目。<br/>关闭时，已有条目仍显示并链接到库内条目。' },
                { id: 'jellyseerrExcludeBlocklistedItems', prop: 'JellyseerrExcludeBlocklistedItems', type: 'toggle', label: '排除黑名单条目',
                  desc: '启用后，Seerr 黑名单中的条目不会出现在相似/推荐建议里。' }
            ] },
            { type: 'group', title: '“更多”页发现内容', items: [
                { id: 'jellyseerrShowNetworkDiscovery', prop: 'JellyseerrShowNetworkDiscovery', type: 'toggle', default: true, label: '显示“该电视网的更多内容”',
                  desc: '浏览电视网络页（如 Netflix、HBO）时，显示该网络在 Seerr 可请求的其他内容。' },
                { id: 'jellyseerrShowGenreDiscovery', prop: 'JellyseerrShowGenreDiscovery', type: 'toggle', default: true, label: '显示“更多流派”',
                  desc: '浏览类型页（如动作、喜剧）时，显示该类型下 Seerr 可请求的其他内容。' },
                { id: 'jellyseerrShowTagDiscovery', prop: 'JellyseerrShowTagDiscovery', type: 'toggle', default: true, label: '显示“更多标签”',
                  desc: '浏览标签页（如烹饪、超级英雄）时，显示带该关键词的 Seerr 可请求内容。' },
                { id: 'jellyseerrShowPersonDiscovery', prop: 'JellyseerrShowPersonDiscovery', type: 'toggle', default: true, label: '显示“该演员的更多作品”',
                  desc: '浏览演员/人物页时，显示其 Seerr 影视作品列表（含未入库内容）。' },
                { id: 'jellyseerrShowCollectionDiscovery', prop: 'JellyseerrShowCollectionDiscovery', type: 'toggle', default: true, label: '显示合集中缺失的电影',
                  desc: '浏览合集页时，显示合集中尚未入库的电影并附请求按钮。' }
            ] }
        ]
    },

    'seerr-auto-season': {
        title: '自动按季请求', icon: 'playlist_add',
        items: [
            { id: 'autoSeasonRequestEnabled', prop: 'AutoSeasonRequestEnabled', type: 'toggle', main: true, label: '启用自动提前请求下一季',
              desc: '用户即将看完当前季时，自动在 Seerr 请求下一季。' },
            { id: 'autoSeasonRequestRequireAllWatched', prop: 'AutoSeasonRequestRequireAllWatched', type: 'toggle', label: '要求之前的剧集全部看过',
              desc: '要求阈值之前的所有集都已观看或标记为已看。例如阈值 2、全季 10 集：看到第 8 集时，第 1–7 集必须都已看完，防止直接跳到后面误触发请求。<br/>若用户跳集，可能导致请求不触发。' },
            { id: 'autoSeasonRequestThresholdValue', prop: 'AutoSeasonRequestThresholdValue', type: 'number', min: 1, max: 20, default: 2, label: '剩余集数阈值',
              toConfig: (v) => Math.trunc(v) || 2,
              desc: '当未观看的剧集数达到或低于此数字时请求下一季。默认：2 集。' },
            { type: 'note', html: 'Requests are triggered when users start or complete watching episodes.<br/>Set the threshold to 2-3 episodes to give time for downloading before users finish watching.<br/>Example: with threshold 2, when a user starts episode 8 of 10 of season 1, season 2 is requested.<br/>If a user has already triggered a request for a season, it is not requested again even if another user reaches the threshold.' }
        ]
    },

    'seerr-auto-movie': {
        title: '自动电影请求', icon: 'movie',
        items: [
            { id: 'autoMovieRequestEnabled', prop: 'AutoMovieRequestEnabled', type: 'toggle', main: true, label: '启用自动电影请求',
              desc: '按配置的触发条件自动请求合集中的下一部电影。<br/><strong>前提：</strong>必须配置 TMDB API 密钥。' },
            // Triggers map to one AutoMovieRequestTriggerType value, so these three stay loaded and saved by configPage.html.
            { id: 'autoMovieRequestTriggerOnStart', manual: true, type: 'toggle', label: '电影开始播放时',
              desc: '用户一开始播放电影就触发合集中下一部的自动请求。' },
            { id: 'autoMovieRequestTriggerOnMinutesWatched', manual: true, type: 'toggle', label: '观看 X 分钟后',
              desc: '选择一个或两个触发条件。两个都选时，满足任一即触发请求。' },
            { id: 'autoMovieRequestMinutesWatched', manual: true, type: 'number', min: 1, max: 180, placeholder: '20', label: '观看分钟数阈值',
              desc: '用户观看多少分钟后触发请求？取值 1–180 分钟。' },
            { id: 'autoMovieRequestCheckReleaseDate', prop: 'AutoMovieRequestCheckReleaseDate', type: 'toggle', default: true, label: '仅请求已上映的电影',
              desc: '启用后跳过尚未上映的影片，只请求已上映的电影。' },
            { id: 'autoMovieRequestQualityMode', prop: 'AutoMovieRequestQualityMode', type: 'select', default: 'default', label: '质量方案模式',
              options: [['default', '默认'], ['original', '原画质'], ['custom', '自定义']],
              desc: '<strong>默认：</strong>Seerr 使用其默认 Radarr 服务器与质量方案。<br/><strong>原方案：</strong>沿用所看电影当初的质量方案（找不到则回退默认）。<br/><strong>自定义：</strong>始终使用下方选定的 Radarr 服务器、质量方案与根目录。' },
            { id: 'autoMovieRequestFallbackOn4k', prop: 'AutoMovieRequestFallbackOn4k', type: 'toggle', default: true, label: '用默认画质配置替代 4K 配置',
              desc: '仅在质量方案模式为“原方案”时生效。若所看电影当初以 4K 方案请求，自动请求会改用 Seerr 默认方案，避免没有 4K 请求权限的用户请求失败或需要人工审批。若所有用户都有 4K 权限且想保留原 4K 方案，可关闭此项。' },
            { type: 'custom', html:
              '<div id="autoMovieRequestCustomSettings" class="jea-custom-box" style="display:none;">' +
                '<div class="inputContainer jea-row"><label class="inputLabel" for="autoMovieRequestServer">Radarr Server</label><select id="autoMovieRequestServer" name="autoMovieRequestServer" class="jea-input"></select></div>' +
                '<div class="inputContainer jea-row"><label class="inputLabel" for="autoMovieRequestProfile">Quality Profile</label><select id="autoMovieRequestProfile" name="autoMovieRequestProfile" class="jea-input"></select></div>' +
                '<div class="inputContainer jea-row"><label class="inputLabel" for="autoMovieRequestRootFolder">Root Folder</label><select id="autoMovieRequestRootFolder" name="autoMovieRequestRootFolder" class="jea-input"></select></div>' +
                '<div class="je-setting-description" data-desc-for="autoMovieRequestRootFolder"><div class="fieldDescription">These settings are only used when Quality Profile Mode is set to "Custom".</div></div>' +
              '</div>' },
            { type: 'note', html: 'Only works for movies that are part of a TMDB collection (e.g., <a class="je-bold-link" href="https://www.themoviedb.org/collection/86311" target="_blank">The Avengers Collection</a>, <a class="je-bold-link" href="https://www.themoviedb.org/collection/10" target="_blank">Star Wars Collection</a>).<br/>Automatically requests the next movie in the collection based on release order.<br/>Movies already available or requested are skipped.' }
        ]
    },

    'seerr-sync': {
        title: '最近添加同步到 Seerr', icon: 'sync',
        items: [
            { id: 'triggerSeerrScanOnItemAdded', prop: 'TriggerSeerrScanOnItemAdded', type: 'toggle', main: true, label: '添加新 Jellyfin 条目时触发 Seerr 最近添加扫描',
              desc: 'Jellyfin 报告新增媒体库条目时，启用此项会立即触发“Jellyfin 最近添加扫描”任务，即时更新请求状态而不用等下次调度。事件带防抖，批量导入只触发一次。<br/><strong>提示：</strong>启用后可把 Seerr 最近添加扫描频率拉长（60 分钟）以减少噪音。' },
            // Clamped to 5..3600 on save, so loaded and saved by configPage.html.
            { id: 'seerrScanDebounceSeconds', manual: true, type: 'number', min: 5, max: 3600, step: 1, label: '防抖（秒）',
              desc: '最后一个条目入库后再等多少秒才触发扫描。默认 60，范围 5–3600。' },
            { type: 'custom', html: '<div class="jea-actions"><button type="button" id="triggerSeerrScanNowBtn" class="jea-btn">Trigger scan now</button><span id="triggerSeerrScanNowStatus" class="material-icons" aria-hidden="true"></span></div>' +
              '<div class="je-setting-description" data-desc-for="triggerSeerrScanNowBtn"><div class="fieldDescription">Uses the Seerr URL and API key entered in the Connection Setup section above. If multiple URLs are configured, the first reachable one is used.</div></div>' }
        ]
    },

    'seerr-watchlist': {
        title: '观看列表', icon: 'bookmark_added',
        items: [
            { id: 'addRequestedMediaToWatchlist', prop: 'AddRequestedMediaToWatchlist', type: 'toggle', label: '将请求的媒体添加到观看列表',
              desc: '启用后，凡通过 Jellyfin Enhanced 的 Seerr 搜索请求的媒体，都会自动加入请求用户的稍后观看。<br/><strong>注意：</strong>需要安装 <a class="je-bold-link" href="https://github.com/ranaldsgift/KefinTweaks" target="_blank">KefinTweaks</a> 才能实际查看稍后观看条目。<span class="je-installed-badge" data-plugin="kefintweaks"><i class="material-icons" aria-hidden="true">check_circle</i>已检测到 KefinTweaks</span>' },
            { id: 'syncJellyseerrWatchlist', prop: 'SyncJellyseerrWatchlist', type: 'toggle', label: '同步 Seerr 观看列表 → Jellyfin',
              desc: '启用后，各用户 Seerr 稍后观看中的条目会自动同步到其 Jellyfin 稍后观看。<br/>同步频率在 控制台 &gt; 计划任务 &gt; “从 Seerr 同步稍后观看到 Jellyfin” 中配置。<br/><strong>注意：</strong>需要 <a class="je-bold-link" href="https://github.com/ranaldsgift/KefinTweaks" target="_blank">KefinTweaks</a> 来渲染稍后观看界面。<span class="je-installed-badge" data-plugin="kefintweaks"><i class="material-icons" aria-hidden="true">check_circle</i>已检测到 KefinTweaks</span>' },
            { id: 'syncJellyfinWatchlistToSeerr', prop: 'SyncJellyfinWatchlistToSeerr', type: 'toggle', label: '同步 Jellyfin 观看列表 → Seerr',
              desc: '启用后，用户 Jellyfin 稍后观看（<a class="je-bold-link" href="https://github.com/ranaldsgift/KefinTweaks" target="_blank">KefinTweaks</a>）中的条目会自动同步到其 Seerr 稍后观看。<br/>同步频率在 控制台 &gt; 计划任务 &gt; “从 Jellyfin 同步稍后观看到 Seerr” 中配置。<span class="je-installed-badge" data-plugin="kefintweaks"><i class="material-icons" aria-hidden="true">check_circle</i>已检测到 KefinTweaks</span>' },
            { id: 'preventWatchlistReAddition', prop: 'PreventWatchlistReAddition', type: 'toggle', default: true, label: '防止重新添加已移除的条目',
              desc: '启用后，条目只加入用户稍后观看一次。用户手动移除后，后续同步不会再自动加回。' },
            // Clamped to 1..3650 on save and shown only while the toggle above is on (handler in configPage.html).
            { id: 'watchlistMemoryRetentionDays', manual: true, type: 'number', min: 1, max: 3650, step: 1, label: '记忆保留天数',
              desc: '记住条目已处理多久之后才允许再次添加。<br/>超过该天数后，手动移除的条目（若未观看）只要仍在 Seerr 请求或 Seerr 稍后观看中，就会自动加回。<br/><strong>示例：</strong>30 天 = 一个月后可重新添加；365 天 = 记一年（推荐）；3650 天 = 记十年（近乎永久）。<br/>仅在启用“防止重新添加已移除条目”时生效。' }
        ]
    },

    'seerr-users': {
        title: '用户', icon: 'group_add',
        items: [
            { id: 'jellyseerrAutoImportUsers', prop: 'JellyseerrAutoImportUsers', type: 'toggle', label: '自动导入 Jellyfin 用户到 Seerr',
              desc: '自动把 Jellyfin 用户导入 Seerr，使其无需访问 Seerr 网站即可使用 Seerr 搜索。新用户首次使用 Seerr 搜索时导入；计划任务也会定期批量导入。已导入的用户会跳过。<br/>批量导入频率在 控制台 &gt; 计划任务 &gt; “导入 Jellyfin 用户到 Seerr” 中配置。' },
            { type: 'custom', html:
              '<details id="blockedUsersDetails" class="jea-group">' +
                '<summary>Blocked Users <span id="blockedUsersCount">(none)</span></summary>' +
                '<div class="jea-group-body">' +
                  '<div class="fieldDescription">Select users to exclude from Seerr import. Blocked users will never be looked up or imported. No API calls are made for them.</div>' +
                  '<div id="blockedUsersContainer" style="max-height: 200px; overflow-y: auto;"><span class="je-loading-text">Loading users...</span></div>' +
                  '<div id="blockedUsersScrollHint" style="display: none;">▼ scroll for more</div>' +
                '</div>' +
              '</details>' +
              '<input id="jellyseerrImportBlockedUsers" type="hidden" value=""/>' },
            { type: 'button', id: 'btnImportJellyseerrUsers', label: '立即导入用户', variant: 'primary' },
            { type: 'custom', html: '<div id="importUsersResult" style="display: none; margin-top:10px;"></div>' }
        ]
    },

    'seerr-audit': {
        title: '权限审计', icon: 'verified_user',
        items: [
            { type: 'note', html: 'Check which users are missing Seerr permissions required for the features you have enabled. Only users linked to a Seerr account are checked.' },
            { type: 'button', id: 'btnPermissionAudit', label: '运行审计', variant: 'primary' },
            { type: 'custom', html: '<div id="permissionAuditResult" style="display: none; margin-top: 1em;"></div>' }
        ]
    },

    'seerr-debug': {
        title: '调试与缓存', icon: 'bug_report',
        items: [
            { id: 'jellyseerrDisableCache', prop: 'JellyseerrDisableCache', type: 'toggle', label: '禁用服务端响应缓存',
              desc: '启用后，所有 Seerr 代理请求绕过服务端缓存、每次都从 Seerr 现取。适合测试，但会增加 Seerr 实例负载。<b>不建议日常使用。</b>' },
            { id: 'jellyseerrResponseCacheTtlMinutes', prop: 'JellyseerrResponseCacheTtlMinutes', type: 'number', min: 1, default: 10, label: '响应缓存 TTL（分钟）',
              toConfig: (v) => Math.trunc(v) || 10,
              desc: 'Seerr API 响应（搜索、发现、推荐）的缓存时长。默认：10 分钟。' },
            { id: 'jellyseerrUserIdCacheTtlMinutes', prop: 'JellyseerrUserIdCacheTtlMinutes', type: 'number', min: 1, default: 30, label: '用户 ID 缓存 TTL（分钟）',
              toConfig: (v) => Math.trunc(v) || 30,
              desc: 'Jellyfin → Seerr 用户 ID 映射的缓存时长。默认：30 分钟。' }
        ]
    }
});
})();

/* ===== arr ===== */
/* *arr tab sections. Sonarr/Radarr instance editors are custom items; their JS in configPage.html binds by id.
 * See jeAdmin.js for the field spec. */
JEAdmin.define({
    'arr-sonarr': {
        title: 'Sonarr', iconImg: 'selfhst/svg/sonarr.svg', attrs: { 'data-dep-setup': '' },
        items: [
            { type: 'note', html: 'Automated TV show collection management and monitoring. Add one instance per Sonarr server.' },
            { type: 'custom', html: '<div id="sonarrInstancesList"></div>'
                + '<div class="je-arr-action-row"><button id="addSonarrInstance" class="jea-btn" type="button">+ Add Sonarr instance</button>'
                + '<button type="button" id="validateSonarrMappingsBtn" class="jea-btn">Validate Mappings</button>'
                + '<button id="importSonarrFromSeerr" class="jea-btn" type="button">Import from Seerr</button></div>'
                + '<div id="sonarrSeerrImportPicker" class="je-arr-seerr-import-picker" style="display:none;"></div>'
                + '<div id="sonarrMappingsValidationResult"></div>' }
        ]
    },
    'arr-radarr': {
        title: 'Radarr', iconImg: 'selfhst/svg/radarr-light-hybrid-light.svg', attrs: { 'data-dep-setup': '' },
        items: [
            { type: 'note', html: 'Automated movie collection management and monitoring. Add one instance per Radarr server.' },
            { type: 'custom', html: '<div id="radarrInstancesList"></div>'
                + '<div class="je-arr-action-row"><button id="addRadarrInstance" class="jea-btn" type="button">+ Add Radarr instance</button>'
                + '<button type="button" id="validateRadarrMappingsBtn" class="jea-btn">Validate Mappings</button>'
                + '<button id="importRadarrFromSeerr" class="jea-btn" type="button">Import from Seerr</button></div>'
                + '<div id="radarrSeerrImportPicker" class="je-arr-seerr-import-picker" style="display:none;"></div>'
                + '<div id="radarrMappingsValidationResult"></div>' }
        ]
    },
    'arr-bazarr': {
        title: 'Bazarr', iconImg: 'selfhst/svg/bazarr.svg', attrs: { 'data-dep-setup': '' },
        items: [
            { type: 'note', html: 'Automated subtitle downloading and management for Sonarr and Radarr. Single instance, no API key, detail-page links only.' },
            { id: 'bazarrUrl', prop: 'BazarrUrl', type: 'text', label: 'Bazarr 地址', placeholder: 'e.g., http://192.168.100.100:6767',
              desc: '链接指向电影/剧集主页面；Bazarr 不支持条目深链。<br/>若 Bazarr 在认证代理（Authentik、Authelia、Cloudflare Access 等）之后，此处填内网地址（如 <code>http://bazarr:6767</code>），并用下方地址映射把用户侧链接重定向到公网地址。' },
            { id: 'bazarrUrlMappings', prop: 'BazarrUrlMappings', type: 'textarea', rows: 3, label: 'Bazarr 地址映射', placeholder: 'jellyfin_url|bazarr_url',
              desc: '把 Jellyfin 访问地址映射到 Bazarr 地址。格式：<code>jellyfin_url|bazarr_url</code>（每行一条）。' },
            { type: 'html', html: '<div class="je-arr-action-row"><button type="button" id="validateBazarrMappingsBtn" class="jea-btn">Validate Mappings</button></div><div id="bazarrMappingsValidationResult"></div>' }
        ]
    },
    'arr-shoko': {
        title: 'Shoko', iconImg: 'selfhst/svg/shoko-server.svg', attrs: { 'data-dep-setup': '' },
        items: [
            { type: 'note', html: 'Surfaces upcoming anime episodes from your Shoko Server collection on the Calendar page. Single instance, no admin-assigned name.' },
            { id: 'shokoUrl', prop: 'ShokoUrl', type: 'text', label: 'Shoko 地址', placeholder: 'e.g., http://192.168.100.100:8111',
              desc: '若 Shoko 位于认证代理之后（Authentik、Authelia、Cloudflare Access 等），此处填内网地址（如 <code>http://shoko:8111</code>），并用下方地址映射把用户侧链接重定向到公网地址。' },
            { id: 'shokoApiKey', prop: 'ShokoApiKey', type: 'text', showIf: 'shokoUrl', label: 'Shoko API 密钥',
              toConfig: (v) => (v || '').replace(/\s/g, ''),
              desc: '来自 Shoko 网页界面的 API 密钥（设置 &gt; API 密钥 &gt; 添加 API 密钥）。' },
            { type: 'group', showIf: 'shokoUrl', title: '日历显示的剧集类型', open: true, items: [
                { id: 'shokoShowEpisodes', prop: 'ShokoShowEpisodes', type: 'toggle', default: true, label: '剧集' },
                { id: 'shokoShowSpecials', prop: 'ShokoShowSpecials', type: 'toggle', label: '特别篇' },
                { id: 'shokoShowCredits', prop: 'ShokoShowCredits', type: 'toggle', label: '片头片尾（OP/ED）' },
                { id: 'shokoShowTrailers', prop: 'ShokoShowTrailers', type: 'toggle', label: '预告片' },
                { id: 'shokoShowParodies', prop: 'ShokoShowParodies', type: 'toggle', label: '恶搞篇' },
                { id: 'shokoShowOther', prop: 'ShokoShowOther', type: 'toggle', label: '其他',
                  desc: '哪些 AniDB 剧集类型会显示为日历事件。剧集默认开启，其余通常只是日历上的干扰信息。' }
            ] },
            { type: 'group', showIf: 'shokoUrl', title: '高级地址映射', items: [
                { id: 'shokoUrlMappings', prop: 'ShokoUrlMappings', type: 'textarea', rows: 3, label: 'Shoko 地址映射', placeholder: 'jellyfin_url|shoko_url',
                  desc: '把 Jellyfin 访问地址映射到 Shoko 地址。格式：<code>jellyfin_url|shoko_url</code>（每行一条）。' },
                { type: 'html', html: '<div class="je-arr-action-row"><button type="button" id="validateShokoMappingsBtn" class="jea-btn">Validate Mappings</button></div><div id="shokoMappingsValidationResult"></div>' }
            ] }
        ]
    },
    'arr-links': {
        title: '*arr 界面链接', icon: 'link',
        items: [
            { id: 'arrLinksEnabled', prop: 'ArrLinksEnabled', type: 'toggle', main: true, label: '在详情页启用 *arr 链接',
              desc: '在条目详情页显示其 Sonarr/Radarr/Bazarr 链接以便快速跳转。<strong>仅管理员可见</strong>。<br/>未配置地址的服务不显示链接。' },
            { id: 'showArrLinksAsText', prop: 'ShowArrLinksAsText', type: 'toggle', label: '以文本形式显示链接',
              desc: '将 *arr 链接渲染为纯文本标签，而不是图标按钮。' },
            { id: 'arrLinksShowStatusSingle', prop: 'ArrLinksShowStatusSingle', type: 'toggle', label: '为单实例显示状态徽章',
              desc: '关闭（默认）时，唯一匹配的 Sonarr/Radarr 实例只显示普通图标/文字。<br/>开启后还会显示集数（如 22/41）及表示下载状态的彩色左边框。多实例下拉菜单始终显示该详情。' }
        ]
    },
    'arr-tags': {
        title: '标签同步', icon: 'label',
        items: [
            { id: 'arrTagsSyncEnabled', prop: 'ArrTagsSyncEnabled', type: 'toggle', main: true, label: '启用标签同步',
              desc: '从上面配置的 Radarr/Sonarr 实例拉取全部标签并添加为 Jellyfin 标签。<br/><strong>注意：</strong>请在 控制台 &gt; 计划任务 &gt; “从 *arr 同步标签到 Jellyfin” 中运行并配置频率。' },
            { id: 'arrTagsPrefix', prop: 'ArrTagsPrefix', type: 'text', default: 'Requested by: ', label: '标签前缀', placeholder: 'JE *arr 标签：',
              desc: '在每个标签前添加的前缀（例如，填 “JE Arr Tag: ” 会得到 “JE Arr Tag: 1 - Jellyfish”）' },
            { id: 'arrTagsClearOldTags', prop: 'ArrTagsClearOldTags', type: 'toggle', default: true, label: '同步前清除旧标签',
              desc: '启用后，添加新标签前会先移除所有带此前缀的旧标签，保持与 *arr 应用同步。' },
            { id: 'arrTagsShowAsLinks', prop: 'ArrTagsShowAsLinks', type: 'toggle', default: true, label: '以链接形式显示已同步的标签',
              desc: '把带此前缀的标签在条目详情页渲染为可点击链接。若你的主题隐藏标签，这会有用。' },
            { type: 'group', title: '标签过滤', items: [
                { id: 'arrTagsSyncFilter', prop: 'ArrTagsSyncFilter', type: 'textarea', rows: 3, label: '同步到 Jellyfin 的标签过滤', placeholder: '每行一条',
                  desc: '只把指定的 *arr 标签同步到 Jellyfin。每行一个标签名（不含前缀）。<br/>留空则同步全部。<br/><strong>示例：</strong>只同步 “1 - Jellyfish” 和 “trakt”，则输入：<br/><code>1 - Jellyfish</code><br/><code>trakt</code>' },
                { id: 'arrTagsLinksFilter', prop: 'ArrTagsLinksFilter', type: 'textarea', rows: 3, label: '显示为链接的过滤', placeholder: '每行一条',
                  desc: '只把指定标签显示为链接。每行一个标签名（不含前缀）。<br/>留空则显示全部带前缀标签。<br/><strong>示例：</strong>只显示 “JE Arr Tag: 1 - Jellyfish” 和 “JE Arr Tag: trakt”，则输入：<br/><code>1 - Jellyfish</code><br/><code>trakt</code>' },
                { id: 'arrTagsLinksHideFilter', prop: 'ArrTagsLinksHideFilter', type: 'textarea', rows: 3, label: '隐藏指定链接的过滤', placeholder: '每行一条',
                  desc: '指定标签不显示为链接。每行一个标签名（不含前缀）。<br/>此过滤优先于上方“显示”过滤。<br/><strong>示例：</strong>隐藏 “JE Arr Tag: spam_tag” 和 “JE Arr Tag: test_tag”，则输入：<br/><code>spam_tag</code><br/><code>test_tag</code>' }
            ] }
        ]
    }
});

/* ===== admin ===== */
/* Admin tab sections. Maintenance Mode and Usage Statistics keep their load/save in configPage.html (manual: true) because of
 * side effects (enable/disable calls, jeTouched, jeLoaded, JSON user list); only their markup is rendered here. */
JEAdmin.define({
    'analytics': {
        title: '使用统计',
        icon: 'insights',
        class: 'je-fieldset-wide',
        items: [
            { type: 'note', html: 'Fully opt-in and off by default. No URLs, API keys, usernames, filenames, or media titles are ever collected. Turning this on always includes just an anonymous install ID, plugin version, and Jellyfin version/target, enough to answer "how many installs are on the latest version." Untick all three options to share only that. Use the preview below to see exactly what would be sent, or read <a class="sectionTitle" href="https://n00bcodr.github.io/Jellyfin-Enhanced/advanced/community-analytics/" target="_blank" rel="noopener">what each option collects and why</a>.' },
            { id: 'analyticsEnabled', type: 'toggle', main: true, manual: true, label: '分享匿名使用统计',
              desc: '定期向 Jellyfin Enhanced 社区统计项目发送匿名报告。每个安装会获得一个随机 ID，不会泄露关于你或你服务器的任何信息。' },
            { type: 'custom', html: '<div id="analyticsSubOptionsContainer"></div>' },
            { id: 'analyticsShareFeatureFlags', type: 'toggle', manual: true, label: '功能开关状态（仅开/关）' },
            { id: 'analyticsShareUsageCounts', type: 'toggle', manual: true, label: '功能使用次数' },
            { id: 'analyticsShareDataSizes', type: 'toggle', manual: true, label: '数据文件大小（仅字节数，绝不包含内容）' },
            { id: 'analyticsReportIntervalDays', type: 'number', manual: true, min: 7, max: 30, step: 1, label: '上报间隔（天）',
              desc: '报告发送频率，7–30 天一次。' },
            { type: 'group', title: '预览与状态', items: [
                { type: 'custom', html:
                    '<div class="jea-actions"><button type="button" id="analyticsPreviewBtn" class="jea-btn">Preview</button></div>'
                    + '<div id="analyticsPreviewContainer" style="display:none"><div class="fieldDescription">This reflects what would be sent based on the selections above.</div>'
                    + '<pre id="analyticsPreviewJson" class="je-json-preview jea-pre"></pre></div>'
                    + '<div id="analyticsLastSent" class="fieldDescription"></div>' }
            ] }
        ]
    },

    'maintenance': {
        title: '维护模式',
        icon: 'construction',
        class: 'je-fieldset-wide',
        items: [
            { id: 'maintenanceModeEnabled', type: 'toggle', manual: true, label: '启用维护模式',
              desc: '启用后，保存时立即对受影响用户执行所选动作。Jellyfin 登录页会显示横幅。管理员<strong>绝不会</strong>受影响。关闭维护会自动恢复所有用户。' },
            { id: 'maintenanceModeDurationMinutes', type: 'number', manual: true, showIf: 'maintenanceModeEnabled', min: 0, max: 525600, step: 1, label: '持续时间（分钟）',
              desc: '0 = 一直保持到手动关闭。否则到期后自动结束维护：横幅实时倒计时，上方开关自动关闭。修改分钟数会重新计时；保存其他设置不会。' },
            { type: 'group', showIf: 'maintenanceModeEnabled', title: '消息', open: true, items: [
                { id: 'maintenanceModeMessage', type: 'textarea', manual: true, rows: 2, label: '登录页横幅消息',
                  placeholder: '服务器正在维护中，请稍后再试。',
                  desc: '以红色横幅显示在每页（登录页+主页）顶部。纯文本。可用 <code>{countdown}</code> 表示剩余时间、<code>{ends_at}</code> 表示结束时间；设置了时长且未用标记时，会自动追加剩余时间。' },
                { id: 'maintenanceModeNotificationMessage', type: 'textarea', manual: true, rows: 2, label: '活动会话通知',
                  placeholder: '服务器维护即将开始，请尽快结束当前操作，稍后再试。',
                  desc: '以 Jellyfin 原生弹窗发给所有正在观看的用户；覆盖全部客户端（网页/移动/TV）。支持与横幅相同的 <code>{countdown}</code> / <code>{ends_at}</code> 标记。' },
                { id: 'maintenanceModeRemindOnPlayback', type: 'toggle', manual: true, label: '开始播放时提醒',
                  desc: '维护期间，受影响的非管理员用户每次在任何客户端开始播放时，重发上述通知（含剩余时间）。每会话最多每 5 分钟一次。仅在账号<em>未</em>被禁用时有用。' }
            ] },
            { type: 'group', showIf: 'maintenanceModeEnabled', title: '执行动作', open: true, items: [
                { id: 'mmAction_accounts', type: 'toggle', manual: true, attrs: { checked: 'checked' }, label: '禁用用户账号',
                  desc: '维护结束前用户完全无法登录。' },
                { id: 'mmAction_remote', type: 'toggle', manual: true, label: '禁用远程连接',
                  desc: '阻止局域网以外的连接；局域网内仍可访问。' }
            ] },
            { type: 'group', title: '受影响用户', open: true, items: [
                { type: 'custom', html:
                    '<div class="jea-radio-list">'
                    + '<label class="jea-radio"><input type="radio" name="maintenanceModeUsers" id="mmUsers_all" value="all" checked/><span>All non-admin users</span></label>'
                    + '<label class="jea-radio"><input type="radio" name="maintenanceModeUsers" id="mmUsers_select" value="select"/><span>Select specific users</span></label>'
                    + '</div>'
                    + '<div id="je-mm-user-list" class="jea-userlist" style="display:none">'
                    + '<div class="jea-actions"><button type="button" id="je-mm-select-all" class="jea-btn">Select All</button><button type="button" id="je-mm-deselect-all" class="jea-btn">Deselect All</button></div>'
                    + '<div id="je-mm-users-inner"><div id="je-mm-users-loading" class="fieldDescription">Loading users...</div></div>'
                    + '</div>' }
            ] },
            { type: 'group', title: '每日定时', open: true, items: [
            { id: 'maintenanceScheduleEnabled', type: 'toggle', manual: true, label: '启用每日维护窗口',
              desc: '每天在下方设定的时间段（服务器本地时间）自动开关维护模式，可配独立的消息与动作，例如夜间扫库。使用上方<strong>受影响用户</strong>的选择。手动开关开启时优先；关闭定时会提前结束进行中的窗口。' },
            { type: 'custom', showIf: 'maintenanceScheduleEnabled', html:
                '<div class="jea-timepair">'
                + '<div class="inputContainer jea-row"><label class="inputLabel" for="maintenanceScheduleStart">Start time</label><input id="maintenanceScheduleStart" name="maintenanceScheduleStart" type="time" class="jea-input"/></div>'
                + '<div class="inputContainer jea-row"><label class="inputLabel" for="maintenanceScheduleEnd">End time</label><input id="maintenanceScheduleEnd" name="maintenanceScheduleEnd" type="time" class="jea-input"/></div>'
                + '</div>'
                + '<div id="mmScheduleSameTimeWarning" class="fieldDescription jea-warn-text" style="display:none">Start and end time must differ; the schedule is ignored until they do.</div>'
                + '<div id="mmServerTimeHint" class="fieldDescription"></div>' },
            { id: 'maintenanceScheduleMessage', type: 'textarea', manual: true, showIf: 'maintenanceScheduleEnabled', rows: 2, label: '定时横幅消息',
              placeholder: '媒体库正在更新，出现卡顿属正常现象。剩余时间：{countdown}',
              desc: '窗口生效期间显示的横幅。支持同样的 <code>{countdown}</code> / <code>{ends_at}</code> 标记。' },
            { id: 'maintenanceScheduleNotificationMessage', type: 'textarea', manual: true, showIf: 'maintenanceScheduleEnabled', rows: 2, label: '定时会话通知',
              placeholder: '媒体库正在更新，出现卡顿属正常现象。',
              desc: '窗口开始时发给活动会话的弹窗；开启提醒后，播放开始时也会发送。' },
            { type: 'group', showIf: 'maintenanceScheduleEnabled', title: '定时动作（两者都不勾则只显示横幅）', open: true, items: [
                { id: 'mmSchedAction_accounts', type: 'toggle', manual: true, label: '禁用用户账号' },
                { id: 'mmSchedAction_remote', type: 'toggle', manual: true, label: '禁用远程连接' }
            ] }
            ] }
        ]
    },

    'developer': {
        title: '开发者设置',
        icon: 'code',
        items: [
            { id: 'devMode', prop: 'DevMode', type: 'toggle', label: '开发者模式',
              desc: '禁用 JS 缓存，脚本总是从服务器重新拉取。默认关闭。' },
            { type: 'note', tone: 'warn', html: 'Do not change this if you do not know why you are changing it.' }
        ]
    }
});

/* ===== about ===== */
/* About tab: credits for the projects this plugin's features build on. */
JEAdmin.define({
    'credits': {
        title: '制作信息', icon: 'favorite',
        items: [
            { type: 'note', html: 'Jellyfin Enhanced builds on the work of other Jellyfin community projects. Thank you to their authors.' },
            { type: 'html', html: '<ul class="jea-credits">'
                + '<li><strong>Media Tags</strong><span>Based on <a href="https://github.com/BobHasNoSoul/Jellyfin-Qualitytags/" target="_blank" rel="noopener">Jellyfin-Qualitytags</a> by BobHasNoSoul</span></li>'
                + '<li><strong>Custom pause screen</strong><span>Based on <a href="https://github.com/BobHasNoSoul/Jellyfin-PauseScreen" target="_blank" rel="noopener">Jellyfin-PauseScreen</a> by BobHasNoSoul</span></li>'
                + '<li><strong>MDBList ratings</strong><span>Based on <a href="https://github.com/xroguel1ke/jellyfin_ratings" target="_blank" rel="noopener">jellyfin_ratings</a> by xroguel1ke</span></li>'
                + '<li><strong>Metadata icons</strong><span>Uses <a href="https://github.com/Druidblack/jellyfin-icon-metadata" target="_blank" rel="noopener">jellyfin-icon-metadata</a> by Druidblack</span></li>'
                + '</ul>' }
        ]
    }
});

/* ===== Services: linked copies of cards that live in their feature tabs ===== */
JEAdmin.define({
    'svc-tmdb': { mirrorOf: 'elsewhere-tmdb' },
    'svc-anilist': { mirrorOf: 'reviews-anilist' },
    'svc-mdblist': { mirrorOf: 'mdblist' },
    'svc-ddd': { mirrorOf: 'content-warnings' }
});
