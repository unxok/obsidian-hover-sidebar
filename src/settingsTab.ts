import { PluginSettingTab, Setting } from "obsidian";
import HoverSidebar from "./main";
import { insertDebugLines, removeDebugLines } from "./debugLines";

export type HoverSidebarSettings = {
	showDebugLines: boolean;
	windowOutEnabled: boolean;
	windowOutDelay: number;
	leftSideEnabled: boolean;
	leftTriggerDistance: number;
	leftCloseDelay: number;
	leftFloating: boolean;
	rightSideEnabled: boolean;
	rightTriggerDistance: number;
	rightCloseDelay: number;
	rightFloating: boolean;
};

export const defaultSettings: HoverSidebarSettings = {
	showDebugLines: true,
	windowOutEnabled: true,
	windowOutDelay: 250,
	leftSideEnabled: true,
	leftTriggerDistance: 20,
	leftCloseDelay: 250,
	leftFloating: true,
	rightSideEnabled: true,
	rightTriggerDistance: 20,
	rightCloseDelay: 250,
	rightFloating: false,
};

export class HoverSidebarSettingTab extends PluginSettingTab {
	constructor(public plugin: HoverSidebar) {
		super(plugin.app, plugin);
	}

	insertDebugLines() {
		insertDebugLines(
			this.plugin.settings.leftTriggerDistance,
			this.plugin.settings.rightTriggerDistance
		);
	}

	display(): void {
		const { containerEl, plugin } = this;
		containerEl.empty();

		const update = async <T extends keyof HoverSidebarSettings>(
			key: T,
			value: HoverSidebarSettings[T]
		) => {
			await this.plugin.updateSettings((prev) => ({
				...prev,
				[key]: value,
			}));
		};

		new Setting(containerEl)
			.setName("Show boundary lines")
			.setDesc(
				"Whether to show vertical lines indicating the trigger boundaries for the sidebars."
			)
			.addToggle((cmp) =>
				cmp.setValue(plugin.settings.showDebugLines).onChange((b) => {
					update("showDebugLines", b);
					if (b) {
						this.insertDebugLines();
						return;
					}
					removeDebugLines();
				})
			);

		new Setting(containerEl)
			.setName("Collapse on window out")
			.setDesc("Whether to collapse sidebars when the mouse leaves the window.")
			.addToggle((cmp) =>
				cmp
					.setValue(plugin.settings.windowOutEnabled)
					.onChange((b) => update("windowOutEnabled", b))
			);

		new Setting(containerEl).setHeading().setName("Left sidebar");

		const leftSettingsContainer = containerEl.createDiv();
		updateDisplay(leftSettingsContainer, plugin.settings.leftSideEnabled);

		new Setting(containerEl)
			.setName("Enabled")
			.setDesc("Whether to open the left sidebar on hover.")
			.addToggle((cmp) =>
				cmp.setValue(plugin.settings.leftSideEnabled).onChange((b) => {
					update("leftSideEnabled", b);
					updateDisplay(leftSettingsContainer, b);
				})
			)
			.then((s) =>
				s.settingEl.insertAdjacentElement("afterend", leftSettingsContainer)
			);

		new Setting(leftSettingsContainer)
			.setName("Trigger distance")
			.setDesc(
				"The distance the mouse needs to be from the left of the window to expand the sidebar."
			)
			.addSlider((cmp) =>
				cmp
					.setInstant(true)
					.setLimits(0, 300, 1)
					.setValue(plugin.settings.leftTriggerDistance)
					.onChange((v) => {
						update("leftTriggerDistance", v);
						removeDebugLines();
						this.insertDebugLines();
					})
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update("leftTriggerDistance", defaultSettings["leftTriggerDistance"]);
					removeDebugLines();
					this.insertDebugLines();
					this.display();
				})
			);

		new Setting(leftSettingsContainer)
			.setName("Floating")
			.setDesc(
				'Whether to make the sidebar "float" over the main layout, rather than shift it.'
			)
			.addToggle((cmp) =>
				cmp.setValue(plugin.settings.leftFloating).onChange((b) => {
					update("leftFloating", b);
					plugin.updateFloating();
				})
			);

		new Setting(leftSettingsContainer)
			.setName("Close delay")
			.setDesc(
				"The amount of time (in milliseconds) to wait before closing the sidebar when moving away from it."
			)
			.addText((cmp) =>
				cmp
					.setValue(plugin.settings.leftCloseDelay.toString())
					.onChange((v) => {
						const num = Number(v);
						if (Number.isNaN(num)) {
							cmp.setValue(defaultSettings["leftCloseDelay"].toString());
							return cmp.onChanged();
						}
						update("leftCloseDelay", num);
						removeDebugLines();
						this.insertDebugLines();
					})
					.then(() => (cmp.inputEl.type = "number"))
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update("leftCloseDelay", defaultSettings["leftCloseDelay"]);
					this.display();
				})
			);

		new Setting(containerEl).setHeading().setName("Right sidebar");

		const rightSettingsContainer = containerEl.createDiv();
		updateDisplay(rightSettingsContainer, plugin.settings.rightSideEnabled);

		new Setting(containerEl)
			.setName("Enabled")
			.setDesc("Whether to open the right sidebar on hover.")
			.addToggle((cmp) =>
				cmp.setValue(plugin.settings.rightSideEnabled).onChange((b) => {
					update("rightSideEnabled", b);
					updateDisplay(rightSettingsContainer, b);
				})
			)
			.then((s) =>
				s.settingEl.insertAdjacentElement("afterend", rightSettingsContainer)
			);

		new Setting(rightSettingsContainer)
			.setName("Trigger distance")
			.setDesc(
				"The distance the mouse needs to be from the right of the window to expand the sidebar."
			)
			.addSlider((cmp) =>
				cmp
					.setInstant(true)
					.setLimits(0, 300, 1)
					.setValue(plugin.settings.rightTriggerDistance)
					.onChange((v) => {
						update("rightTriggerDistance", v);
						removeDebugLines();
						this.insertDebugLines();
					})
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update(
						"rightTriggerDistance",
						defaultSettings["rightTriggerDistance"]
					);
					removeDebugLines();
					this.insertDebugLines();
					this.display();
				})
			);

		new Setting(rightSettingsContainer)
			.setName("Floating")
			.setDesc(
				'Whether to make the sidebar "float" over the main layout, rather than shift it.'
			)
			.addToggle((cmp) =>
				cmp.setValue(plugin.settings.rightFloating).onChange((b) => {
					update("rightFloating", b);
					plugin.updateFloating();
				})
			);

		new Setting(rightSettingsContainer)
			.setName("Close delay")
			.setDesc(
				"The amount of time (in milliseconds) to wait before closing the sidebar when moving away from it."
			)
			.addText((cmp) =>
				cmp
					.setValue(plugin.settings.rightCloseDelay.toString())
					.onChange((v) => {
						const num = Number(v);
						if (Number.isNaN(num)) {
							cmp.setValue(defaultSettings["rightCloseDelay"].toString());
							return cmp.onChanged();
						}
						update("rightCloseDelay", num);
						removeDebugLines();
						this.insertDebugLines();
					})
					.then(() => (cmp.inputEl.type = "number"))
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update("rightCloseDelay", defaultSettings["rightCloseDelay"]);
					this.display();
				})
			);
	}
}

const updateDisplay = (el: HTMLElement, visible: boolean) => {
	if (visible) {
		el.style.removeProperty("display");
		return;
	}
	el.style.setProperty("display", "none");
};
