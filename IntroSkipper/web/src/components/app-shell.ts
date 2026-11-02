import { validateAll } from "../config/validate.ts";
import { configStore } from "../store/config-store.ts";
import { bindStatusMessage, type StatusState } from "./async-feedback.ts";
import { confirmDashboard } from "./confirm-dialog.ts";
import { el } from "./dom.ts";

/** How long the "Changes saved" message stays visible (ms). */
const STATUS_CLEAR_MS = 3000;

/**
 * Header, tab sidebar, content area and the save footer. Everything it wires
 * up ends when `signal` aborts.
 */
export function createAppShell(
    rootEl: HTMLElement,
    signal: AbortSignal,
): {
    navEl: HTMLElement;
    contentEl: HTMLElement;
} {
    const shell = el("div", { className: "is-app-shell" });

    const skipLink = el("a", { className: "skip-link", href: "#settings-main" }, "跳到主要内容");

    const titleId = "app-title";
    const title = el("h1", { className: "app-title", id: titleId }, "Intro Skipper 配置");

    const header = el("header", { className: "app-header", "aria-labelledby": titleId });
    header.append(title);

    const sidebar = el("nav", { className: "app-sidebar", "aria-label": "设置分区" });

    const content = el("main", { className: "app-content", id: "settings-main", tabindex: "-1" });

    const footer = el("footer", { className: "app-footer", "aria-label": "保存控件" });

    const footerStatus = el("span", { className: "footer-status-message" });
    const status = bindStatusMessage(footerStatus);

    const dirtyIndicator = el(
        "span",
        { className: "dirty-indicator", "aria-live": "polite" },
        "有未保存的更改",
    );

    const saveButton = el(
        "button",
        { className: "save-button", type: "button", "aria-label": "保存配置" },
        "保存",
    );

    footer.append(footerStatus, dirtyIndicator, saveButton);
    shell.append(skipLink, header, sidebar, content, footer);
    rootEl.append(shell);

    let statusTimer: number | null = null;

    const setStatus = (text: string, state?: StatusState) => {
        if (statusTimer !== null) {
            window.clearTimeout(statusTimer);
            statusTimer = null;
        }

        status.show(text, state);

        if (state === "success") {
            statusTimer = window.setTimeout(() => {
                if (!configStore.isDirty()) {
                    status.clear();
                }
            }, STATUS_CLEAR_MS);
        }
    };

    const runSave = async () => {
        if (saveButton.disabled) return;

        saveButton.disabled = true;
        saveButton.textContent = "保存中…";
        setStatus("保存中…");

        try {
            await configStore.save();
            setStatus("更改已保存", "success");
        } catch {
            setStatus("保存失败", "error");
            window.Dashboard.alert("保存配置失败");
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "保存";
        }
    };

    const handleSave = async () => {
        const errors = validateAll(configStore.getAll());
        // Let the user save through warnings after an explicit confirmation.
        if (
            errors.size === 0 ||
            (await confirmDashboard("存在验证警告，仍要保存吗？", "验证"))
        ) {
            await runSave();
        }
    };

    skipLink.addEventListener(
        "click",
        (event) => {
            event.preventDefault();
            content.focus();
        },
        { signal },
    );
    saveButton.addEventListener(
        "click",
        () => {
            handleSave().catch(console.error);
        },
        { signal },
    );
    window.addEventListener(
        "beforeunload",
        (event) => {
            if (!configStore.isDirty()) return;
            event.preventDefault();
            event.returnValue = "";
        },
        { signal },
    );

    const updateDirtyIndicator = () => {
        const isDirty = configStore.isDirty();
        dirtyIndicator.toggleAttribute("data-dirty", isDirty);
        if (isDirty && footerStatus.dataset.state !== "error") {
            status.clear();
        }
    };

    const clearDirtyIndicator = () => {
        dirtyIndicator.removeAttribute("data-dirty");
    };

    // Keep the unsaved indicator aligned with the store lifecycle.
    configStore.subscribe("changed", updateDirtyIndicator, { signal });
    configStore.subscribe("saved", clearDirtyIndicator, { signal });
    configStore.subscribe("loaded", clearDirtyIndicator, { signal });

    signal.addEventListener(
        "abort",
        () => {
            if (statusTimer !== null) window.clearTimeout(statusTimer);
        },
        { once: true },
    );

    return { navEl: sidebar, contentEl: content };
}
