import type { FieldSchema, FieldStore, FieldStoreEvents, ValuesOf } from "../config/field-spec.ts";
import { configSchema } from "../config/schema.ts";
import { validateSpec } from "../config/validate.ts";
import { eventBus } from "../lifecycle.ts";
import { configStore } from "../store/config-store.ts";
import type { AnalysisOverrides } from "../types.ts";

// The plugin-wide value a season without its own subtitle override inherits.
function inheritedSubtitleDetection(key: "EnableSubtitleRecapDetection" | "EnableSubtitlePreviewDetection"): boolean {
    return configStore.isLoaded() && configStore.get(key);
}

// What the global setting currently is, shown where a blank override falls back to it.
function globalValue(key: "AnalysisPercent" | "AnalysisLengthLimit"): () => string {
    return () =>
        configStore.isLoaded() ? "全局：" + String(configStore.get(key)) : "全局默认";
}

/**
 * The per-season analysis overrides the action bar edits. Analysis limits
 * and subtitle detection inherit the plugin-wide values when null.
 */
export const overrideSchema = {
    AnalysisPercent: {
        kind: "number",
        label: "要分析的媒体时长比例",
        description: "每集时长的分析百分比。",
        min: configSchema.AnalysisPercent.min,
        max: configSchema.AnalysisPercent.max,
        step: 1,
        optional: true,
        placeholder: globalValue("AnalysisPercent"),
    },
    AnalysisLengthLimit: {
        kind: "number",
        label: "分析的时长上限（分钟）",
        description: "每集的时长上限。",
        min: configSchema.AnalysisLengthLimit.min,
        step: 1,
        optional: true,
        placeholder: globalValue("AnalysisLengthLimit"),
    },
    PreviewFromCreditsEnd: {
        kind: "select",
        label: "将片尾后场景设为预告",
        description:
            "未检测到其他预告时，以片尾后的时长作为后备预告。",
        options: [
            {
                value: null,
                label: () =>
                    configStore.isLoaded()
                        ? configStore.get("AnimePreviewFromCreditsEnd")
                            ? "全局：仅动画"
                            : "全局：已禁用"
                        : "全局默认",
            },
            { value: true, label: "启用" },
            { value: false, label: "禁用" },
        ],
    },
    SubtitleRecapDetection: {
        kind: "select",
        label: "基于字幕的回顾检测",
        description: "为该季或剧集启用基于字幕的回顾检测。",
        nullDisplayValue: () => inheritedSubtitleDetection("EnableSubtitleRecapDetection"),
        options: [
            { value: true, label: "启用" },
            { value: false, label: "禁用" },
        ],
    },
    SubtitlePreviewDetection: {
        kind: "select",
        label: "基于字幕的预告检测",
        description: "为该季或剧集启用基于字幕的预告检测。",
        nullDisplayValue: () => inheritedSubtitleDetection("EnableSubtitlePreviewDetection"),
        options: [
            { value: true, label: "启用" },
            { value: false, label: "禁用" },
        ],
    },
} as const satisfies FieldSchema;

type SchemaValues = ValuesOf<typeof overrideSchema>;
export type SeasonOverrides = Omit<SchemaValues, "SubtitleRecapDetection" | "SubtitlePreviewDetection">
    & Pick<AnalysisOverrides, "SubtitleRecapDetection" | "SubtitlePreviewDetection">;
type OverrideKey = keyof SeasonOverrides;

export const overrideKeys = Object.keys(overrideSchema) as OverrideKey[];

const EMPTY: SeasonOverrides = {
    AnalysisPercent: null,
    AnalysisLengthLimit: null,
    PreviewFromCreditsEnd: null,
    SubtitleRecapDetection: false,
    SubtitlePreviewDetection: false,
};

export type OverrideStore = FieldStore<SeasonOverrides> & {
    /** Replaces every value with the season's saved overrides and marks the store loaded. */
    load(values: AnalysisOverrides): void;
    values(): SeasonOverrides;
    /** The message of the first field that fails its rules, or null when all pass. */
    firstError(): string | null;
};

/** The second field store: one season's overrides, edited by the action bar. */
export function createOverrideStore(): OverrideStore {
    let values: SeasonOverrides = { ...EMPTY };
    let loaded = false;
    const errors = new Map<OverrideKey, string>();
    const bus = eventBus<FieldStoreEvents<OverrideKey>>();

    return {
        isLoaded: () => loaded,
        get: (field) => values[field],
        set<K extends OverrideKey>(field: K, value: SeasonOverrides[K]): void {
            values[field] = value;
            const error = validateSpec(overrideSchema[field], value);
            if (error) errors.set(field, error);
            else errors.delete(field);
            bus.emit("changed", { field });
            bus.emit("validation", { field, error });
        },
        subscribe: bus.on,
        load(next) {
            values = { ...next };
            loaded = true;
            bus.emit("loaded");
            // Saved overrides carry no error; take down what the previous season left showing.
            for (const field of errors.keys()) bus.emit("validation", { field, error: null });
            errors.clear();
        },
        values: () => ({ ...values }),
        firstError: () => errors.values().next().value ?? null,
    };
}
