import { isEmpty } from '../is-empty';

describe('is-empty', () => {
	describe('relaxed', () => {
		it('should treat undefined as empty', () => {
			const actual = isEmpty(undefined);
			expect(actual).toBeTruthy();
		});
		
		it('should treat null as empty', () => {
			const actual = isEmpty(null);
			expect(actual).toBeTruthy();
		});
		
		it('should treat nan as empty', () => {
			const actual = isEmpty(NaN);
			expect(actual).toBeTruthy();
		});

		it('should not treat empty string as empty', () => {
			const actual = isEmpty('');
			expect(actual).toBeFalsy();
		});

		it('should not treat empty object as empty', () => {
			const actual = isEmpty({});
			expect(actual).toBeFalsy();
		});

		it('should not treat empty array as empty', () => {
			const actual = isEmpty([]);
			expect(actual).toBeFalsy();
		});
	});
	
	describe('strict', () => {
		it('should treat empty string as empty', () => {
			const actual = isEmpty('', true);
			expect(actual).toBeTruthy();
		});

		it('should treat empty object as empty', () => {
			const actual = isEmpty({}, true);
			expect(actual).toBeTruthy();
		});

		it('should treat empty array as empty', () => {
			const actual = isEmpty([], true);
			expect(actual).toBeTruthy();
		});
	});
});
