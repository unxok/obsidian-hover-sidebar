import { Notice, Plugin } from "obsidian";
import { ModifiedWorkspaceSideDock, patchMenu } from "./patchMenu";
import {
	HoverSidebarSettingTab,
	HoverSidebarSettings,
	defaultSettings,
} from "./settingsTab";
import { removeDebugLines, getDebugLines } from "./debugLines";
import { floatingClassName } from "./libs/constants";
import { isModalOrMenuOpen, throttle } from "./libs/utils";

export default class HoverSidebar extends Plugin {
	public settings: HoverSidebarSettings = { ...defaultSettings };
	private windowOutTimerRef: number | undefined;
	private leftCloseTimerRef: number | undefined;
	// private leftOpenTimerRef: number | undefined;
	private rightCloseTimerRef: number | undefined;
	// private rootSplit: WorkspaceRoot | undefined;
	private leftSplit: ModifiedWorkspaceSideDock | undefined;
	private rightSplit: ModifiedWorkspaceSideDock | undefined;
	// private isRightSplitResizing: boolean = false;
	// private isLeftSplitResizing: boolean = false;

	async onload(): Promise<void> {
		this.settings = await this.getSettings();
		this.addSettingTab(new HoverSidebarSettingTab(this));
		this.app.workspace.onLayoutReady(() => this.onLayoutReady());
	}

	onLayoutReady(): void {
		patchMenu(this);
		this.updateFloating();
		this.initializeDebugLines();
		this.initializeSplits();
		this.monitorDocument();
		this.monitorDocumentRoot();
		// this.monitorDocumentBody();
		// this.monitorRootSplit();
		// this.monitorLeftSplit();
		// this.monitorRightSplit();
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
		const { leftSideEnabled, rightSideEnabled, leftFloating, rightFloating } =
			this.settings;
		const {
			leftSplit: { containerEl: leftContainer },
			rightSplit: { containerEl: rightContainer },
		} = this.app.workspace;

		if (leftSideEnabled && leftFloating) {
			leftContainer.classList.add(floatingClassName);
		} else {
			leftContainer.classList.remove(floatingClassName);
		}
		if (rightSideEnabled && rightFloating) {
			rightContainer.classList.add(floatingClassName);
		} else {
			rightContainer.classList.remove(floatingClassName);
		}
	}

	initializeDebugLines(): void {
		const {
			showDebugLines,
			leftTriggerDistance,
			leftDebugLineColor,
			rightTriggerDistance,
			rightDebugLineColor,
		} = this.settings;

		if (!showDebugLines) {
			removeDebugLines();
			return;
		}

		getDebugLines(
			{ pos: leftTriggerDistance, backgroundColor: leftDebugLineColor },
			{ pos: rightTriggerDistance, backgroundColor: rightDebugLineColor }
		);
	}

	initializeSplits(): void {
		const { /* rootSplit, */ leftSplit, rightSplit } = this.app.workspace;
		// this.rootSplit = rootSplit;
		this.leftSplit = leftSplit;
		this.rightSplit = rightSplit;
	}

	monitorDocument(): void {
		const { leftSplit, rightSplit } = this;
		if (!leftSplit || !rightSplit) {
			console.error(
				`Sidebars not found.\nleft: ${leftSplit}\nright: ${rightSplit}`
			);
			return;
		}

		const onMouseMove = (e: MouseEvent) => {
			if (
				isModalOrMenuOpen() ||
				leftSplit.containerEl.contains(document.activeElement) ||
				rightSplit.containerEl.contains(document.activeElement)
			) {
				return;
			}

			const {
				settings: {
					leftSideEnabled,
					rightSideEnabled,
					leftTriggerDistance,
					rightTriggerDistance,
				},
				windowOutTimerRef,
			} = this;

			window.clearTimeout(windowOutTimerRef);
			const { pageX, target } = e;
			if (!(target instanceof HTMLElement)) {
				// TODO does this matter?
				return;
			}
			const isInLeft = leftSplit.containerEl.contains(target);
			const isInRight = rightSplit.containerEl.contains(target);
			const isInSidebar = isInLeft || isInRight;
			if (isInSidebar) return;

			if (
				leftSideEnabled &&
				!leftSplit.pinned &&
				leftSplit.collapsed &&
				pageX < leftTriggerDistance
			) {
				leftSplit.expand();
				return;
			}
			if (leftSideEnabled && !leftSplit.pinned && !leftSplit.collapsed)
				leftSplit.collapse();

			if (
				rightSideEnabled &&
				!rightSplit.pinned &&
				rightSplit.collapsed &&
				pageX > window.innerWidth - rightTriggerDistance
			) {
				rightSplit.expand();
				return;
			}
			if (rightSideEnabled && !rightSplit.pinned && !rightSplit.collapsed)
				rightSplit.collapse();
		};
		this.registerDomEvent(
			document.body,
			"mousemove",
			throttle(onMouseMove, this.settings.mouseDelay)
		);
	}

	monitorDocumentRoot(): void {
		const { leftSplit, rightSplit } = this;
		if (!leftSplit || !rightSplit) return;

		this.registerDomEvent(document.documentElement, "mouseleave", () => {
			const { windowOutTimerRef, settings } = this;
			const {
				windowOutEnabled,
				leftSideEnabled,
				rightSideEnabled,
				windowOutDelay,
			} = settings;

			if (!windowOutEnabled || isModalOrMenuOpen()) return;

			window.clearTimeout(windowOutTimerRef);
			this.windowOutTimerRef = window.setTimeout(() => {
				if (leftSideEnabled && !leftSplit.pinned) leftSplit.collapse();
				if (rightSideEnabled && !rightSplit.pinned) rightSplit.collapse();
			}, windowOutDelay);
		});
	}

	// monitorDocumentBody(): void {
	// 	const { leftSplit, rightSplit } = this;
	// 	if (!leftSplit || !rightSplit) return;

	// 	this.registerDomEvent(document.body, "mousemove", (e) => {
	// 		const {
	// 			windowOutTimerRef,
	// 			leftCloseTimerRef,
	// 			rightCloseTimerRef,
	// 			isLeftSplitResizing,
	// 			isRightSplitResizing,
	// 			settings,
	// 		} = this;
	// 		const {
	// 			leftSideEnabled,
	// 			leftTriggerDistance,
	// 			// leftOpenDelay,
	// 			rightSideEnabled,
	// 			rightTriggerDistance,
	// 		} = settings;

	// 		if (isModalOrMenuOpen()) return;
	// 		window.clearTimeout(windowOutTimerRef);

	// 		const { clientX } = e;
	// 		if (
	// 			!isLeftSplitResizing &&
	// 			leftSideEnabled &&
	// 			leftSplit.collapsed &&
	// 			clientX <= leftTriggerDistance
	// 		) {
	// 			window.clearTimeout(leftCloseTimerRef);
	// 			// this.leftOpenTimerRef = window.setTimeout(() => {
	// 			leftSplit.expand();
	// 			// }, leftOpenDelay);
	// 		}
	// 		if (
	// 			!isRightSplitResizing &&
	// 			rightSideEnabled &&
	// 			rightSplit.collapsed &&
	// 			clientX >= document.body.offsetWidth - rightTriggerDistance
	// 		) {
	// 			window.clearTimeout(rightCloseTimerRef);
	// 			rightSplit.expand();
	// 		}
	// 	});
	// }

	// monitorRootSplit(): void {
	// 	const { leftSplit, rightSplit, rootSplit } = this;
	// 	if (!leftSplit || !rightSplit || !rootSplit) return;

	// 	const onMouseEnter = () => {
	// 		const { isLeftSplitResizing, isRightSplitResizing } = this;
	// 		const {
	// 			leftSideEnabled,
	// 			leftCloseDelay,
	// 			rightSideEnabled,
	// 			rightCloseDelay,
	// 		} = this.settings;

	// 		if (isModalOrMenuOpen()) {
	// 			// mosueenter won't fire again if menu is closed when mouse is within rootSplit
	// 			const onMouseMove = () => {
	// 				if (isModalOrMenuOpen()) return;
	// 				// menu is closed and mouse is moving within rootSplit
	// 				remove();
	// 				onMouseEnter();
	// 			};
	// 			const remove = () =>
	// 				rootSplit.containerEl.removeEventListener("mousemove", onMouseMove);
	// 			this.register(remove);
	// 			rootSplit.containerEl.addEventListener("mousemove", onMouseMove);

	// 			return;
	// 		}

	// 		if (
	// 			!isLeftSplitResizing &&
	// 			leftSideEnabled &&
	// 			!leftSplit.collapsed &&
	// 			!leftSplit.pinned
	// 		) {
	// 			this.leftCloseTimerRef = window.setTimeout(() => {
	// 				leftSplit.collapse();
	// 			}, leftCloseDelay);
	// 		}
	// 		if (
	// 			!isRightSplitResizing &&
	// 			rightSideEnabled &&
	// 			!rightSplit.collapsed &&
	// 			!rightSplit.pinned
	// 		) {
	// 			this.rightCloseTimerRef = window.setTimeout(() => {
	// 				rightSplit.collapse();
	// 			}, rightCloseDelay);
	// 		}
	// 	};

	// 	this.registerDomEvent(rootSplit.containerEl, "mouseenter", onMouseEnter);

	// 	this.registerDomEvent(rootSplit.containerEl, "mouseleave", () => {
	// 		window.clearTimeout(this.leftCloseTimerRef);
	// 		window.clearTimeout(this.rightCloseTimerRef);
	// 	});
	// }

	// monitorLeftSplit(): void {
	// 	this.monitorSideSplit(true);
	// }

	// monitorRightSplit(): void {
	// 	this.monitorSideSplit(false);
	// }

	// monitorSideSplit(left: boolean): void {
	// 	const split = left ? this.leftSplit : this.rightSplit;
	// 	const timerRef = left ? this.leftCloseTimerRef : this.rightCloseTimerRef;
	// 	const toggleBtn = document.querySelector(
	// 		"div.sidebar-toggle-button." + (left ? "mod-left" : "mod-right")
	// 	) as HTMLElement;
	// 	if (!split) return;

	// 	if (toggleBtn) {
	// 		const onDblClick = () => {
	// 			split.pinned = !split.pinned;
	// 		};
	// 		toggleBtn.addEventListener("dblclick", onDblClick);

	// 		this.register(() =>
	// 			toggleBtn.removeEventListener("dblclick", onDblClick)
	// 		);
	// 	}

	// 	this.registerDomEvent(split.containerEl, "mousemove", () => {
	// 		const isEnabled = left
	// 			? this.settings.leftSideEnabled
	// 			: this.settings.rightSideEnabled;
	// 		if (!isEnabled) return;
	// 		window.clearTimeout(timerRef);
	// 	});

	// 	// TODO unsure if this is actually helping anything
	// 	// const onWidthStable = debounce(
	// 	// 	() => {
	// 	// 		if (left) {
	// 	// 			this.isLeftSplitResizing = false;
	// 	// 			return;
	// 	// 		}
	// 	// 		this.isRightSplitResizing = false;
	// 	// 	},
	// 	// 	250,
	// 	// 	true
	// 	// );

	// 	// const obs = new ResizeObserver((entries) => {
	// 	// 	for (let _entry of entries) {
	// 	// 		if (left) {
	// 	// 			this.isLeftSplitResizing = true;
	// 	// 		} else {
	// 	// 			this.isRightSplitResizing = true;
	// 	// 		}
	// 	// 		onWidthStable();
	// 	// 	}
	// 	// });

	// 	// this.register(() => obs.disconnect());

	// 	// obs.observe(split.containerEl);
	// }
}
