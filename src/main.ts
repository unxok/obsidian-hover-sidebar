import { Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { text } from "./i18next";

export default class HoverSidebar extends Plugin {
	onload(): Promise<void> | void {
		new Notice("HoverSidebar plugin loaded");
		this.addSettingTab(new HoverSidebarSettingTab(this.app, this));

		i18nextExample();
	}

	onunload(): void {
		new Notice("HoverSidebar plugin unloaded");
	}
}

class HoverSidebarSettingTab extends PluginSettingTab {
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("A sample setting")
			.setDesc("some description.")
			.addText((cmp) =>
				cmp
					.setPlaceholder("placeholder text")
					.onChange((v) => console.log("sample setting changed: ", v))
			);
	}
}

// EXAMPLE using i18next
const i18nextExample = () => {
	new Notice(text("hello"));
	new Notice(text("good.morning"));
};
