function swapChildren (element, elementChildren, newChildren, commonElement) {
	if (!elementChildren.length && !newChildren.length) {
		return;
	}

	const elementChildrenLength = elementChildren.length;
	const newChildrenLength = newChildren.length;

	for (let i = elementChildrenLength - 1; i >= 0; i--) {
		element.removeChild(elementChildren[i]);
	}

	if (commonElement) {
		for (let i = 0; i < newChildrenLength; i++) {
			element.insertBefore(newChildren[i], commonElement);
		}
	} else {
		for (let i = 0; i < newChildrenLength; i++) {
			element.appendChild(newChildren[i]);
		}
	}
}

export function updateChildren (element, newChildren) {
	const newChildrenLength = newChildren.length;
	let elementChildren = Array.apply(this, element.childNodes);
	let elementChildrenLength = elementChildren.length;
	let newChildrenBuffer = [];
	let elementChildrenBuffer = [];
	let elementChildrenIndex = 0;
	let elementChild;
	let newChild;

	main:
	for (let i = 0; i < newChildrenLength; i++) {
		newChild = newChildren[i];
		elementChildrenBuffer = [];

		for (let j = elementChildrenIndex; j < elementChildrenLength; j++) {
			elementChild = elementChildren[j];

			if (elementChild === newChild) {
				swapChildren(element, elementChildrenBuffer, newChildrenBuffer, elementChild);
				
				elementChildren = Array.apply(this, element.childNodes);
				elementChildrenLength = elementChildren.length;
				elementChildrenIndex += newChildrenBuffer.length + 1;
				elementChildrenBuffer = [];
				newChildrenBuffer = [];

				continue main;
			} else {
				elementChildrenBuffer.push(elementChild);
			}
		}

		newChildrenBuffer.push(newChild);
	}

	swapChildren(element, elementChildrenBuffer, newChildrenBuffer);
}
