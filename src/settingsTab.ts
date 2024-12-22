import { PluginSettingTab, setIcon, Setting, setTooltip } from "obsidian";
import HoverSidebar from "./main";
import {
	setDebugLinesPos,
	removeDebugLines,
	setDebugLineColor,
	getDebugLines,
} from "./debugLines";
import { text } from "./i18next";

export type HoverSidebarSettings = {
	showDebugLines: boolean;
	leftDebugLineColor: string;
	rightDebugLineColor: string;
	windowOutEnabled: boolean;
	windowOutDelay: number;
	leftSideEnabled: boolean;
	leftTriggerDistance: number;
	leftCloseDelay: number;
	// leftOpenDelay: number;
	leftFloating: boolean;
	rightSideEnabled: boolean;
	rightTriggerDistance: number;
	rightCloseDelay: number;
	rightFloating: boolean;
};

export const defaultSettings: HoverSidebarSettings = {
	showDebugLines: true,
	leftDebugLineColor: "#ff1100",
	rightDebugLineColor: "#0091ff",
	windowOutEnabled: true,
	windowOutDelay: 250,
	leftSideEnabled: true,
	leftTriggerDistance: 20,
	leftCloseDelay: 250,
	// leftOpenDelay: 500,
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

	placeDebugLines() {
		const {
			leftTriggerDistance,
			leftDebugLineColor,
			rightTriggerDistance,
			rightDebugLineColor,
		} = this.plugin.settings;
		getDebugLines(
			{
				pos: leftTriggerDistance,
				backgroundColor: leftDebugLineColor,
			},
			{
				pos: rightTriggerDistance,
				backgroundColor: rightDebugLineColor,
			}
		);
	}

	display(): void {
		const { containerEl, plugin } = this;
		const {} = plugin.settings;
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

		const showDebugLinesSetting = new Setting(containerEl)
			.setName(text("settings.showdebugLines.name"))
			.setDesc(text("settings.showdebugLines.desc"));

		const leftLineColorSetting = new Setting(containerEl)
			.setName(text("settings.leftLineColor.name"))
			.setDesc(text("settings.leftLineColor.desc"))
			.addColorPicker((cmp) =>
				cmp.setValue(plugin.settings.leftDebugLineColor).onChange((v) => {
					update("leftDebugLineColor", v);
					setDebugLineColor(true, v);
				})
			);

		const rightLineColorSetting = new Setting(containerEl)
			.setName(text("settings.rightLineColor.name"))
			.setDesc(text("settings.rightLineColor.desc"))
			.addColorPicker((cmp) =>
				cmp.setValue(plugin.settings.rightDebugLineColor).onChange((v) => {
					update("rightDebugLineColor", v);
					setDebugLineColor(false, v);
				})
			);

		const showLineColorSettings = () => {
			leftLineColorSetting.settingEl.style.removeProperty("display");
			rightLineColorSetting.settingEl.style.removeProperty("display");
		};

		const hideLineColorSettings = () => {
			leftLineColorSetting.settingEl.style.display = "none";
			rightLineColorSetting.settingEl.style.display = "none";
		};

		if (!plugin.settings.showDebugLines) {
			hideLineColorSettings();
		}

		showDebugLinesSetting.addToggle((cmp) =>
			cmp.setValue(plugin.settings.showDebugLines).onChange((b) => {
				update("showDebugLines", b);
				if (b) {
					this.placeDebugLines();
					showLineColorSettings();
					return;
				}
				removeDebugLines();
				hideLineColorSettings();
			})
		);

		new Setting(containerEl)
			.setName(text("settings.collapseOnWindowOut.name"))
			.setDesc(text("settings.collapseOnWindowOut.desc"))
			.addToggle((cmp) =>
				cmp
					.setValue(plugin.settings.windowOutEnabled)
					.onChange((b) => update("windowOutEnabled", b))
			);

		new Setting(containerEl)
			.setHeading()
			.setName(text("settings.leftSidebar.heading"));

		const leftSettingsContainer = containerEl.createDiv();
		updateDisplay(leftSettingsContainer, plugin.settings.leftSideEnabled);

		new Setting(containerEl)
			.setName(text("settings.leftSidebar.enabled.name"))
			.setDesc(text("settings.leftSidebar.enabled.desc"))
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
			.setName(text("settings.leftSidebar.triggerDistance.name"))
			.setDesc(text("settings.leftSidebar.triggerDistance.desc"))
			.addSlider((cmp) =>
				cmp
					.setInstant(true)
					.setLimits(0, 300, 1)
					.setValue(plugin.settings.leftTriggerDistance)
					.onChange((v) => {
						update("leftTriggerDistance", v);
						removeDebugLines();
						this.placeDebugLines();
					})
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update("leftTriggerDistance", defaultSettings["leftTriggerDistance"]);
					removeDebugLines();
					this.placeDebugLines();
					this.display();
				})
			);

		new Setting(leftSettingsContainer)
			.setName(text("settings.leftSidebar.floating.name"))
			.setDesc(text("settings.leftSidebar.floating.desc"))
			.addToggle((cmp) =>
				cmp.setValue(plugin.settings.leftFloating).onChange((b) => {
					update("leftFloating", b);
					plugin.updateFloating();
				})
			);

		new Setting(leftSettingsContainer)
			.setName(text("settings.leftSidebar.closeDelay.name"))
			.setDesc(text("settings.leftSidebar.closeDelay.desc"))
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
						this.placeDebugLines();
					})
					.then(() => (cmp.inputEl.type = "number"))
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update("leftCloseDelay", defaultSettings["leftCloseDelay"]);
					this.display();
				})
			);

		new Setting(containerEl)
			.setHeading()
			.setName(text("settings.rightSidebar.heading"));

		const rightSettingsContainer = containerEl.createDiv();
		updateDisplay(rightSettingsContainer, plugin.settings.rightSideEnabled);

		new Setting(containerEl)
			.setName(text("settings.rightSidebar.enabled.name"))
			.setDesc(text("settings.rightSidebar.enabled.desc"))
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
			.setName(text("settings.leftSidebar.triggerDistance.name"))
			.setDesc(text("settings.leftSidebar.triggerDistance.desc"))
			.addSlider((cmp) =>
				cmp
					.setInstant(true)
					.setLimits(0, 300, 1)
					.setValue(plugin.settings.rightTriggerDistance)
					.onChange((v) => {
						update("rightTriggerDistance", v);
						removeDebugLines();
						this.placeDebugLines();
					})
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update(
						"rightTriggerDistance",
						defaultSettings["rightTriggerDistance"]
					);
					removeDebugLines();
					this.placeDebugLines();
					this.display();
				})
			);

		new Setting(rightSettingsContainer)
			.setName(text("settings.rightSidebar.floating.name"))
			.setDesc(text("settings.rightSidebar.floating.desc"))
			.addToggle((cmp) =>
				cmp.setValue(plugin.settings.rightFloating).onChange((b) => {
					update("rightFloating", b);
					plugin.updateFloating();
				})
			);

		new Setting(rightSettingsContainer)
			.setName(text("settings.rightSidebar.closeDelay.name"))
			.setDesc(text("settings.rightSidebar.closeDelay.name"))
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
						this.placeDebugLines();
					})
					.then(() => (cmp.inputEl.type = "number"))
			)
			.addExtraButton((cmp) =>
				cmp.setIcon("rotate-ccw").onClick(() => {
					update("rightCloseDelay", defaultSettings["rightCloseDelay"]);
					this.display();
				})
			);

		new Setting(this.containerEl).setHeading().setName("Resources");

		new Setting(this.containerEl)
			.setName("Github")
			.setDesc(
				"See the source code of this plugin, issues, translation guidelines, and other information."
			)
			.addButton((cmp) => {
				const link = "https://github.com/unxok/obsidian-hover-sidebar";
				setTooltip(cmp.buttonEl, link);
				const anchor = cmp.buttonEl.createEl("a", {
					href: link,
				});
				setIcon(anchor, "github");
			});

		new Setting(this.containerEl)
			.setName("Donate")
			.setDesc("Love this plugin? Consider buying me a coffee :)")
			.addButton((cmp) => {
				const link = "https://buymeacoffee.com/unxok";
				setTooltip(cmp.buttonEl, link);
				const anchor = cmp.buttonEl.createEl("a", {
					href: link,
				});
				setIcon(anchor, "coffee");
			});
	}
}

const updateDisplay = (el: HTMLElement, visible: boolean) => {
	if (visible) {
		el.style.removeProperty("display");
		return;
	}
	el.style.setProperty("display", "none");
};
