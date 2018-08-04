import { updateChildren } from '../update-children';

const mockElement = document.createElement('div');

const mockChildren = Array(8).fill('span').map((type, i) => {
	const child = document.createElement(type);
	child.innerHTML = i;
	return child;
});

function prepareElement (existingIndexes, newIndexes) {
	mockElement.innerHTML = '';
	existingIndexes.forEach(index => mockElement.appendChild(mockChildren[index]));
	return newIndexes.map(index => mockChildren[index]);
}

function checkElement (indexes) {
	const children = mockElement.childNodes;
	indexes.forEach((index, i) => expect(children[i]).toBe(mockChildren[index]));
}

describe('update-children', () => {
	it('should not replace elements if they are the same', () => {
		const newChildren = prepareElement([0, 1, 2, 3], [0, 1, 2, 3]);
		updateChildren(mockElement, newChildren);
		checkElement([0, 1, 2, 3]);
	});
	
	it('should swap elements when the new ones shift down slightly', () => {
		const newChildren = prepareElement([2, 3, 4, 5], [4, 5, 6]);
		updateChildren(mockElement, newChildren);
		checkElement([4, 5, 6]);
	});
	
	it('should swap elements when the new ones shift up slightly', () => {
		const newChildren = prepareElement([4, 5, 6], [2, 3, 4, 5]);
		updateChildren(mockElement, newChildren);
		checkElement([2, 3, 4, 5]);
	});
	
	it('should swap elements with multiple overlaps', () => {
		const newChildren = prepareElement([1, 2, 5, 6], [2, 3, 4, 5]);
		updateChildren(mockElement, newChildren);
		checkElement([2, 3, 4, 5]);
	});
});
