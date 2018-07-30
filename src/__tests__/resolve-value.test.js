import { resolveValue } from '../resolve-value';

describe('resolve-value', () => {
	describe('number', () => {
		it('should parse positive numbers', () => {
			const actual = resolveValue('2');
			expect(actual).toBe(2);
		});

		it('should parse negative numbers', () => {
			const actual = resolveValue('-2');
			expect(actual).toBe(-2);
		});
	});

	describe('boolean', () => {
		it('should parse boolean true values', () => {
			const actual = resolveValue('true');
			expect(actual).toBe(true);
		});

		it('should parse boolean false values', () => {
			const actual = resolveValue('false');
			expect(actual).toBe(false);
		});
	});

	describe('variable', () => {
		it('should use variables', () => {
			const actual = resolveValue('a', { a: 2 });
			expect(actual).toBe(2);
		});

		it('should support using the entire state', () => {
			const actual = resolveValue('@', 2);
			expect(actual).toBe(2);
		});
	});

	describe('string', () => {
		it('should parse strings with single quotes', () => {
			const actual = resolveValue("'http://www.domain.com'");
			expect(actual).toBe('http://www.domain.com');
		});

		it('should parse strings with escaped single quotes inside single quotes', () => {
			const actual = resolveValue("'key=\\'value\\''");
			expect(actual).toBe('key=\'value\'');
		});

		it('should parse strings with double quotes', () => {
			const actual = resolveValue('"http://www.domain.com"');
			expect(actual).toBe('http://www.domain.com');
		});

		it('should parse strings with escaped double quotes inside double quotes', () => {
			const actual = resolveValue('"key=\\"value\\""');
			expect(actual).toBe("key=\"value\"");
		});
	});
});
