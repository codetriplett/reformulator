import { resolveElement } from '../resolve-element';

describe('resolve-element', () => {
	it('should parse element string', () => {
		const actual = resolveElement('<div [a] @, @ + 1, key: @, flag: true>', { '': '.0.1' }, { a: 'a' });

		expect(actual).toEqual({
			type: 'div',
			classNames: ['a', 'a1'],
			attributes: { key: 'a', flag: true },
			content: [],
			scope: 'a',
			events: {},
			variables: {},
			templateId: '.0.1' 
		});
	});

	it('should filter out empty classes and attributes that are not defaults', () => {
		const actual = resolveElement('<img [] "a", b & "b", a: "a", b: b, alt: b>');

		expect(actual).toMatchObject({
			classNames: ['a'],
			attributes: { a: 'a', alt: '' }
		});
	});

	it('should return array if scope is array', () => {
		const actual = resolveElement('<div [@] @>', {}, ['a', 'b']);

		expect(actual).toMatchObject([{
			type: 'div',
			classNames: ['a']
		}, {
			type: 'div',
			classNames: ['b']
		}]);
	});

	it('should return empty if scope is empty', () => {
		const actual = resolveElement('<div [a]>');
		expect(actual).toBeNull();
	});

	it('should return empty for invalid object', () => {
		const actual = resolveElement('<div [] @: @ + 1: 1 + 2>');
		expect(actual).toBeNull();
	});
});
