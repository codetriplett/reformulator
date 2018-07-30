import { isEqual } from '../is-equal';

describe('is-equal', () => {
	describe('strict', () => {
		it('should treat the same literal types as equal', () => {
			const actual = isEqual('asdf', 'asdf');
			expect(actual).toBeTruthy();
		});

		it('should not treat different literal types as equal', () => {
			const actual = isEqual('asdf', 1);
			expect(actual).toBeFalsy();
		});

		it('should not treat literals and objects as equal', () => {
			const actual = isEqual('{}', {});
			expect(actual).toBeFalsy();
		});
		
		it('should treat objects with the same properties as equal', () => {
			const actual = isEqual({ key: 'value' }, { key: 'value' });
			expect(actual).toBeTruthy();
		});
		
		it('should not treat objects with fewer properties as equal', () => {
			const actual = isEqual({ key: 'value', another: 'one' }, { key: 'value' });
			expect(actual).toBeFalsy();
		});
		
		it('should treat arrays with the same items as equal', () => {
			const actual = isEqual(['value'], ['value']);
			expect(actual).toBeTruthy();
		});
		
		it('should not treat arrays with fewer items as equal', () => {
			const actual = isEqual(['value', 'another'], ['value']);
			expect(actual).toBeFalsy();
		});
		
		it('should treat the same deeply structured input as equal', () => {
			const actual = isEqual([
				'value',
				{ values: ['one', 'two'] },
				['one', 'two']
			], [
				'value',
				{ values: ['one', 'two'] },
				['one', 'two']
			]);

			expect(actual).toBeTruthy();
		});
		
		it('should not treat different deeply structured input as equal', () => {
			const actual = isEqual(
				{ values: ['one', 'two'] },
				{ values: ['one', 'two', 'three'] }
			);

			expect(actual).toBeFalsy();
		});
	});

	describe('relaxed', () => {
		it('should treat objects with fewer properties as equal', () => {
			const actual = isEqual({ key: 'value', another: 'one' }, { key: 'value' }, true);
			expect(actual).toBeTruthy();
		});
		
		it('should not treat objects with more properties as equal', () => {
			const actual = isEqual({ key: 'value' }, { key: 'value', another: 'one' }, true);
			expect(actual).toBeFalsy();
		});
		
		it('should treat arrays with fewer items as equal', () => {
			const actual = isEqual(['value', 'another'], ['value'], true);
			expect(actual).toBeTruthy();
		});
		
		it('should not treat arrays with more items as equal', () => {
			const actual = isEqual(['value'], ['value', 'another'], true);
			expect(actual).toBeFalsy();
		});
		
		it('should treat deeply structured input with fewer properties as equal', () => {
			const actual = isEqual([
				'value',
				{ values: ['one', 'two'], additional: 'value' },
				['one', 'two']
			], [
				'value',
				{ values: ['one', 'two'] },
				['one', 'two']
			], true);

			expect(actual).toBeTruthy();
		});
		
		it('should not treat deeply structured input with more items as equal', () => {
			const actual = isEqual(
				{ values: ['one', 'two'] },
				{ values: ['one', 'two', 'three'] },
				true
			);
			
			expect(actual).toBeFalsy();
		});
	});
});
