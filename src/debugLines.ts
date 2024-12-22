const leftDebugLineId = "hover-siderbar-left-debug-line";
const rightDebugLineId = "hover-siderbar-right-debug-line";

export const removeDebugLines = () => {
	document.getElementById(leftDebugLineId)?.remove();
	document.getElementById(rightDebugLineId)?.remove();
};

export const setDebugLinesPos = (left: number, right: number) => {
	const { leftLine, rightLine } = getDebugLines();
	leftLine.style.left = left + "px";
	rightLine.style.right = right + "px";
};

const createDebugLine = (left: boolean) =>
	document.body.createDiv({
		cls: "hover-sidebar-debug-line",
		attr: { id: left ? leftDebugLineId : rightDebugLineId },
	});

type LineDetails = {
	pos?: number;
	backgroundColor?: string;
};

export const getDebugLines = (left?: LineDetails, right?: LineDetails) => {
	const leftLine =
		document.getElementById(leftDebugLineId) ?? createDebugLine(true);
	const rightLine =
		document.getElementById(rightDebugLineId) ?? createDebugLine(false);

	if (left) {
		if (left.pos !== undefined) {
			leftLine.style.left = left.pos + "px";
		}
		if (left.backgroundColor !== undefined) {
			leftLine.style.backgroundColor = left.backgroundColor;
		}
	}

	if (right) {
		if (right.pos !== undefined) {
			rightLine.style.right = right.pos + "px";
		}
		if (right.backgroundColor !== undefined) {
			rightLine.style.backgroundColor = right.backgroundColor;
		}
	}

	return { leftLine, rightLine };
};

export const setDebugLineColor = (left: boolean, hexColor: string) => {
	const { leftLine, rightLine } = getDebugLines();
	if (left) {
		leftLine.style.backgroundColor = hexColor;
		return;
	}
	rightLine.style.backgroundColor = hexColor;
};
