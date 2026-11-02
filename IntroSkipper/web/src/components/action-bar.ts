import { el } from "./dom.ts";
import { bindStatusMessage, withDashboardLoading } from "./async-feedback.ts";
import { confirmDialog, eraseCheckboxes } from "./confirm-dialog.ts";
import { formFor } from "./input-field.ts";
import { createOverrideStore, overrideKeys, overrideSchema } from "./season-overrides.ts";
import * as api from "../store/api.ts";
import type { AnalyzerActions, SeasonItem } from "../types.ts";
import { abortable, childScope, delay, ignoreAbort, isAbortError } from "../lifecycle.ts";

// Analyzer override choices per mode, in display order. Every mode accepts
// Default, Chapter and None; the middle entries are the extra analyzers.
const ANALYZER_MODES: ReadonlyArray<{
    key: keyof AnalyzerActions;
    label: string;
    actions: readonly string[];
}> = [
    { key: "Recap", label: "回顾", actions: ["Default", "Chapter", "Chromaprint", "None"] },
    { key: "Introduction", label: "片头", actions: ["Default", "Chapter", "Chromaprint", "None"] },
    {
        key: "Credits",
        label: "片尾",
        actions: ["Default", "Chapter", "Chromaprint", "BlackFrame", "None"],
    },
    { key: "Preview", label: "预告", actions: ["Default", "Chapter", "None"] },
    { key: "Commercial", label: "广告", actions: ["Default", "Chapter", "None"] },
];

const SEGMENT_EDITOR_PLUGIN_ID = "ace21d44a4e54a85ae75acd2e24a9574";

// Whether the Segment Editor plugin is installed and active. Looked up once per
// page lifetime; a failed lookup is not cached so the next action bar retries.
let segmentEditorActive: Promise<boolean> | null = null;

function isSegmentEditorActive(): Promise<boolean> {
    if (segmentEditorActive) return segmentEditorActive;
    const lookup = api.checkPlugins().then((result) => {
        if (!result.ok) {
            segmentEditorActive = null;
            return false;
        }
        return result.data.some((p) => p.Id === SEGMENT_EDITOR_PLUGIN_ID && p.Status === "Active");
    });
    segmentEditorActive = lookup;
    return lookup;
}

type ActionBarOptions = {
    onScanComplete: () => void | Promise<void>;
    /** The Timestamps tab's lifetime. The bar's listeners and subscriptions end with it. */
    signal: AbortSignal;
};

// How a watched scan ended. "unavailable" means the status endpoint kept
// failing, so the scan may still be running.
type ScanOutcome = "completed" | "failed" | "unavailable";

export function actionBar({ onScanComplete, signal }: ActionBarOptions): {
    container: HTMLElement;
    toggle: (open: boolean) => void;
    /**
     * Forgets the previous season the moment a show is opened, so nothing can
     * scan or erase it while the new show's seasons and episodes load.
     */
    prepareForShow: (showId: string) => void;
    /** Loads the season's overrides and scan state. `panel` is the season panel's lifetime. */
    loadForSeason: (
        showId: string,
        seasonId: string,
        isMovie: boolean,
        panel: AbortSignal,
        seriesSeasons?: readonly SeasonItem[],
    ) => Promise<void>;
} {
    const container = el("div", { className: "ts-action-bar" });
    container.id = "ts-action-panel";

    const actionSelects = new Map<keyof AnalyzerActions, HTMLSelectElement>();
    const analyzerGroup = el("div", { className: "ts-analyzer-group" });

    for (const mode of ANALYZER_MODES) {
        const item = el("div", { className: "ts-analyzer-item" });
        const selectId = "ts-analyzer-" + mode.key.toLowerCase();
        const labelEl = el(
            "label",
            { className: "ts-analyzer-label", for: selectId },
            mode.label,
        );
        const select = el("select", {
            id: selectId,
            name: "analyzer-" + mode.key.toLowerCase(),
        });
        for (const action of mode.actions) {
            select.append(el("option", { value: action }, action));
        }
        actionSelects.set(mode.key, select);
        item.append(labelEl);
        item.append(select);
        analyzerGroup.append(item);
    }

    // The per-season overrides: the second store the field controls bind to.
    const overrides = createOverrideStore();
    const overrideForm = formFor(overrideSchema, overrides, signal);

    const analysisWindow = el("fieldset", { className: "ts-analysis-window" });
    const analysisWindowLegend = el("legend", {}, "季覆盖设置");
    const analysisWindowDescription = el(
        "p",
        { className: "ts-action-description" },
        "可选的每季限制与检测设置。留空字段或选择 Global 将继承插件设置。",
    );
    const analysisWindowGrid = el("div", { className: "ts-analysis-window-grid" });
    analysisWindowGrid.append(
        overrideForm.field("AnalysisPercent"),
        overrideForm.field("AnalysisLengthLimit"),
    );
    const subtitleOverrideRow = el("div", { className: "ts-analysis-window-grid ts-subtitle-override-row" });
    subtitleOverrideRow.append(
        overrideForm.field("SubtitleRecapDetection"),
        overrideForm.field("SubtitlePreviewDetection"),
    );
    const resetWindowBtn = el(
        "button",
        { className: "ts-reset-overrides", type: "button" },
        "使用全局默认值",
    );
    resetWindowBtn.addEventListener(
        "click",
        () => {
            for (const key of overrideKeys) overrides.set(key, null);
        },
        { signal },
    );
    analysisWindow.append(
        analysisWindowLegend,
        analysisWindowDescription,
        analysisWindowGrid,
        subtitleOverrideRow,
        overrideForm.field("PreviewFromCreditsEnd"),
    );
    analysisWindow.append(resetWindowBtn);

    const applyBtn = el(
        "button",
        { className: "ts-action-btn apply", type: "button" },
        "保存覆盖",
    );
    const scanBtn = el(
        "button",
        { className: "ts-action-btn scan", type: "button" },
        "扫描季",
    );
    const eraseBtn = el(
        "button",
        { className: "ts-action-btn erase", type: "button" },
        "擦除季时间戳",
    );

    const fullSeriesId = "ts-full-series";
    const fullSeriesCheckbox = el("input", {
        type: "checkbox",
        id: fullSeriesId,
    });
    const fullSeriesLabel = el(
        "label",
        { className: "ts-full-series", for: fullSeriesId },
        "整个剧集",
    );
    fullSeriesLabel.prepend(fullSeriesCheckbox);

    const buttonsDiv = el("div", { className: "ts-action-buttons" });
    buttonsDiv.append(applyBtn, scanBtn, eraseBtn);

    const editorLink = el(
        "a",
        {
            className: "ts-action-editor-link",
            href: "#/dashboard/plugins/" + SEGMENT_EDITOR_PLUGIN_ID + "?name=Segment Editor",
        },
        "片段编辑器 →",
    );

    const topRow = el("div", { className: "ts-action-top-row" });
    topRow.append(analyzerGroup, editorLink);

    const scopeRow = el("div", { className: "ts-action-scope" });
    const scopeHint = el("span", { className: "ts-action-scope-hint" });
    scopeRow.append(fullSeriesLabel, scopeHint);
    const bottomRow = el("div", { className: "ts-action-bottom-row" });
    bottomRow.append(scopeRow, buttonsDiv);

    const statusEl = el("div", { className: "ts-action-status" });
    const statusMessage = bindStatusMessage(statusEl);

    container.append(topRow, analysisWindow, bottomRow, statusEl);

    let currentShowId = "";
    let currentSeasonId = "";
    let currentIsMovie = false;
    let currentSeriesSeasons: readonly SeasonItem[] = [];
    // False until the season's saved overrides arrive, and again after a failed
    // read, so Save cannot turn a transient failure into a destructive reset.
    let overridesLoaded = false;
    // The season panel the bar currently serves. Requests for it take this signal,
    // so a load or save abandoned by navigation stops at its next await.
    let panel: AbortSignal = signal;
    // The scan being watched, if any. A new scan or a new season load ends it.
    let scanScope: AbortController | null = null;

    function startScan(): AbortSignal {
        scanScope?.abort();
        scanScope = childScope(panel);
        return scanScope.signal;
    }

    function updateApplyAvailability(): void {
        applyBtn.disabled = currentIsMovie || !overridesLoaded;
        if (!overridesLoaded && !currentIsMovie) {
            applyBtn.title = "分析窗口设置仍在加载中。";
        } else {
            applyBtn.removeAttribute("title");
        }
    }

    function updateActionLabels(): void {
        scopeHint.textContent = fullSeriesCheckbox.checked
            ? "此剧集的所有季"
            : "仅当前季";
        scanBtn.textContent = currentIsMovie
            ? "扫描电影"
            : fullSeriesCheckbox.checked
              ? "扫描剧集"
              : "扫描季";
        eraseBtn.textContent = currentIsMovie
            ? "擦除电影时间戳"
            : fullSeriesCheckbox.checked
              ? "擦除剧集时间戳"
              : "擦除季时间戳";
    }

    function resetScanButton(): void {
        scanBtn.disabled = false;
        fullSeriesCheckbox.disabled = false;
        updateActionLabels();
    }

    function targetSeasonIds(): string[] {
        if (currentIsMovie || !fullSeriesCheckbox.checked || currentSeriesSeasons.length === 0) {
            return [currentIsMovie ? currentShowId : currentSeasonId];
        }

        return currentSeriesSeasons.map((season) => season.Id);
    }

    fullSeriesCheckbox.addEventListener("change", updateActionLabels, { signal });

    async function applyOverrides(): Promise<void> {
        if (!overridesLoaded) return;

        const error = overrides.firstError();
        if (error) {
            statusMessage.show(error, "error");
            return;
        }

        const operation = panel;
        const seasonIds = targetSeasonIds();
        const actions: AnalyzerActions = {};
        for (const [key, select] of actionSelects) {
            actions[key] = select.value;
        }
        const values = overrides.values();

        statusMessage.show("正在保存覆盖…");

        try {
            await withDashboardLoading(async () => {
                for (const seasonId of seasonIds) {
                    const response = await api.updateAnalyzerActions(seasonId, actions, operation);
                    if (!response.ok) {
                        throw new Error("更新分析器覆盖失败");
                    }
                    const windowResponse = await api.updateAnalysisOverrides(
                        seasonId,
                        values,
                        operation,
                    );
                    if (!windowResponse.ok) {
                        throw new Error("更新分析窗口失败");
                    }
                }
            });
            statusMessage.show("覆盖已更新。", "success");
        } catch (err) {
            if (isAbortError(err)) return;
            statusMessage.show("更新覆盖失败。", "error");
        }
    }

    // Waits for the season's queued scan. The scan may wait behind a running pass
    // for as long as that pass takes, so only repeated status failures end the
    // wait early. Rejects with an AbortError when `scan` aborts.
    async function awaitScan(seasonId: string, scan: AbortSignal): Promise<ScanOutcome> {
        const MAX_FAILURES = 30;
        const BASE_INTERVAL = 1000;
        const MAX_INTERVAL = 10_000;

        let failures = 0;
        let interval = BASE_INTERVAL;

        while (true) {
            await delay(interval, scan);
            const status = await api.getScanStatus(seasonId, scan);

            if (status.ok && status.data) {
                if (!status.data.isQueued) return status.data.failed ? "failed" : "completed";
                failures = 0;
                interval = BASE_INTERVAL;
                continue;
            }

            failures++;
            if (failures >= MAX_FAILURES) return "unavailable";
            interval = Math.min(interval * 2, MAX_INTERVAL);
        }
    }

    // Puts the buttons back and reports how the scan ended. onScanComplete owns
    // the refresh (and may withhold it over unsaved edits), so the message must
    // not claim one.
    async function finishScan(outcome: ScanOutcome): Promise<void> {
        resetScanButton();
        if (outcome === "unavailable") {
            statusMessage.show("扫描状态不可用。请刷新以查看结果。", "warning");
            return;
        }
        if (outcome === "failed") {
            statusMessage.show("扫描失败。请查看服务器日志。", "error");
        } else {
            statusMessage.show("扫描完成。", "success");
        }
        await Promise.resolve(onScanComplete());
    }

    async function runScan(): Promise<void> {
        const scan = startScan();
        scanBtn.disabled = true;
        fullSeriesCheckbox.disabled = true;
        const showId = currentShowId;
        const seasonIds = targetSeasonIds();
        const isSeriesScan = !currentIsMovie && fullSeriesCheckbox.checked;
        statusMessage.show("正在启动扫描…");
        try {
            for (let index = 0; index < seasonIds.length; index++) {
                const progress = isSeriesScan
                    ? " (" + String(index + 1) + "/" + String(seasonIds.length) + ")"
                    : "";
                statusMessage.show("正在启动扫描" + progress + "…");
                const response = await withDashboardLoading(() =>
                    api.scanSeason(showId, seasonIds[index], scan),
                );

                if (!response.ok) {
                    resetScanButton();
                    statusMessage.show("无法启动扫描。", "error");
                    return;
                }

                scanBtn.textContent = "扫描进行中…";
                statusMessage.show(
                    (isSeriesScan ? "正在扫描剧集" + progress : "扫描已加入队列") +
                        "…这可能需要几分钟。",
                );

                const outcome = await awaitScan(seasonIds[index], scan);
                if (outcome !== "completed") {
                    await finishScan(outcome);
                    return;
                }
            }

            await finishScan("completed");
        } catch (err) {
            if (isAbortError(err)) return;
            resetScanButton();
            statusMessage.show("无法启动扫描。", "error");
        }
    }

    async function eraseTimestamps(): Promise<void> {
        const isSeriesErase = !currentIsMovie && fullSeriesCheckbox.checked;
        const label = currentIsMovie ? "电影" : isSeriesErase ? "剧集" : "季";
        const showId = currentShowId;
        const seasonIds = targetSeasonIds();
        const result = await abortable(
            confirmDialog({
                title: "确认擦除时间戳",
                body: "确定要擦除此" + label + "检测到的时间戳吗？用户片段将被保留。",
                confirmLabel: "擦除",
                checkboxes: eraseCheckboxes,
            }),
            signal,
        );
        if (!result) return;
        eraseBtn.disabled = true;
        fullSeriesCheckbox.disabled = true;
        statusMessage.show("正在擦除时间戳…");
        try {
            for (const seasonId of seasonIds) {
                const response = await api.eraseSeasonTimestamps(showId, seasonId, result, signal);
                if (!response.ok) {
                    // Jellyfin can list seasons with no queued episodes. The
                    // season erase endpoint reports those as 404, which is a
                    // successful no-op for a full-series erase.
                    if (isSeriesErase && response.status === 404) continue;
                    statusMessage.show("擦除时间戳失败。", "error");
                    return;
                }
            }
            statusMessage.show("时间戳已擦除。", "success");
            await Promise.resolve(onScanComplete());
        } catch (err) {
            if (isAbortError(err)) return;
            statusMessage.show("擦除时间戳失败。", "error");
        } finally {
            eraseBtn.disabled = false;
            fullSeriesCheckbox.disabled = false;
        }
    }

    // Resolve the editor link at construction time so it's ready before the
    // user navigates to a specific season. A failed lookup leaves the generic
    // plugin page link in place.
    void isSegmentEditorActive().then((isActive) => {
        if (isActive && !signal.aborted) {
            editorLink.setAttribute("href", "#/configurationpage?name=Segment%20Editor");
        }
    });

    applyBtn.addEventListener("click", () => void applyOverrides().catch(ignoreAbort), { signal });
    scanBtn.addEventListener("click", () => void runScan().catch(ignoreAbort), { signal });
    eraseBtn.addEventListener("click", () => void eraseTimestamps().catch(ignoreAbort), { signal });

    return {
        container,

        toggle(open: boolean) {
            container.classList.toggle("open", open);
        },

        prepareForShow(showId) {
            scanScope?.abort();
            scanScope = null;
            currentShowId = showId;
            currentSeasonId = "";
            currentIsMovie = false;
            currentSeriesSeasons = [];
            fullSeriesCheckbox.checked = false;
            overridesLoaded = false;
            // No season yet: Scan and Erase stay off until loadForSeason.
            scanBtn.disabled = true;
            eraseBtn.disabled = true;
            fullSeriesCheckbox.disabled = false;
            updateActionLabels();
            updateApplyAvailability();
            statusMessage.clear();
        },

        async loadForSeason(showId, seasonId, isMovie, panelSignal, seriesSeasons) {
            panel = panelSignal;
            scanScope?.abort();
            scanScope = null;
            if (currentShowId !== showId) {
                fullSeriesCheckbox.checked = false;
                currentSeriesSeasons = [];
            }
            currentShowId = showId;
            currentSeasonId = seasonId;
            currentIsMovie = isMovie;
            overridesLoaded = false;
            if (seriesSeasons) {
                currentSeriesSeasons = seriesSeasons;
            }

            resetScanButton();
            eraseBtn.disabled = false;
            updateApplyAvailability();
            statusMessage.clear();

            // Analyzer overrides only apply to seasons, not single movies.
            analyzerGroup.style.display = isMovie ? "none" : "";
            applyBtn.style.display = isMovie ? "none" : "";
            fullSeriesLabel.style.display = isMovie ? "none" : "";
            scopeRow.style.display = isMovie ? "none" : "";
            analysisWindow.style.display = isMovie ? "none" : "";

            if (!isMovie) {
                const [result, overrideResult] = await Promise.all([
                    api.getAnalyzerActions(seasonId, panel),
                    api.getAnalysisOverrides(seasonId, panel),
                ]);

                const actions: AnalyzerActions = result.ok && result.data ? result.data : {};
                for (const [key, select] of actionSelects) {
                    select.value = actions[key] ?? "Default";
                }
                // On a failed read the last known values stay visible but Save
                // stays off.
                if (overrideResult.ok && overrideResult.data) {
                    overrides.load(overrideResult.data);
                    overridesLoaded = true;
                }
                updateApplyAvailability();
            }

            const status = await api.getScanStatus(seasonId, panel);
            if (!status.ok || !status.data) {
                return;
            }

            if (status.data.isQueued) {
                // This season's own scan is pending or running: wait for it the way a
                // click does, so the button comes back and the view refreshes when it
                // is done. Not awaited: the caller must not wait out the scan.
                scanBtn.disabled = true;
                fullSeriesCheckbox.disabled = true;
                scanBtn.textContent = "扫描进行中…";
                statusMessage.show("扫描进行中…这可能需要几分钟。");
                void awaitScan(seasonId, startScan()).then(finishScan).catch(ignoreAbort);
            } else if (status.data.isRunning) {
                // Another pass is running. It does not block a scan of this season: the
                // queue runs it once the pass ends, so the button stays enabled.
                statusMessage.show("扫描进行中…新扫描将排队等候。");
            }
        },
    };
}
