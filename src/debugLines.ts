const leftDebugLineId = "hover-siderbar-left-debug-line";
const rightDebugLineId = "hover-siderbar-right-debug-line";

export const removeDebugLines = () => {
	document.getElementById(leftDebugLineId)?.remove();
	document.getElementById(rightDebugLineId)?.remove();
};

export const insertDebugLines = (left: number, right: number) => {
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
