import type { SegmentType, Tab } from "../types.ts";
import * as api from "../store/api.ts";
import { configStore } from "../store/config-store.ts";
import { el } from "../components/dom.ts";
import { confirmDialog, eraseCheckboxes } from "../components/confirm-dialog.ts";
import { MODE_OPTIONS } from "../components/segment-editor.ts";
import { tabWarning } from "../components/tab-warning.ts";

// The Global Timestamp Type value that erases every mode. The other values are
// the modes' SegmentType names.
const ALL_MODES = "all";

/**
 * Resolves a Global Timestamp Type value to the modes it erases and the words
 * the erase button and messages use for them.
 */
function eraseTarget(value: string): { modes: SegmentType[]; button: string; timestamps: string } {
    const mode = MODE_OPTIONS.find((option) => option.value === value);
    return mode
        ? {
              modes: [mode.value],
              button: `擦除所有 ${mode.label} 时间戳`,
              timestamps: `${mode.label.toLowerCase()}时间戳`,
          }
        : {
              modes: MODE_OPTIONS.map((option) => option.value),
              button: "擦除全部时间戳",
              timestamps: "全部类型的时间戳",
          };
}

export const toolsTab: Tab = {
    id: "tools",
    label: "工具",

    render(container) {
        const globalSelectId = "global-timestamp-type";
        const globalSelectGroup = el("div", { className: "select-container" });
        const globalSelectLabel = el(
            "label",
            { className: "select-label", for: globalSelectId },
            "全局时间戳类型",
        );
        const globalSelect = el("select", {
            id: globalSelectId,
            name: "global-timestamp-type",
        });
        for (const mode of MODE_OPTIONS) {
            globalSelect.append(el("option", { value: mode.value }, mode.label));
        }
        globalSelect.append(el("option", { value: ALL_MODES }, "所有类型"));
        globalSelectGroup.append(globalSelectLabel, globalSelect);

        const globalEraseBtn = el(
            "button",
            { className: "action-button danger", type: "button" },
            eraseTarget(globalSelect.value).button,
        );

        globalSelect.addEventListener("change", () => {
            globalEraseBtn.textContent = eraseTarget(globalSelect.value).button;
        });

        globalEraseBtn.addEventListener("click", async () => {
            const target = eraseTarget(globalSelect.value);
            const result = await confirmDialog({
                title: "确认擦除时间戳",
                body: "确定要擦除先前发现的" + target.timestamps + "吗？用户片段将被保留。",
                confirmLabel: "擦除",
                checkboxes: eraseCheckboxes,
            });
            if (!result) return;

            for (const mode of target.modes) {
                const response = await api.eraseTimestamps(mode, result);
                if (!response.ok) {
                    window.Dashboard.alert("无法擦除" + target.timestamps);
                    return;
                }
            }
            window.Dashboard.alert("已擦除" + target.timestamps);
        });

        const rebuildBtn = el(
            "button",
            { className: "action-button danger", type: "button" },
            "重建本地数据库",
        );
        rebuildBtn.addEventListener("click", async () => {
            const result = await confirmDialog({
                title: "确认重建数据库",
                body: "确定要重建数据库吗？此操作需要完整重启 Jellyfin 才能完成。",
                confirmLabel: "重建",
            });
            if (!result) return;
            let response = await api.rebuildDatabase();
            if (response.status === 409) {
                // The server refused because the existing database cannot be read
                // for backup; rebuilding means starting empty.
                const discard = await confirmDialog({
                    title: "数据库无法读取",
                    body: "无法读取现有数据库进行备份。重建将丢弃所有已存储的时间戳并从空数据库开始。是否继续？",
                    confirmLabel: "放弃并重建",
                });
                if (!discard) return;
                response = await api.rebuildDatabase({ forceCleanOnBackupFailure: true });
            }
            if (!response.ok) {
                window.Dashboard.alert("重建数据库失败");
                return;
            }
            window.Dashboard.alert(
                "数据库重建已启动。需要完整重启 Jellyfin。",
            );
        });

        const resetBtn = el(
            "button",
            { className: "action-button danger", type: "button" },
            "恢复默认设置",
        );
        resetBtn.addEventListener("click", async () => {
            const result = await confirmDialog({
                title: "确认重置设置",
                body: "将所有标签页中的每项设置重置为默认值，并丢弃所有未保存的更改？排除列表、媒体库选择、季与剧集覆盖以及注入的跳过按钮 CSS 将被保留。",
                confirmLabel: "重置",
            });
            if (!result) return;
            const response = await api.resetConfiguration();
            if (!response.ok) {
                window.Dashboard.alert("重置设置失败");
                return;
            }
            // The store reports its own load failure, so the reset is
            // confirmed only once the fields show the defaults.
            await configStore.load();
            window.Dashboard.alert("设置已重置为默认值");
        });

        container.append(
            globalSelectGroup,
            globalEraseBtn,
            rebuildBtn,
            tabWarning(
                "重建数据库需要完整重启 Jellyfin 才能完成，而不仅是重启控制台。",
            ),
            resetBtn,
        );
    },
};
