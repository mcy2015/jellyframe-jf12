// The one declaration of every plugin setting the dashboard edits. The
// PluginConfig type, the validator, the form controls and the tabs all read
// from here. Which tab shows a field, and in what order, is the tab's own
// business; a field's visibility rule stays with the tab too, because it needs
// the config store.

import type { FieldKind, FieldSchema, KeysOfKind, ValuesOf } from "./field-spec.ts";

const PATTERN_TAIL = "(?![\\s:]+End)(\\s|:|$)";

export const configSchema = {
    // General
    AutoDetectIntros: {
        kind: "checkbox",
        label: "自动分析新媒体",
        description:
            '启用后，新媒体添加到媒体库时将自动分析其中的可跳过片段<br/><br/>注意：要配置计划任务，请参阅<a href="#/dashboard/tasks">计划任务</a>。',
    },
    ReanalyzeSettledSeasons: {
        kind: "checkbox",
        label: "重新分析已稳定的季",
        description:
            "当某个季在设定的延迟时间内没有新剧集时，将重新分析该季（使用缓存的指纹），以便根据整季重新计算片段。媒体不会被重新解码。",
    },
    UseSettledSeasonChromaprintConsensus: {
        kind: "checkbox",
        label: "要求 Chromaprint 共识",
        description:
            "在已稳定季的重新分析期间，要求本地相连的剧集组共享相同的片头或片尾模式，该模式才会被接受为片段。",
    },
    SettledSeasonChromaprintConsensusEpisodes: {
        kind: "number",
        label: "共识剧集阈值",
        min: 2,
        max: 1000,
        step: 1,
        description:
            "确认共享模式所需的不同剧集目标数量。模式相近的组可降低该目标，使季中主题曲变化仍能达标；覆盖至少四分之三可用指纹的单个组也可在低于目标时达标。",
    },
    SettledSeasonDelayHours: {
        kind: "number",
        label: "已稳定季延迟（小时）",
        min: 0,
        max: 87600,
        step: 1,
        description:
            "在某季经过这么多小时仍无新增剧集后，将其视为已稳定。默认值为 24；每周更新的剧集应调大此值。",
    },
    UpdateMediaSegments: {
        kind: "checkbox",
        label: "扫描期间更新缺失片段",
        description:
            "启用此选项后，媒体库扫描期间将为所有未缓存的媒体更新媒体片段，包括最近添加、修改过或先前被跳过（但未被忽略）的文件。<br/><b>警告：</b>如果您使用 Intro Skipper 以外的媒体片段提供程序，应禁用此选项。",
    },
    SeriesExclusions: {
        kind: "list",
        label: "排除的剧集",
        placeholder: "剧集名称",
        description:
            "剧集名称精确匹配，不区分大小写。开始输入即可从您的媒体库中选择。",
    },
    MovieExclusions: {
        kind: "list",
        label: "排除的电影",
        placeholder: "电影名称",
        description:
            "电影名称精确匹配，不区分大小写。开始输入即可从您的媒体库中选择。",
    },
    PathExclusions: {
        kind: "list",
        label: "排除的路径",
        placeholder: "/media/library",
        description:
            "精确路径或所列根路径下的子路径。当服务器报告存储文件夹时，它们会作为建议显示。",
    },
    ScanIntroduction: { kind: "checkbox", label: "片头" },
    ScanCredits: { kind: "checkbox", label: "片尾" },
    ScanRecap: { kind: "checkbox", label: "回顾" },
    ScanPreview: { kind: "checkbox", label: "预告" },
    ScanCommercial: { kind: "checkbox", label: "广告" },
    AnalyzeSeasonZero: {
        kind: "checkbox",
        label: "分析第 0 季（特别篇 / 附赠内容）",
        description:
            "注意：同时包含 specials 和 extra 文件夹的剧集，会将 extras 识别为第 0 季并忽略 specials，此项设置对此不生效。",
    },
    UseFileTransformationPlugin: {
        kind: "checkbox",
        label: "使用 File Transformation 插件修补 Web 界面",
    },
    SkipbuttonHideDelay: {
        kind: "number",
        label: "跳过按钮隐藏延迟（秒）",
        min: 0,
        max: 1000,
        description:
            "跳过按钮自动隐藏前的时间（秒）。设为 0 表示跳过按钮持续显示（永不隐藏）。",
        warning:
            "注意：此设置仅适用于 Web 客户端（浏览器、LG webOS、启用了 Web 播放器的 Android 等）。可能需要刷新或清除缓存才能看到更改。",
    },
    AutoSkipIntro: {
        kind: "checkbox",
        label: "自动跳过片头",
        description:
            "自动跳过片头片段而不显示跳过按钮。已在 Jellyfin 设置中明确设置偏好的用户将保留其偏好。",
    },
    AutoSkipCredits: {
        kind: "checkbox",
        label: "自动跳过片尾/结尾",
        description:
            "自动跳过片尾/结尾片段而不显示跳过按钮。已在 Jellyfin 设置中明确设置偏好的用户将保留其偏好。",
    },
    SkipButtonVisibleSeconds: {
        kind: "number",
        label: "片段结束前隐藏跳过按钮（秒）",
        min: 0,
        max: 600,
        step: 1,
        description:
            "在片段结束前这么多秒隐藏跳过按钮。设为 0 可禁用此基于结束时间的限制。常规的跳过按钮隐藏延迟仍然生效。",
    },
    EnableMainMenu: {
        kind: "checkbox",
        label: "在主菜单中显示 Intro Skipper",
        description:
            "控制服务器主导航中 Intro Skipper 条目的显示。保存并刷新客户端（或清除缓存）后生效。",
    },

    // Analysis
    PreferChromaprint: {
        kind: "checkbox",
        label: "优先使用 Chromaprint 分析",
        description:
            "在章节分析器之前对片头和回顾运行 Chromaprint。片尾不受此设置影响。",
    },
    EnhanceChapterCredits: {
        kind: "checkbox",
        label: "增强章节片尾",
        description:
            "启用后，将识别出的片尾章节与黑帧和 Chromaprint 结果相结合，从而扩展片尾范围或找到额外的片段。片尾在下一次扫描前不会被重新分析。",
    },
    FullLengthChapters: {
        kind: "checkbox",
        label: "忽略章节的时长限制",
        description:
            "当章节标记超出其他用户设置（如百分比或时长）时，允许片段延伸至章节末尾。",
    },
    AnalysisPercent: {
        kind: "number",
        label: "分析的媒体百分比",
        min: 1,
        max: 50,
        description:
            "分析将限制在每个项目时长的此百分比内。例如，值 25（默认值）会将分析限制在每个项目的前四分之一。",
    },
    AnalysisLengthLimit: {
        kind: "number",
        label: "分析的最大时长（分钟）",
        min: 1,
        description:
            "分析将限制在每个项目时长的此时间内。例如，值 10（默认值）会将分析限制在每个项目的前 10 分钟。",
    },
    MinimumRecapDuration: {
        kind: "number",
        label: "最短回顾时长（秒）",
        min: 1,
        description:
            "短于此时长的回顾章节不会被视作回顾。",
    },
    MaximumRecapDuration: {
        kind: "number",
        label: "最长回顾时长（秒）",
        min: 1,
        description:
            "长于此时长的回顾章节不会被视作回顾。",
    },
    MinimumRecapDetectionDuration: {
        kind: "number",
        label: "检测到的最短回顾时长（秒）",
        min: 1,
        description: "短于此时长的黑帧/Chromaprint 回顾不会被检测到。",
    },
    MaximumRecapDetectionDuration: {
        kind: "number",
        label: "检测到的最长回顾时长（秒）",
        min: 1,
        description:
            "长于此时长的黑帧/Chromaprint 回顾将被截断或忽略。",
    },
    MinimumIntroDuration: {
        kind: "number",
        label: "最短片头时长（秒）",
        min: 1,
        description:
            "短于此时长的片段或听感相似的音频不会被视作片头。",
    },
    MaximumIntroDuration: {
        kind: "number",
        label: "最长片头时长（秒）",
        min: 1,
        description:
            "长于此时长的片段或听感相似的音频不会被视作片头。",
    },
    MinimumCreditsDuration: {
        kind: "number",
        label: "最短片尾时长（秒）",
        min: 1,
        description:
            "短于此时长的片段或听感相似的音频不会被视作片尾。",
    },
    MaximumCreditsDuration: {
        kind: "number",
        label: "最长片尾时长（秒）",
        min: 1,
        description:
            "长于此时长的片段或听感相似的音频不会被视作片尾。",
    },
    MaximumMovieCreditsDuration: {
        kind: "number",
        label: "电影片尾最长时长（秒）",
        min: 1,
        description: "长于此时长的片段不会被视作电影片尾。",
    },
    MinimumPreviewDuration: {
        kind: "number",
        label: "最短预告时长（秒）",
        min: 1,
        description: "短于此时长的片段不会被视作预告。",
    },
    MaximumPreviewDuration: {
        kind: "number",
        label: "最长预告时长（秒）",
        min: 1,
        description: "长于此时长的片段不会被视作预告。",
    },
    MinimumCommercialDuration: {
        kind: "number",
        label: "最短广告时长（秒）",
        min: 1,
        description:
            "短于此时长的片段不会被视作广告。",
    },
    MaximumCommercialDuration: {
        kind: "number",
        label: "最长广告时长（秒）",
        min: 1,
        description:
            "长于此时长的片段不会被视作广告。",
    },

    // Detection
    SnapToKeyframe: {
        kind: "checkbox",
        label: "启用关键帧对齐",
        description:
            "将片段结尾移动到最近的关键帧，使跳过落在清晰的画面上。直接取自章节的结尾仍停留在章节标记处。",
    },
    AdjustIntroBasedOnChapters: {
        kind: "checkbox",
        label: "启用章节对齐",
        description:
            "启用后，片段的开始和结束时间将被调整到最近的章节边界。",
    },
    AdjustIntroBasedOnSilence: {
        kind: "checkbox",
        label: "启用静音检测",
        description:
            "将片段结尾移动到调整窗口内的第一个静音处。直接取自章节的结尾仍停留在章节标记处。",
    },
    SilenceDetectionMaximumNoise: {
        kind: "number",
        label: "噪声容限",
        min: -90,
        max: 0,
        description: "以负分贝表示的噪声容限。",
    },
    SilenceDetectionMinimumDuration: {
        kind: "number",
        label: "最短静音时长",
        min: 0,
        step: 0.01,
        description: "调整片头结束时间前所需的最短静音时长（秒）。",
    },
    AdjustWindowInward: {
        kind: "number",
        label: "调整窗口（向内）",
        min: 0,
        description:
            "在检测到的片段内部寻找更佳起点或终点的最大查找秒数。值越大，可从开头或结尾修剪掉更多时间。",
    },
    AdjustWindowOutward: {
        kind: "number",
        label: "调整窗口（向外）",
        min: 0,
        description:
            "在检测到的片段之外寻找更佳起点或终点的最大查找秒数。值越大，可包含片段前后更多的时间。",
    },
    EndSnapThreshold: {
        kind: "number",
        label: "对齐剧集开始/结束的阈值",
        min: 0,
        description:
            "如果片段的开始或结束与剧集的开始或结束相差在此秒数以内，将被自动调整（对齐）以匹配剧集边界。设为 0 可禁用对齐。",
    },
    FirstEpisodeIntroMode: {
        kind: "select",
        label: "首集片头处理方式（按季）",
        options: [
            { value: "Analyze", label: "分析首集片头" },
            { value: "Ignore", label: "忽略首集片头" },
            { value: "IgnoreAnime", label: "忽略动画首集片头" },
        ],
        description:
            "为每个季选择是分析首集片头、忽略首集片头，还是仅在剧集为动画时忽略。",
    },
    AnimePreviewFromCreditsEnd: {
        kind: "checkbox",
        label: "将动画的片后场景设为预告",
        description:
            "启用且未检测到预告时，将从最后一个片尾块结束处到本集结束处创建一个片段。也可以在“时间戳 > 管理”中针对任意季或剧集切换此项。",
    },
    IntroStartOffset: {
        kind: "number",
        label: "片头开始偏移（秒）",
        min: 0,
        step: 0.5,
        description:
            "默认值：0。示例：若设为 3，跳过前将先播放片头的前 3 秒。",
    },
    IncludeIntroStartOffsetWhenSnapping: {
        kind: "checkbox",
        label: "对齐到剧集开头时包含开始偏移",
        description:
            "启用后，当检测到的片头开始对齐到剧集开头时，也会应用片头开始偏移。",
    },
    IntroEndOffset: {
        kind: "number",
        label: "片头结束偏移（秒）",
        min: 0,
        step: 0.5,
        description:
            "默认值：0。示例：若设为 3，播放将在片头结束前 3 秒处恢复。",
    },

    // Black frame
    DetectRecapUsingBlackFrames: {
        kind: "checkbox",
        label: "使用黑帧检测回顾",
        description:
            "当回顾章节检测失败时，在检测到的回顾时长限制内且位于片头之前的范围内，将回顾标记为从 0:00 到最近检测到的黑帧。",
    },
    AnchorRecapToColdOpen: {
        kind: "checkbox",
        label: "保留回顾之前的冷开场",
        description:
            '从共享的“前情回顾”提示之前的黑帧处（而非 0:00）开始 Chromaprint 回顾，这样回顾之前播放的场景就不会被跳过。仅由章节或黑帧得到的回顾仍从 0:00 开始。如果同时启用了上面的选项，Chromaprint 必须先运行（“分析”选项卡中的“优先使用 Chromaprint 分析”），否则黑帧回顾会在 Chromaprint 检测之前抢先在 0:00 处占据本集。',
    },
    // No tab renders this. The Black Frame tab reads it to decide which of the
    // legacy and modern toggles to show.
    UseLegacyBlackFrameAnalyzer: { kind: "checkbox", label: "使用旧版黑帧分析器" },
    RefineCreditsBoundary: {
        kind: "checkbox",
        label: "优化片尾边界",
        description:
            "使用帧级分析找到精确的片尾边界。禁用后分析更快，但仅有关键帧级别的精度。",
    },
    DetectNonBlackCredits: {
        kind: "checkbox",
        label: "检测卡片式片尾",
        description:
            "同时检测显示在近乎纯色卡片上的片尾：黑、白、灰或柔和色背景上的文字。结果会与黑帧及其他片尾候选合并，因此黑色滚动字幕前后的卡片式片尾也会被包含。鲜艳、高饱和度的背景不在覆盖范围内。",
    },
    UseChapterMarkersBlackFrame: {
        kind: "checkbox",
        label: "使用章节标记检测片尾",
        description:
            "启用后，将使用章节标记来识别片尾片段。通过在章节标记附近寻找黑帧来尝试检测片尾。",
    },
    BlackFrameMinimumPercentage: {
        kind: "number",
        label: "黑色像素最小百分比",
        min: 0,
        max: 100,
        description:
            "一帧中被视为黑帧所需的黑色像素最小百分比。默认值为 85。",
    },
    BlackFrameThreshold: {
        kind: "number",
        label: "黑帧阈值",
        min: 16,
        max: 255,
        description: "像素值低于此阈值即被视为黑色。默认值为 28。",
    },

    // Chapters
    UseEmbeddedChaptersForAnalysis: {
        kind: "checkbox",
        label: "使用内嵌章节进行分析",
        description:
            "从媒体文件中读取章节，而非 Jellyfin 的章节表，因此其他插件添加的章节将被忽略。更改此项后，下一次分析将对每个已分析的剧集执行一次探测，并仅重新分析文件与章节表中章节不一致的剧集。启用期间，每个已分析的剧集都会消耗一次 ffprobe。",
    },
    ChapterAnalyzerIntroductionPattern: {
        kind: "regex",
        label: "片头",
        description: "输入用于检测片头章节的正则表达式。",
        default:
            "(^[\\s0-9.\\u266A-]*|/\\s*)((Intro|Introduction)(\\s+Start)?:?$|(OP[0-9]*|Opening|Abertura|\\u30AA\\u30FC\\u30D7\\u30CB\\u30F3\\u30B0|(Main\\s+)?Titles?)(\\s+(Theme|Song|Music|Credits|Titles?|Sequences?|Start))?(?![\\s:]+End)\\s*($|[-\\u2013\\u2014/:(]))",
    },
    ChapterAnalyzerEndCreditsPattern: {
        kind: "regex",
        label: "片尾",
        description: "输入用于检测片尾章节的正则表达式。",
        default:
            "(^[0-9.\\s\\u266A]*|[+,;:]\\s*)((The\\s+)?Credits?|(Mixed\\s+)?(ED[0-9]*(v[0-9]+)?|Ending)|Outro|Closing|Cast\\s+List|Abspann|Encerramento|\\u30A8\\u30F3\\u30C7\\u30A3\\u30F3\\u30B0)(\\s+(Theme|Song|Music|Start))?(?![\\s:]+End)\\s*($|:|[-\\u2013\\u2014]\\s)|(^|[^a-z])(End|Ending|Closing|Early|Final)\\s+(Credits?|Titles?)(?![a-z])(?![\\s:]+End)",
    },
    ChapterAnalyzerPreviewPattern: {
        kind: "regex",
        label: "预告",
        description: "输入用于检测预告章节的正则表达式。",
        default:
            "(^|\\s)(Preview|PV|Sneak\\s?Peek|Coming\\s?(Up|Soon)|Next\\s+(time|on|episode)|Extra|Teaser|Trailer)" +
            PATTERN_TAIL,
    },
    ChapterAnalyzerRecapPattern: {
        kind: "regex",
        label: "回顾",
        description: "输入用于检测回顾章节的正则表达式。",
        default:
            "(^|[-\\u2013\\u2014|:.()\\[\\]])\\s*(Recap(?![a-z])(?![\\s:]+End)|(Last(\\s+(time|week|episode|season))?|Catch[ -]?up),?\\s+on(?![a-z])|" +
            "(Summary|Previously|Previous\\s+episode|Earlier|Last\\s+(time|week|episode|season)|Catch[ -]?up|(The\\s+)?(Story|Road)\\s+so\\s+far)(?![\\s:]+End)\\s*($|[-\\u2013\\u2014|:.()\\[\\]\\u2026]))|" +
            "(^|\\s)Previously,?\\s+(on|in)(?![a-z])",
    },
    ChapterAnalyzerCommercialPattern: {
        kind: "regex",
        label: "广告",
        description: "输入用于检测广告章节的正则表达式。",
        default: "(^|\\s)(Ad(vert(isement)?)?|Commercial|Intermission)" + PATTERN_TAIL,
    },
    EnableSponsorBlockChapterDetection: {
        kind: "checkbox",
        label: "启用 SponsorBlock 章节检测",
        description:
            "除上述正则表达式外，还检测已知的 SponsorBlock 章节标签。",
    },

    // Subtitles
    SubtitleLanguages: {
        kind: "text",
        label: "字幕语言",
        placeholder: "ger, eng",
        description:
            "要读取的语言代码，以逗号分隔。留空则读取全部。回顾的标题卡往往只在翻译字幕轨中有字幕，因此仅读取音频语言可能会漏掉它们。",
    },
    SubtitleRecapPattern: {
        kind: "regex",
        label: "字幕回顾正则表达式",
        description:
            "匹配文本字幕中提示回顾开始的字幕行。可在“时间戳 > 管理”中为某个季或剧集启用回顾匹配。",
        default:
            "\\bpreviously\\s+on|^\\W*(?:zuvor\\s+bei|zuletzt\\s+bei|was\\s+bisher\\s+geschah|bisher\\s+bei|anteriormente|previamente|précédemment|wat\\s+voorafging)|episodio?\\s+precedent[ei]|^\\W*前回までは|前情提要|지난\\s*이야기\\W*$",
    },
    SubtitlePreviewPattern: {
        kind: "regex",
        label: "字幕预告正则表达式",
        description:
            "匹配文本字幕中提示预告开始的字幕行。可在“时间戳 > 管理”中为某个季或剧集启用预告匹配。",
        default:
            "\\b(?:here(?:'|’)?s|now)\\s+the\\s+preview\\b|^\\W*(?:\\[[^\\]]*\\]|\\([^)]*\\)|[^\\s:]+:)?\\s*next\\s+time\\b",
    },
    // FFmpeg
    PreferredAudioLanguage: {
        kind: "text",
        label: "首选流音频语言",
        placeholder: "eng",
        description:
            "生成 Chromaprint 指纹时，优先选择具有此语言标签的音频流。留空或无匹配时将使用下方的流选择策略。",
    },
    PreferAudioStreamWithMostChannels: {
        kind: "checkbox",
        label: "优先选择声道数最多的音频",
        description:
            "启用后，Chromaprint 使用 FFmpeg 会选择的流：默认流优先，其次按声道数，再按流顺序。禁用后选择第一个流。",
    },
    ProbeAudioDuration: {
        kind: "checkbox",
        label: "探测音频时长以检测片尾",
        description:
            "当容器时长大于音频时长时，使用 ffprobe 让片尾指纹以第一个音频流的时长为准。",
    },
    MaxParallelism: {
        kind: "number",
        label: "最大并行度",
        min: 1,
        description: "并发分析的最大季数；每季内的剧集按顺序分析。",
    },
    ProcessPriority: {
        kind: "select",
        label: "FFmpeg 优先级",
        options: [
            { value: "Idle", label: "空闲" },
            { value: "BelowNormal", label: "低于正常" },
            { value: "Normal", label: "正常" },
            { value: "AboveNormal", label: "高于正常" },
            { value: "High", label: "高" },
            { value: "RealTime", label: "最高" },
        ],
        description:
            "分析用 FFmpeg 进程的优先级。“低于正常”可减少资源争用；“实时”可能让其他工作得不到资源。",
    },
    ProcessThreads: {
        kind: "number",
        label: "FFmpeg 编解码线程数",
        min: 0,
        max: 16,
        description:
            "每个 FFmpeg 进程的编解码线程数。0 表示由 FFmpeg 自行选择。值越低 CPU 占用越少，但可能减慢扫描；可使用“最大并行度”来限制进程数量。",
    },
    ScanTimeoutSeconds: {
        kind: "number",
        label: "FFmpeg 扫描超时（秒）",
        min: 0,
        description:
            "终止运行时间超过此值的指纹或检测扫描。慢速磁盘上的高码率媒体应调大此值。0 表示不限制。",
    },
    CacheCompressionLevel: {
        kind: "select",
        label: "缓存压缩级别",
        options: [
            { value: "NoCompression", label: "无压缩" },
            { value: "Fastest", label: "最快" },
            { value: "Optimal", label: "最佳" },
            { value: "SmallestSize", label: "最小体积" },
        ],
        description:
            "控制检测缓存的 Brotli 压缩级别。" +
            "压缩率越高，磁盘占用越少，但分析期间的 CPU 时间越多。" +
            "更改此项仅影响新缓存的数据。",
    },
} as const satisfies FieldSchema;

export type ConfigSchema = typeof configSchema;
export type ConfigKey = keyof ConfigSchema;

/**
 * The plugin configuration as the server sends it. Every schema key is
 * editable. The rest are only read: FileTransformationPluginEnabled is set by
 * the server, and the subtitle detection values are what a season without its
 * own subtitle override inherits.
 */
export type PluginConfig = ValuesOf<ConfigSchema> & {
    readonly FileTransformationPluginEnabled: boolean;
    readonly EnableSubtitleRecapDetection: boolean;
    readonly EnableSubtitlePreviewDetection: boolean;
};

/** Config keys whose value has type V, so a control binds only to keys it can hold. */
export type ConfigKeysOfType<V> = {
    [K in ConfigKey]: PluginConfig[K] extends V ? K : never;
}[ConfigKey];

/** Config keys whose schema entry has the given kind. */
export type KeyOfKind<Kd extends FieldKind> = KeysOfKind<ConfigSchema, Kd>;

export const configKeys = Object.keys(configSchema) as ConfigKey[];

export function isKind<Kd extends FieldKind>(key: ConfigKey, kind: Kd): key is KeyOfKind<Kd> {
    return configSchema[key].kind === kind;
}

/** Min/max field pairs that must stay ordered; validation flags both sides. */
export const orderedPairs = [
    ["MinimumIntroDuration", "MaximumIntroDuration"],
    ["MinimumCreditsDuration", "MaximumCreditsDuration"],
    ["MinimumRecapDuration", "MaximumRecapDuration"],
    ["MinimumRecapDetectionDuration", "MaximumRecapDetectionDuration"],
    ["MinimumPreviewDuration", "MaximumPreviewDuration"],
    ["MinimumCommercialDuration", "MaximumCommercialDuration"],
] as const satisfies readonly (readonly [ConfigKeysOfType<number>, ConfigKeysOfType<number>])[];
