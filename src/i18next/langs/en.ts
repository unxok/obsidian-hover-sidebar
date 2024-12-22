import { LanguageResource } from "../LanguageResource";

export const en: LanguageResource = {
	settings: {
		showdebugLines: {
			name: "Show boundary lines",
			desc: "Whether to show vertical lines indicating the trigger boundaries for the sidebars.",
		},
		leftLineColor: {
			name: "Left boundary line color",
			desc: "The color of the vertical line indicating the left sidebar trigger boundary.",
		},
		rightLineColor: {
			name: "Right boundary line color",
			desc: "The color of the vertical line indicating the right sidebar trigger boundary.",
		},
		collapseOnWindowOut: {
			name: "Collapse on window out",
			desc: "Whether to collapse sidebars when the mouse leaves the window.",
		},
		leftSidebar: {
			heading: "Left sidebar",
			enabled: {
				name: "Enabled",
				desc: "Whether to open the left sidebar on hover.",
			},
			triggerDistance: {
				name: "Trigger distance",
				desc: "The distance the mouse needs to be from the left of the window to expand the sidebar.",
			},
			floating: {
				name: "Floating",
				desc: 'Whether to make the sidebar "float" over the main layout, rather than shift it.',
			},
			closeDelay: {
				name: "Close delay",
				desc: "The amount of time (in milliseconds) to wait before closing the sidebar when moving away from it.",
			},
		},
		rightSidebar: {
			heading: "Right sidebar",
			enabled: {
				name: "Enabled",
				desc: "Whether to open the right sidebar on hover.",
			},
			triggerDistance: {
				name: "Trigger distance",
				desc: "The distance the mouse needs to be from the right of the window to expand the sidebar.",
			},
			floating: {
				name: "Floating",
				desc: 'Whether to make the sidebar "float" over the main layout, rather than shift it.',
			},
			closeDelay: {
				name: "Close delay",
				desc: "The amount of time (in milliseconds) to wait before closing the sidebar when moving away from it.",
			},
		},
	},
};
