import { isClientSide } from '../environment';
import { ElementStructure } from '../element-structure';

jest.mock('../environment', () => ({ isClientSide: jest.fn() }));

function testElement (element, tagName = '', attributes = {}, children = []) {
	const elementTagName = element.tagName;
	const elementAttributes = element.attributes;
	const elementChildren = element.children;

	if (elementTagName) {
		expect(elementTagName.toLowerCase()).toBe(tagName);

		Object.keys(elementChildren).forEach(index => {
			testElement(elementChildren[index], ...children[index]);
		});

		Object.keys(elementAttributes).forEach(index => {
			const elementAttribute = elementAttributes[index];
			const key = elementAttribute.nodeName;

			expect(elementAttribute.nodeValue).toBe(attributes[key]);
		});

		Object.keys(attributes).forEach(key => {
			if (!elementAttributes[key]) {
				expect(attributes[key]).toBeUndefined();
			}
		});
	} else {
		expect(element.nodeValue).toBe(tagName);
	}
}

describe('element-structure', () => {
	it('should add default alt text for img elements if none is provided', () => {
		const actual = new ElementStructure('img');
		expect(actual.attributes.alt).toBe('');
	});
	
	it('should add default href for a elements if none is provided', () => {
		const actual = new ElementStructure('a');
		expect(actual.attributes.href).toBe('javascript:void(0);');
	});
		
	it('should sort classes and attributes alphabetically and by type when rendering', () => {
		const elementStructure = new ElementStructure('img', {
			classNames: ['a c', 'b'],
			attributes: {
				b: 'b',
				d: true,
				a: 'a',
				c: true
			}
		});

		const actual = elementStructure.render();
		expect(actual).toEqual('<img class="a b c" a="a" alt="" b="b" c d>');
	});

	describe('server side', () => {
		let elementStructure;

		beforeEach(() => {
			isClientSide.mockReturnValue(false);

			elementStructure = new ElementStructure('div', {
				scope: 1,
				classNames: ['two', 'one'],
				attributes: {
					key: 'value',
					onclick: 'expanded'
				}
			});
		});

		it('should initialize element', () => {
			expect(elementStructure).toEqual({
				type: 'div',
				scope: 1,
				classNames: ['one', 'two'],
				attributes: { key: 'value' },
				content: [],
				events: { onclick: 'expanded' },
				variables: { expanded: true },
				element: undefined
			});
		});

		it('should render a child', () => {
			const actual = elementStructure.render();
			expect(actual).toBe('<div class="one two" key="value">1</div>');
		});

		it('should append a string', () => {
			elementStructure.append('asdf');
			expect(elementStructure.content).toEqual(['asdf']);
		});

		it('should append an array', () => {
			elementStructure.append(['one', 'two']);
			expect(elementStructure.content).toEqual(['one', 'two']);
		});

		it('should append another element structure', () => {
			const child = new ElementStructure('div', {
				attributes: { onclick: 'visible' }
			});

			elementStructure.append(child);
			expect(elementStructure.content).toEqual(['<div></div>']);
		});

		it('should not append to a singleton', () => {
			elementStructure = new ElementStructure('img');

			const child = new ElementStructure('span');
			elementStructure.append(child);

			expect(elementStructure.content).toEqual([]);
		});

		it('should render a parent', () => {
			const child = new ElementStructure('span', {
				attributes: { onclick: 'visible' }
			});
			
			elementStructure.append(child);
			const actual = elementStructure.render();

			expect(Object.keys(elementStructure.variables).sort()).toEqual(['expanded', 'visible']);
			expect(actual).toBe('<div class="one two" key="value"><span></span></div>');
		});
	});
	
	describe('client side', () => {
		let elementStructure;

		beforeEach(() => {
			isClientSide.mockReturnValue(true);

			elementStructure = new ElementStructure('div', {
				scope: 1,
				classNames: ['two', 'one'],
				attributes: {
					key: 'value',
					onclick: 'expanded'
				}
			});
		});

		it('should initialize element', () => {
			expect(elementStructure.element).toEqual(expect.any(Element));
		});

		it('should render a child', () => {
			const actual = elementStructure.render();

			testElement(actual, 'div', {
				class: 'one two',
				key: 'value'
			});
		});

		it('should append a string', () => {
			elementStructure.append('asdf');

			expect(elementStructure.content).toHaveLength(1);
			testElement(elementStructure.content[0], 'asdf');
		});

		it('should append an array', () => {
			elementStructure.append(['one', 'two']);
			
			expect(elementStructure.content).toHaveLength(2);
			testElement(elementStructure.content[0], 'one');
			testElement(elementStructure.content[1], 'two');
		});

		it('should append another element structure', () => {
			const child = new ElementStructure('div', {
				attributes: { onclick: 'visible' }
			});

			elementStructure.append(child);

			expect(elementStructure.content).toHaveLength(1);
			testElement(elementStructure.content[0], 'div');
		});

		it('should not append to a singleton', () => {
			elementStructure = new ElementStructure('img');

			const child = new ElementStructure('span');
			elementStructure.append(child);

			expect(elementStructure.content).toHaveLength(0);
		});

		it('should render a parent', () => {
			const child = new ElementStructure('span', {
				attributes: { onclick: 'visible' }
			});
			
			elementStructure.append(child);
			const actual = elementStructure.render();

			expect(Object.keys(elementStructure.variables).sort()).toEqual(['expanded', 'visible']);
			testElement(actual, 'div', {
				class: 'one two',
				key: 'value'
			}, [
				['span', {}, '']
			]);
		});
	});
});
