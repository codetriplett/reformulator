import { resolveExpression } from '../resolve-expression';

describe('resolve-expression', () => {
	it('should respect the order of operations', () => {
		const actual = resolveExpression('1 + 2 * 3');
		expect(actual).toBe(7);
	});

	it('should respect the order of operations with negative variables', () => {
		const actual = resolveExpression('1 + -a * 3', {}, { a: 2 });
		expect(actual).toBe(-5);
	});

	it('should return null if result is empty object', () => {
		const actual = resolveExpression('@ | "a"', {}, {});
		expect(actual).toBeNull();
	});

	it('should return null if result is empty array', () => {
		const actual = resolveExpression('@ | "a"', {}, []);
		expect(actual).toBeNull();
	});
	
	it('should allow negative variables', () => {
		const actual = resolveExpression('-a', {}, { a: 2 });
		expect(actual).toBe(-2);
	});
	
	it('should set result of expression in parenthesis to negative if sign is present', () => {
		const actual = resolveExpression('2 * -(1 + 2)');
		expect(actual).toBe(-6);
	});
	
	it('should test against a negated value', () => {
		const actual = resolveExpression('true ! !@', {}, 2);
		expect(actual).toBe(true);
	});

	it('should process expression to the right of opening parentheses first', () => {
		const actual = resolveExpression('2 * (1 + 2)');
		expect(actual).toBe(6);
	});

	it('should process expression to the left of closing parentheses first', () => {
		const actual = resolveExpression('(1 + 2) * 2');
		expect(actual).toBe(6);
	});
});
