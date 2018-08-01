import { resolveElement } from '../resolve-element';

const liveTemplate = { update: jest.fn() };

describe('resolve-element', () => {
	it('should parse element string', () => {
		const actual = resolveElement(liveTemplate, '<div [a] @, @ + 1, key: @, flag: true>', { a: 'a' });

		expect(actual).toEqual({
			type: 'div',
			classNames: ['a', 'a1'],
			attributes: { key: 'a', flag: true },
			content: [],
			scope: 'a',
			events: {},
			variables: {},
			element: expect.any(Element)
		});
	});

	it('should filter out empty classes and attributes that are not defaults', () => {
		const actual = resolveElement(liveTemplate, '<img [] "a", b & "b", a: "a", b: b, alt: b>');

		expect(actual).toMatchObject({
			classNames: ['a'],
			attributes: { a: 'a', alt: '' }
		});
	});

	it('should return array if scope is array', () => {
		const actual = resolveElement(liveTemplate, '<div [@] @>', ['a', 'b']);

		expect(actual).toMatchObject([{
			type: 'div',
			classNames: ['a']
		}, {
			type: 'div',
			classNames: ['b']
		}]);
	});

	it('should return empty if scope is empty', () => {
		const actual = resolveElement(liveTemplate, '<div [a]>');
		expect(actual).toBeNull();
	});

	it('should return empty for invalid object', () => {
		const actual = resolveElement(liveTemplate, '<div [] @: @ + 1: 1 + 2>');
		expect(actual).toBeNull();
	});
});
