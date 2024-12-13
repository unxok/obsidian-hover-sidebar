import { Notice, Plugin } from "obsidian";
import { text } from "./i18next";
import { ModifiedWorkspaceSideDock, patchMenu } from "./patchMenu";
import {
	HoverSidebarSettingTab,
	HoverSidebarSettings,
	defaultSettings,
} from "./settingsTab";
import { insertDebugLines, removeDebugLines } from "./debugLines";

export default class HoverSidebar extends Plugin {
	public settings: HoverSidebarSettings = { ...defaultSettings };
	private windowOutTimerRef: number | undefined = undefined;
	private leftCloseTimerRef: number | undefined = undefined;
	private rightCloseTimerRef: number | undefined = undefined;

	async onload(): Promise<void> {
		this.settings = await this.getSettings();
		this.addSettingTab(new HoverSidebarSettingTab(this));

		this.app.workspace.onLayoutReady(() => {
			this.updateFloating();
			patchMenu(this);
			if (this.settings.showDebugLines) {
				insertDebugLines(
					this.settings.leftTriggerDistance,
					this.settings.rightTriggerDistance
				);
			} else {
				removeDebugLines();
			}

			let calculatedWidth = getWindowWidth();
			const { rootSplit } = this.app.workspace;
			const leftSplit = this.app.workspace
				.leftSplit as ModifiedWorkspaceSideDock;
			const rightSplit = this.app.workspace
				.rightSplit as ModifiedWorkspaceSideDock;

			this.registerDomEvent(window, "resize", () => {
				calculatedWidth = getWindowWidth();
			});

			this.registerDomEvent(document.documentElement, "mouseleave", () => {
				if (!this.settings.windowOutEnabled) return;
				window.clearTimeout(this.windowOutTimerRef);
				this.windowOutTimerRef = window.setTimeout(() => {
					if (this.settings.leftSideEnabled && !leftSplit.pinned)
						leftSplit.collapse();
					if (this.settings.rightSideEnabled && !rightSplit.pinned)
						rightSplit.collapse();
				}, this.settings.windowOutDelay);
			});

			this.registerDomEvent(rootSplit.containerEl, "mousemove", (e) => {
				if (
					this.settings.leftSideEnabled &&
					!leftSplit.collapsed &&
					!leftSplit.pinned &&
					e.clientX > this.settings.leftTriggerDistance
				) {
					this.leftCloseTimerRef = window.setTimeout(() => {
						leftSplit.collapse();
					}, this.settings.leftCloseDelay);
				}
				if (
					this.settings.rightSideEnabled &&
					!rightSplit.collapsed &&
					!rightSplit.pinned &&
					e.clientX < calculatedWidth - this.settings.rightTriggerDistance
				) {
					this.rightCloseTimerRef = window.setTimeout(() => {
						rightSplit.collapse();
					}, this.settings.rightCloseDelay);
				}
			});

			this.registerDomEvent(rootSplit.containerEl, "mouseleave", () => {
				window.clearTimeout(this.leftCloseTimerRef);
				window.clearTimeout(this.rightCloseTimerRef);
			});

			this.registerDomEvent(document.body, "mousemove", (e) => {
				window.clearTimeout(this.windowOutTimerRef);
				if (isModalOrMenuOpen()) return;
				const { clientX } = e;
				if (
					this.settings.leftSideEnabled &&
					leftSplit.collapsed &&
					clientX <= this.settings.leftTriggerDistance
				) {
					window.clearTimeout(this.leftCloseTimerRef);
					leftSplit.expand();
				}
				if (
					this.settings.rightSideEnabled &&
					rightSplit.collapsed &&
					clientX >= calculatedWidth - this.settings.rightTriggerDistance
				) {
					window.clearTimeout(this.rightCloseTimerRef);
					rightSplit.expand();
				}
			});
			this.registerDomEvent(leftSplit.containerEl, "mousemove", () => {
				if (!this.settings.leftSideEnabled) return;
				window.clearTimeout(this.leftCloseTimerRef);
			});
			this.registerDomEvent(rightSplit.containerEl, "mousemove", () => {
				if (!this.settings.rightSideEnabled) return;
				window.clearTimeout(this.rightCloseTimerRef);
			});
		});
	}

	onunload(): void {
		window.clearTimeout(this.windowOutTimerRef);
		window.clearTimeout(this.leftCloseTimerRef);
		window.clearTimeout(this.rightCloseTimerRef);
	}

	async getSettings(): Promise<HoverSidebarSettings> {
		// TODO zod
		const data = await this.loadData();
		if (typeof data !== "object" || Array.isArray(data)) {
			const msg = "Invalid settings detected, reverting to default";
			new Notice("Hover Sidebar: ERROR " + msg);
			console.error(msg, data);
			return { ...defaultSettings };
		}
		return { ...defaultSettings, ...data };
	}

	async saveSettings(s: HoverSidebarSettings): Promise<boolean> {
		// TODO zod
		if (typeof s !== "object" || Array.isArray(s)) {
			const msg = "Invalid settings detected, reverting to default";
			new Notice("Hover Sidebar: ERROR " + msg);
			console.error(msg, s);
			return false;
		}
		this.settings = { ...s };
		await this.saveData(s);
		return true;
	}

	async updateSettings(
		cb: (prev: HoverSidebarSettings) => HoverSidebarSettings
	): Promise<boolean> {
		const s = cb({ ...this.settings });
		return await this.saveSettings(s);
	}

	updateFloating() {
		const className = "hover-sidebar-floating";
		const { leftSideEnabled, rightSideEnabled, leftFloating, rightFloating } =
			this.settings;
		const { leftSplit, rightSplit } = this.app.workspace;
		if (leftSideEnabled) {
			if (leftFloating) {
				leftSplit.containerEl.classList.add(className);
			} else {
				leftSplit.containerEl.classList.remove(className);
			}
		}
		if (rightSideEnabled) {
			if (rightFloating) {
				rightSplit.containerEl.classList.add(className);
			} else {
				rightSplit.containerEl.classList.remove(className);
			}
		}
	}
}

// EXAMPLE using i18next
const i18nextExample = () => {
	new Notice(text("hello"));
	new Notice(text("good.morning"));
};

const getWindowWidth = () => parseInt(getComputedStyle(document.body).width);

const isModalOrMenuOpen = () => {
	return !!document.body.querySelector("& > .menu, & > .modal-container");
};
