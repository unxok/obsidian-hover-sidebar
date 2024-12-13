import { around, dedupe } from "monkey-around";
import {
	Menu,
	Plugin,
	WorkspaceMobileDrawer,
	WorkspaceSidedock,
} from "obsidian";

export type ModifiedWorkspaceSideDock = (
	| WorkspaceSidedock
	| WorkspaceMobileDrawer
) & {
	pinned?: boolean;
};

const patchKey = "hover-sidebar";

export const patchMenu = (plugin: Plugin) => {
	const uninstaller = around(Menu.prototype, {
		showAtMouseEvent(old) {
			return dedupe(patchKey, old, function (e) {
				// @ts-ignore
				const that = this as Menu;
				const exit = () => {
					old.call(that, e);
					return that;
				};

				const { target } = e;

				if (!(target instanceof HTMLElement)) return exit();

				const toggleButton = target.parentElement;

				if (!toggleButton) return exit();

				if (!toggleButton.classList.contains("sidebar-toggle-button"))
					return exit();

				const isLeft = toggleButton.classList.contains("mod-left");

				const { workspace } = plugin.app;

				const sideSplit = isLeft
					? (workspace.leftSplit as ModifiedWorkspaceSideDock)
					: (workspace.rightSplit as ModifiedWorkspaceSideDock);

				if (!sideSplit.hasOwnProperty("pinned")) {
					sideSplit.pinned = false;
				}

				const isPinned = !!sideSplit.pinned;

				that.addItem((item) =>
					item
						.setSection("pin")
						.setTitle("Pinned")
						.setIcon("pin")
						.setChecked(isPinned)
						.onClick(() => {
							sideSplit.pinned = !isPinned;
							sideSplit.expand();
						})
				);

				return exit();
			});
		},
	});

	plugin.register(uninstaller);
};