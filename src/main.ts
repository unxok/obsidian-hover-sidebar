import { Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { text } from "./i18next";

export default class HoverSidebar extends Plugin {
	onload(): Promise<void> | void {
		new Notice("HoverSidebar plugin loaded");
		this.addSettingTab(new HoverSidebarSettingTab(this.app, this));

		const left = 20;
		const right = 20;

		const calculatedWidth = parseInt(getComputedStyle(document.body).width);
		const { leftSplit, rightSplit, rootSplit } = this.app.workspace;

		insertDebugLines(this, left, right);

		this.registerDomEvent(rootSplit.containerEl, "mouseenter", (e) => {
			leftSplit.collapse();
			rightSplit.collapse();
		});

		this.registerDomEvent(document.body, "mousemove", (e) => {
			const { clientX, currentTarget } = e;
			if (clientX <= left) {
				leftSplit.expand();
			}
			if (clientX >= calculatedWidth - right) {
				rightSplit.expand();
			}
		});
	}

	onunload(): void {}
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

const leftDebugLineId = "hover-siderbar-left-debug-line";
const rightDebugLineId = "hover-siderbar-right-debug-line";

const insertDebugLines = (plugin: Plugin, left: number, right: number) => {
	const leftLine =
		document.getElementById(leftDebugLineId) ?? createDebugLine(true);
	const rightLine =
		document.getElementById(rightDebugLineId) ?? createDebugLine(false);

	leftLine.style.left = left + "px";
	rightLine.style.right = right + "px";
};

const createDebugLine = (left: boolean) =>
	document.body.createDiv({
		cls: "hover-sidebar-debug-line",
		attr: { id: left ? leftDebugLineId : rightDebugLineId },
	});
