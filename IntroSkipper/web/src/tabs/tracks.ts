import type { Tab } from "../types.ts";
import { configForm } from "../components/config-form.ts";
import { el } from "../components/dom.ts";
import { patternField } from "../components/pattern-field.ts";

export const tracksTab: Tab = {
    id: "tracks",
    label: "音轨",
    render(container, signal) {
        const form = configForm(signal);

        container.append(
            el("h3", { className: "tracks-section-divider" }, "音频"),
            form.field("PreferredAudioLanguage"),
            form.field("PreferAudioStreamWithMostChannels"),
            form.field("ProbeAudioDuration"),
            el("h3", { className: "tracks-section-divider" }, "字幕"),
            form.field("SubtitleLanguages"),
            patternField(form, "SubtitleRecapPattern"),
            patternField(form, "SubtitlePreviewPattern"),
        );
    },
};
