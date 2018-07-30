import { resolveStructure } from '../resolve-structure';

describe('resolve-structure', () => {
	describe('object', () => {
		it('should parse objects', () => {
			const actual = resolveStructure('{ a: b + 1, c: 2 }', { b: 'b' });
			expect(actual).toEqual({ a: 'b1', c: 2 });
		});

		it('should filter out empty properties', () => {
			const actual = resolveStructure('{ a: 1 + 2, b: b }');
			expect(actual).toEqual({ a: 3 });
		});

		it('should filter out array items', () => {
			const actual = resolveStructure('{ a: 1 + 2, "b" }');
			expect(actual).toEqual({ a: 3 });
		});

		it('should return empty for invalid object', () => {
			const actual = resolveStructure('{ a: 1 + 2 : b }');
			expect(actual).toBeNull();
		});
	});

	describe('array', () => {
		it('should parse arrays', () => {
			const actual = resolveStructure('[1 + 2, b]', { b: 'b' });
			expect(actual).toEqual([3, 'b']);
		});

		it('should filter out empty entries', () => {
			const actual = resolveStructure('[1 + 2, b]');
			expect(actual).toEqual([3]);
		});

		it('should filter out object properties', () => {
			const actual = resolveStructure('[1 + 2, b: "b"]');
			expect(actual).toEqual([3]);
		});

		it('should return empty for invalid object', () => {
			const actual = resolveStructure('[1 + 2, b: "b": 2]');
			expect(actual).toBeNull();
		});
	});

	describe('attributes', () => {
		it('should parse attributes', () => {
			const actual = resolveStructure('<1 + 2, b: b>', { b: 'b' });
			expect(actual).toEqual({ '': [3], b: 'b' });
		});

		it('should filter out empty values', () => {
			const actual = resolveStructure('<1 + 2, a: "a", b: b, b>');
			expect(actual).toEqual({ '': [3], a: 'a' });
		});

		it('should return empty for invalid object', () => {
			const actual = resolveStructure('<1 + 2, b: "b": 2>');
			expect(actual).toBeNull();
		});
	});
});
