import { isClientSide } from '../environment';
import { ElementStructure } from '../element-structure';

jest.mock('../environment', () => ({ isClientSide: jest.fn() }));

const liveTemplate = { update: jest.fn() };

function mockEvent (element, type, options = {}) {
	let event;

	switch (type) {
		case 'click':
			element.click();
			return;
		case 'keydown':
		case 'keyup':
		case 'keypress': {
			const {
				bubbles = true,
				cancelable = true,
				view = window,
				ctrlKey = false,
				altKey = false,
				shiftKey = false,
				metaKey = false,
				keyCode = 32,
				charCode = 0
			} = options;
		
			event = document.createEvent('KeyboardEvent');
		
			event.initKeyboardEvent(
				type,
				bubbles,
				cancelable,
				view,
				ctrlKey,
				altKey,
				shiftKey,
				metaKey,
				keyCode,
				charCode
			);

			break;
		}
	}
	
	element.dispatchEvent(event);
}

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

		const actual = elementStructure.render(liveTemplate);
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
			const actual = elementStructure.render(liveTemplate);
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
			expect(elementStructure.content).toEqual([child]);
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
			const actual = elementStructure.render(liveTemplate);

			expect(Object.keys(elementStructure.variables).sort()).toEqual(['expanded', 'visible']);
			expect(actual).toBe('<div class="one two" key="value"><span></span></div>');
		});
		
		it('should set scope as value attribute for inputs', () => {
			elementStructure = new ElementStructure('input', { scope: 'asdf' });
			const actual = elementStructure.render(liveTemplate);
			expect(actual).toBe('<input value="asdf">');
		});
	});
	
	describe('client side', () => {
		let elementStructure;

		beforeEach(() => {
			isClientSide.mockReturnValue(true);
			liveTemplate.update.mockClear();

			elementStructure = new ElementStructure('div', {
				scope: 1,
				classNames: ['two', 'one'],
				attributes: {
					key: 'value',
					onclick: 'expanded'
				}
			});
		});

		it('should render a child', () => {
			const actual = elementStructure.render(liveTemplate);

			testElement(actual, 'div', {
				class: 'one two',
				key: 'value'
			});
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

			expect(elementStructure.content).toMatchObject([
				{
					type: 'div',
					classNames: [],
					attributes: {},
					events: { onclick: 'visible' }
				}
			]);
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
			const actual = elementStructure.render(liveTemplate);

			expect(Object.keys(elementStructure.variables).sort()).toEqual(['expanded', 'visible']);
			testElement(actual, 'div', {
				class: 'one two',
				key: 'value'
			}, [
				['span', {}, '']
			]);
		});
		
		it('should set scope as value attribute for inputs', () => {
			elementStructure = new ElementStructure('input', { scope: 'asdf' });
			const actual = elementStructure.render(liveTemplate);
			testElement(actual, 'input', { value: 'asdf' });
		});

		it('should attach to input element if one is provided', () => {
			const element = document.createElement('div');
			const elementStructure = new ElementStructure('div', {});
			const actual = elementStructure.render(liveTemplate, element);

			expect(actual).toBe(element);
		});
	});

	describe('events', () => {
		let elementStructure;

		beforeEach(() => {
			isClientSide.mockReturnValue(true);
			liveTemplate.update.mockClear();
			
			elementStructure = new ElementStructure('input', {
				scope: 'asdf',
				attributes: {
					onclick: 'clickValue',
					onkeydown: 'keydownValue',
					onkeyup: 'keyupValue',
					onkeypress: 'keypressValue'
				}
			});

			elementStructure.append('asdf');
		});

		it('should trigger updater on click', () => {
			const actual = elementStructure.render(liveTemplate);
			actual.click();
			expect(liveTemplate.update).toHaveBeenCalledWith('clickValue');
		});

		it('should trigger updater on keydown', () => {
			const actual = elementStructure.render(liveTemplate);
			mockEvent(actual, 'keydown');
			expect(liveTemplate.update).toHaveBeenCalledWith('keydownValue', 'asdf');
		});

		it('should trigger updater on keyup', () => {
			const actual = elementStructure.render(liveTemplate);
			mockEvent(actual, 'keyup');
			expect(liveTemplate.update).toHaveBeenCalledWith('keyupValue', 'asdf');
		});

		it('should trigger updater on keypress', () => {
			const actual = elementStructure.render(liveTemplate);
			mockEvent(actual, 'keypress');
			expect(liveTemplate.update).toHaveBeenCalledWith('keypressValue', 'asdf');
		});

		it('should not fail when liveTemplate is not provided', () => {
			elementStructure = new ElementStructure(undefined, 'div', {
				attributes: { onclick: 'clickValue' }
			});
			
			const actual = elementStructure.render(liveTemplate);
			expect(actual).toBeTruthy();
		});
	});
});
