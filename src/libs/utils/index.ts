export const isModalOrMenuOpen = () => {
	// OLD VERSION: querySelector("& > .menu, & > .modal-container") average takes from .3 to 1 millisecond
	// CURRENT VERSION: iterating the children (knowing it will usually be the last or second to last) average takes from 0 (negligible) to .01 milliseconds
	let el = document.body.lastElementChild;
	if (!el) return false;
	return iteratePreviousForMenuOrModal(el);
};

const iteratePreviousForMenuOrModal = (el: Element) => {
	if (isElMenuOrModal(el)) return true;
	const prev = el.previousElementSibling;
	if (!prev) return false;
	return iteratePreviousForMenuOrModal(prev);
};

const isElMenuOrModal = (el: Element) => {
	return (
		el.classList.contains("menu") || el.classList.contains("modal-container")
	);
};
