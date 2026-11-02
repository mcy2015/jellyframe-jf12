import { el } from "./dom.ts";
import { confirmDialog } from "./confirm-dialog.ts";
import { createStatusMessage, type StatusState } from "./async-feedback.ts";
import { parseTimeInput, formatTimeInput } from "../utils.ts";
import { abortable, ignoreAbort, isAbortError } from "../lifecycle.ts";
import * as api from "../store/api.ts";
import type { SegmentDto, SegmentType } from "../types.ts";

/**
 * Inline multi-segment editor for one episode/movie: add, edit, delete and
 * restore segments through the plural segments API. Deleting an automatically
 * detected segment tombstones it server-side so re-analysis does not re-add it.
 */

export const MODE_OPTIONS: ReadonlyArray<{ value: SegmentType; label: string }> = [
    { value: "Introduction", label: "片头" },
    { value: "Credits", label: "片尾" },
    { value: "Recap", label: "回顾" },
    { value: "Preview", label: "预告" },
    { value: "Commercial", label: "广告" },
];

const MODE_ORDER: ReadonlyMap<string, number> = new Map(MODE_OPTIONS.map((m, i) => [m.value, i]));

export function sourceBadgeText(segment: SegmentDto): string {
    switch (segment.Source) {
        case "User":
            return "用户";
        case "Chapter":
            return "章节";
        case "Chromaprint":
            return "音频";
        case "BlackFrame":
            return "黑帧";
        case "CreditsDerived":
            return "派生";
        case "Combined":
            return "合并";
        case "KeyframeVisuals":
            return "卡片";
        case "Subtitle":
            return "字幕";
        default:
            return segment.Source.toLowerCase();
    }
}

export function sortSegments(segments: SegmentDto[]): SegmentDto[] {
    return [...segments].sort(
        (a, b) => (MODE_ORDER.get(a.Type) ?? 99) - (MODE_ORDER.get(b.Type) ?? 99) || a.Start - b.Start,
    );
}

function readRange(
    startInput: HTMLInputElement,
    endInput: HTMLInputElement,
    errorEl: HTMLElement,
): { start: number; end: number } | null {
    const start = parseTimeInput(startInput.value);
    const end = parseTimeInput(endInput.value);
    if (start === null || end === null) {
        errorEl.textContent = "请输入时间，例如 95.5 或 1:35.5";
        return null;
    }
    if (end <= start) {
        errorEl.textContent = "结束时间必须晚于开始时间";
        return null;
    }
    errorEl.textContent = "";
    return { start, end };
}

/** `signal` is the editor's lifetime; a mutation in flight when it aborts is abandoned. */
export function segmentEditor(opts: {
    itemId: string;
    initialSegments: SegmentDto[];
    onChanged: (segments: SegmentDto[]) => void;
    signal: AbortSignal;
}): { container: HTMLElement; isDirty: () => boolean } {
    const { signal } = opts;
    const container = el("div", { className: "ts-segment-editor" });
    const rowsEl = el("div", { className: "ts-segment-rows" });
    const status = createStatusMessage("ts-segment-status");

    let busy = false;
    // Last rendered segment list; used to compute a local fallback view when a
    // post-mutation reload fails.
    let current = opts.initialSegments;
    // Rebuilt alongside the rows; each entry reports whether its row's inputs
    // differ from the rendered segment (or, for the add row, hold typed input).
    let dirtyChecks: Array<() => boolean> = [];

    function setStatus(msg: string, state?: StatusState): void {
        status.show(msg, state);
    }

    // Serializes mutations: while one is in flight, further clicks are ignored.
    // An abort mid-mutation is the editor going away, not a failure.
    async function withBusy(fn: () => Promise<void>): Promise<void> {
        if (busy) return;
        busy = true;
        try {
            await fn();
        } catch (err) {
            if (!isAbortError(err)) throw err;
        } finally {
            busy = false;
        }
    }

    /**
     * Refreshes rows and pills after a mutation that already succeeded. When
     * the follow-up GET fails, renders `fallback` (the locally computed result
     * of the mutation) instead of leaving stale rows whose buttons would act
     * on segments that no longer exist; the next successful reload self-heals.
     */
    async function reloadAfterMutation(
        successMessage: string,
        fallback: SegmentDto[],
        overlap?: { type: SegmentType; start: number; end: number; excludeId?: string },
    ): Promise<void> {
        const result = await api.getEpisodeSegments(opts.itemId, signal);
        const segments = result.ok ? result.data : fallback;
        renderRows(segments);
        opts.onChanged(segments);
        if (result.ok) {
            setStatus(successMessage + overlapWarning(segments, overlap), "success");
        } else {
            setStatus(
                successMessage + " 重新加载失败；正在显示未经验证的本地结果。",
                "error",
            );
        }
    }

    function overlapWarning(
        segments: SegmentDto[],
        overlap?: { type: SegmentType; start: number; end: number; excludeId?: string },
    ): string {
        if (!overlap) return "";
        const overlapping = segments.some(
            (s) =>
                s.Type === overlap.type &&
                s.Id !== overlap.excludeId &&
                !s.Suppressed &&
                overlap.start < s.End &&
                s.Start < overlap.end,
        );
        // Overlaps are legal in the plural model; surface them as a warning only.
        return overlapping ? " 警告：与另一个 " + overlap.type + " 片段重叠。" : "";
    }

    function buildRow(segment: SegmentDto): HTMLElement {
        const row = el("div", { className: "ts-segment-row" + (segment.Suppressed ? " suppressed" : "") });
        const label = MODE_OPTIONS.find((m) => m.value === segment.Type)?.label ?? segment.Type;
        row.append(el("span", { className: "ts-segment-mode" }, label));

        const startInput = el("input", {
            className: "ts-segment-input",
            type: "text",
            value: formatTimeInput(segment.Start),
        });
        startInput.setAttribute("aria-label", label + " 开始");
        const endInput = el("input", {
            className: "ts-segment-input",
            type: "text",
            value: formatTimeInput(segment.End),
        });
        endInput.setAttribute("aria-label", label + " 结束");

        const badge = el("span", { className: "ts-pill-source" }, sourceBadgeText(segment));
        const errorEl = el("span", { className: "ts-segment-error" });

        if (segment.Suppressed) {
            startInput.disabled = true;
            endInput.disabled = true;
            const restoreBtn = el("button", { className: "ts-segment-btn", type: "button" }, "恢复");
            restoreBtn.addEventListener("click", () => withBusy(async () => {
                const response = await api.restoreEpisodeSegment(opts.itemId, segment.Id, signal);
                if (response.ok) {
                    const next = current.map((s) =>
                        s.Id === segment.Id ? { ...s, Suppressed: false } : s,
                    );
                    await reloadAfterMutation("片段已恢复。", next);
                } else {
                    setStatus(response.error, "error");
                }
            }));
            row.append(startInput, endInput, badge, el("span", { className: "ts-segment-hint" }, "已隐藏"), restoreBtn, errorEl);
            return row;
        }

        dirtyChecks.push(
            () =>
                startInput.value !== formatTimeInput(segment.Start) ||
                endInput.value !== formatTimeInput(segment.End),
        );

        const saveBtn = el("button", { className: "ts-segment-btn", type: "button" }, "保存");
        const deleteBtn = el("button", { className: "ts-segment-btn danger", type: "button" }, "删除");

        saveBtn.addEventListener("click", () => withBusy(async () => {
            const range = readRange(startInput, endInput, errorEl);
            if (range === null) return;
            const result = await api.updateEpisodeSegment(
                opts.itemId,
                segment.Id,
                { Start: range.start, End: range.end },
                signal,
            );
            if (result.ok) {
                const next = current.map((s) =>
                    s.Id === segment.Id ? { ...s, Start: range.start, End: range.end } : s,
                );
                await reloadAfterMutation("片段已保存。", next, {
                    type: segment.Type,
                    start: range.start,
                    end: range.end,
                    excludeId: segment.Id,
                });
            } else {
                errorEl.textContent = result.error;
            }
        }));

        const deleteSegment = async () => {
            if (busy) return;
            const confirmed = await abortable(
                confirmDialog({
                    title: "删除片段",
                    body: segment.Source === "User"
                        ? "这将永久删除该片段。"
                        : "这将隐藏自动检测到的片段，重新分析不会重新添加它。",
                    confirmLabel: "删除",
                }),
                signal,
            );
            if (!confirmed) return;
            await withBusy(async () => {
                const result = await api.deleteEpisodeSegment(opts.itemId, segment.Id, signal);
                if (result.ok) {
                    // Mirrors the server's delete rule (see confirm text above):
                    // user segments are removed, automatic ones are tombstoned.
                    const next = segment.Source === "User"
                        ? current.filter((s) => s.Id !== segment.Id)
                        : current.map((s) => (s.Id === segment.Id ? { ...s, Suppressed: true } : s));
                    await reloadAfterMutation("片段已删除。", next);
                } else {
                    setStatus(result.error, "error");
                }
            });
        };
        deleteBtn.addEventListener("click", () => void deleteSegment().catch(ignoreAbort));

        row.append(startInput, endInput, badge, saveBtn, deleteBtn, errorEl);
        return row;
    }

    function buildAddRow(): HTMLElement {
        const row = el("div", { className: "ts-segment-row ts-segment-add-row" });
        const select = el("select", { className: "ts-segment-select" });
        for (const mode of MODE_OPTIONS) {
            select.append(el("option", { value: mode.value }, mode.label));
        }
        select.setAttribute("aria-label", "新片段类型");

        const startInput = el("input", { className: "ts-segment-input", type: "text", placeholder: "开始" });
        startInput.setAttribute("aria-label", "新片段开始");
        const endInput = el("input", { className: "ts-segment-input", type: "text", placeholder: "结束" });
        endInput.setAttribute("aria-label", "新片段结束");
        const errorEl = el("span", { className: "ts-segment-error" });
        const addBtn = el("button", { className: "ts-segment-btn", type: "button" }, "添加");

        dirtyChecks.push(() => startInput.value.trim() !== "" || endInput.value.trim() !== "");

        addBtn.addEventListener("click", () => withBusy(async () => {
            const range = readRange(startInput, endInput, errorEl);
            if (range === null) return;
            const type = select.value as SegmentType;
            const result = await api.createEpisodeSegment(
                opts.itemId,
                { Type: type, Start: range.start, End: range.end },
                signal,
            );
            if (result.ok) {
                // reloadAfterMutation always re-renders, so the add row (and its
                // inputs) is rebuilt empty either way.
                const created = result.data;
                const next = created ? [...current, created] : current;
                await reloadAfterMutation("片段已添加。", next, {
                    type,
                    start: range.start,
                    end: range.end,
                    excludeId: created?.Id,
                });
            } else {
                errorEl.textContent = result.error;
            }
        }));

        row.append(select, startInput, endInput, addBtn, errorEl);
        return row;
    }

    function renderRows(segments: SegmentDto[]): void {
        current = segments;
        dirtyChecks = [];
        rowsEl.replaceChildren();
        for (const segment of sortSegments(segments)) {
            rowsEl.append(buildRow(segment));
        }
        rowsEl.append(buildAddRow());
    }

    container.append(rowsEl, status.element);
    renderRows(opts.initialSegments);

    return {
        container,
        // True while any editable row's inputs differ from the rendered segment
        // or the add row holds typed input; callers use this to avoid re-renders
        // that would discard unsaved edits.
        isDirty() {
            return !signal.aborted && dirtyChecks.some((check) => check());
        },
    };
}
