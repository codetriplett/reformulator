import { delayOperation } from '../delay-operation';

describe('delay-operation', () => {
	it('should delay operations with lower precedence', () => {
		const actual = delayOperation('+', '*');
		expect(actual).toBeTruthy();
	});

	it('should not delay operations with higher precedence', () => {
		const actual = delayOperation('*', '+');
		expect(actual).toBeFalsy();
	});

	it('should not delay operations with the same precedence', () => {
		const actual = delayOperation('+', '+');
		expect(actual).toBeFalsy();
	});
});
