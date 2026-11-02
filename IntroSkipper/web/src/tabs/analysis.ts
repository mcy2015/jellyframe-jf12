import type { Tab } from "../types.ts";
import type { KeyOfKind } from "../config/schema.ts";
import { configStore } from "../store/config-store.ts";
import { el, htmlEl } from "../components/dom.ts";
import { configForm, type ConfigForm } from "../components/config-form.ts";

/** A min/max pair side by side. The ordering rule itself lives in the schema. */
function pairRow(
    form: ConfigForm,
    minId: KeyOfKind<"number">,
    maxId: KeyOfKind<"number">,
    visible?: () => boolean,
): HTMLElement {
    const row = el("div", { className: "side-by-side" }, form.field(minId), form.field(maxId));
    if (visible) form.visibleWhen(row, visible);
    return row;
}

export const analysisTab: Tab = {
    id: "analysis",
    label: "分析",
    render(container, signal) {
        const form = configForm(signal);

        const info = htmlEl(
            "div",
            { className: "field-description" },
            "<p>将分析每个媒体项内容的多少，由百分比和最长时长共同决定。取（时长 &times; 百分比，最长时长）二者中的较小值作为分析量。</p>" +
                "<p>如果修改了百分比或最长时长设置，则需要为希望使用新设置重新分析的每个剧集、季或电影<b>重新创建缓存的指纹和时间戳</b>。</p>" +
                "<p>提高上述任何一项设置都会使集分析耗时大幅增加。</p>",
        );

        const chaptersOff = () => configStore.get("FullLengthChapters") !== true;

        container.append(
            form.field("PreferChromaprint"),
            form.field("AnalysisPercent"),
            form.field("AnalysisLengthLimit"),
            info,
            pairRow(form, "MinimumRecapDuration", "MaximumRecapDuration"),
            pairRow(form, "MinimumRecapDetectionDuration", "MaximumRecapDetectionDuration"),
            pairRow(form, "MinimumIntroDuration", "MaximumIntroDuration"),
            pairRow(form, "MinimumCreditsDuration", "MaximumCreditsDuration"),
            form.field("MaximumMovieCreditsDuration"),
            pairRow(form, "MinimumPreviewDuration", "MaximumPreviewDuration", chaptersOff),
            pairRow(form, "MinimumCommercialDuration", "MaximumCommercialDuration", chaptersOff),
            form.field("FullLengthChapters"),
            form.field("EnhanceChapterCredits"),
        );
    },
};
