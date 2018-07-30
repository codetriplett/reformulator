import { resolveOperation } from '../resolve-operation';

describe('resolve-operation', () => {
	describe('|', () => {
		it('should return first value if it is defined', () => {
			const actual = resolveOperation('value', '|', 'fallback');
			expect(actual).toBe('value');
		});

		it('should return second value if first is empty', () => {
			const actual = resolveOperation(null, '|', 'fallback');
			expect(actual).toBe('fallback');
		});
	});

	describe('&', () => {
		it('should return null if first is empty', () => {
			const actual = resolveOperation(null, '&', 'value');
			expect(actual).toBeNull();
		});

		it('should return null if first is false', () => {
			const actual = resolveOperation(false, '&', 'value');
			expect(actual).toBeNull();
		});

		it('should return second value if first is defined', () => {
			const actual = resolveOperation(true, '&', 'value');
			expect(actual).toBe('value');
		});
	});

	describe('=', () => {
		it('should return value if both are the same', () => {
			const actual = resolveOperation(2, '=', 2);
			expect(actual).toBe(2);
		});

		it('should return first object if it matches second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			const actual = resolveOperation(firstValue, '=', {
				parent: { child: 2 }
			});

			expect(actual).toBe(firstValue);
		});

		it('should not return first object if it contains more than second object', () => {
			const actual = resolveOperation({
				parent: { child: 2 },
				extra: 3
			}, '=', {
				parent: { child: 2 }
			});

			expect(actual).toBeNull();
		});

		it('should not return first object if it contains less than second object', () => {
			const actual = resolveOperation({
				parent: { child: 2 }
			}, '=', {
				parent: { child: 2 },
				extra: 3
			});

			expect(actual).toBeNull();
		});

		it('should not return first object if values are incompatible', () => {
			const actual = resolveOperation({ value: 2 }, '=', 2);
			expect(actual).toBeNull();
		});

		it('should return null if the values are not the same', () => {
			const actual = resolveOperation(1, '=', 2);
			expect(actual).toBeNull();
		});

		it('should return null if the first value is empty', () => {
			const actual = resolveOperation(null, '=', 2);
			expect(actual).toBeNull();
		});
	});

	describe('!', () => {
		it('should return first value only if it is not the same as the second', () => {
			const actual = resolveOperation(1, '!', 2);
			expect(actual).toBe(1);
		});

		it('should return first object if it does not match second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			const actual = resolveOperation(firstValue, '!', 2);
			expect(actual).toBe(firstValue);
		});

		it('should return first object if it contains more than second object', () => {
			const firstValue = {
				parent: { child: 2 },
				extra: 3
			};

			const actual = resolveOperation(firstValue, '!', {
				parent: { child: 2 }
			});

			expect(actual).toBe(firstValue);
		});

		it('should return first object if it contains less than second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};
			
			const actual = resolveOperation(firstValue, '!', {
				parent: { child: 2 },
				extra: 3
			});

			expect(actual).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			const actual = resolveOperation({
				parent: { child: 2 }
			}, '!', {
				parent: { child: 2 }
			});

			expect(actual).toBeNull();
		});

		it('should return null if the values are the same', () => {
			const actual = resolveOperation(2, '!', 2);
			expect(actual).toBeNull();
		});

		it('should return null if the first value is empty', () => {
			const actual = resolveOperation(null, '!', 2);
			expect(actual).toBeNull();
		});

		it('should return true if immediate value is empty', () => {
			const actual = resolveOperation(undefined, '!', null);
			expect(actual).toBe(true);
		});

		it('should return false if immediate value is defined', () => {
			const actual = resolveOperation(undefined, '!', 2);
			expect(actual).toBe(false);
		});
	});

	describe('<', () => {
		it('should return first value if it is less than the second value', () => {
			const actual = resolveOperation(2, '<', 3);
			expect(actual).toBe(2);
		});

		it('should return first object if its properties match those same properties in second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			const actual = resolveOperation(firstValue, '<', {
				parent: {
					child: 2,
					extra: 3
				},
				extra: 3
			});

			expect(actual).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			const actual = resolveOperation({
				parent: { child: 2 }
			}, '<', {
				parent: { child: 2 }
			});

			expect(actual).toBeNull();
		});

		it('should not return first object if second object contains the same data plus more', () => {
			const actual = resolveOperation({
				parent: {
					child: 2,
					extra: 3
				},
				extra: 3
			}, '<', {
				parent: { child: 2 }
			});

			expect(actual).toBeNull();
		});
		
		it('should return empty if it is not less than the second value', () => {
			const actual = resolveOperation(4, '<', 3);
			expect(actual).toBeNull();
		});

		it('should return empty if the values are not comparable', () => {
			const actual = resolveOperation({ b: 2 }, '<', 2);
			expect(actual).toBeNull();
		});
	});

	describe('>', () => {
		it('should return first value if it is less than the second value', () => {
			const actual = resolveOperation(3, '>', 2);
			expect(actual).toBe(3);
		});

		it('should return first object if it contains all the same data as second object plus more', () => {
			const firstValue = {
				parent: {
					child: 2,
					extra: 3
				},
				extra: 3
			};

			const actual = resolveOperation(firstValue, '>', {
				parent: { child: 2 }
			});

			expect(actual).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			const actual = resolveOperation({
				parent: { child: 2 }
			}, '>', {
				parent: { child: 2 }
			});

			expect(actual).toBeNull();
		});

		it('should not return first object if it is missing properties found in second object', () => {
			const actual = resolveOperation({
				parent: { child: 2 }
			}, '>', {
				parent: {
					child: 2,
					extra: 3
				},
				extra: 3
			});

			expect(actual).toBeNull();
		});
		
		it('should return empty if it is not less than the second value', () => {
			const actual = resolveOperation(3, '>', 4);
			expect(actual).toBeNull();
		});

		it('should return empty if the values are not compatible', () => {
			const actual = resolveOperation({ b: 2 }, '>', 2);
			expect(actual).toBeNull();
		});
	});

	describe('#', () => {
		it('should remove all decimals if second value is zero', () => {
			const actual = resolveOperation(1.666, '#', 0);
			expect(actual).toBe('1');
		});
		
		it('should remove a set amount of decimals if second value is greater than zero', () => {
			const actual = resolveOperation(1.666, '#', 2);
			expect(actual).toBe('1.66');
		});

		it('should return empty if the first value is not a number', () => {
			const actual = resolveOperation('value', '#', 0);
			expect(actual).toBeNull();
		});
	});
	
	describe('+', () => {
		it('should add numbers', () => {
			const actual = resolveOperation(1, '+', 2);
			expect(actual).toBe(3);
		});

		it('should combine numbers and strings', () => {
			const actual = resolveOperation('a', '+', 2);
			expect(actual).toBe('a2');
		});

		it('should concatenate strings', () => {
			const actual = resolveOperation('a', '+', 'b');
			expect(actual).toBe('ab');
		});

		it('should concatenate arrays', () => {
			const actual = resolveOperation([2, 3], '+', [4, 5]);
			expect(actual).toEqual([2, 3, 4, 5]);
		});

		it('should overwrite properties from second object to first object', () => {
			const actual = resolveOperation({
				keep: 1,
				overwrite: 2,
				deep: {
					keep: 3,
					overwrite: 4
				},
				replace: 5,
				combine: [
					{
						keep: 6,
						overwrite: 7
					}
				]
			}, '+', {
				overwrite: 8,
				add: 9,
				deep: {
					overwrite: 10,
					add: 11
				},
				replace: { value: 12 },
				combine: [
					{
						overwrite: 13,
						add: 14
					},
					{ value: 15 }
				]
			});

			expect(actual).toEqual({
				keep: 1,
				overwrite: 8,
				add: 9,
				deep: {
					keep: 3,
					overwrite: 10,
					add: 11
				},
				replace: { value: 12 },
				combine: [
					{
						keep: 6,
						overwrite: 13,
						add: 14
					},
					{ value: 15 }
				]
			});
		});

		it('should add a value to the end of the array', () => {
			const actual = resolveOperation([2, 3], '+', 4);
			expect(actual).toEqual([2, 3, 4]);
		});

		it('should add a value to the beginning of the array', () => {
			const actual = resolveOperation(4, '+', [3, 2]);
			expect(actual).toEqual([4, 3, 2]);
		});

		it('should return empty value if values are not compatible', () => {
			const actual = resolveOperation({ value: 2 }, '+', 2);
			expect(actual).toBeNull();
		});
	});
	
	describe('-', () => {
		it('should subtracted numbers', () => {
			const actual = resolveOperation(3, '-', 1);
			expect(actual).toBe(2);
		});

		it('should remove pattern from string', () => {
			const actual = resolveOperation('asdf', '-', '^a.d');
			expect(actual).toBe('f');
		});

		it('should return result of subtracted suffix', () => {
			const actual = resolveOperation('asdf', '-', 'df');
			expect(actual).toBe('as');
		});

		it('should return first value if suffix is not present', () => {
			const actual = resolveOperation('asdf', '-', 'x');
			expect(actual).toBe('asdf');
		});

		it('should remove property from first object', () => {
			const actual = resolveOperation({
				keep: 2,
				remove: 3
			}, '-', 'remove');

			expect(actual).toEqual({ keep: 2 });
		});

		it('should remove a number of values from the beginning of an array', () => {
			const actual = resolveOperation(2, '-', [2, 3, 4, 5]);
			expect(actual).toEqual([4, 5]);
		});

		it('should remove a number of values from the end of an array', () => {
			const actual = resolveOperation([2, 3, 4, 5], '-', 2);
			expect(actual).toEqual([2, 3]);
		});

		it('should remove a number of values from the beginning of a string', () => {
			const actual = resolveOperation(2, '-', 'asdf');
			expect(actual).toEqual('df');
		});

		it('should remove a number of values from the end of a string', () => {
			const actual = resolveOperation('asdf', '-', 2);
			expect(actual).toEqual('as');
		});

		it('should return empty value if values are not compatible', () => {
			const actual = resolveOperation({ value: 2 }, '-', 2);
			expect(actual).toBeNull();
		});
	});
	
	describe('/', () => {
		it('should divide numbers', () => {
			const actual = resolveOperation(6, '/', 2);
			expect(actual).toBe(3);
		});

		it('should split string using a pattern', () => {
			const actual = resolveOperation('a, b,c', '/', ', ?');
			expect(actual).toEqual(['a', 'b', 'c']);
		});

		it('should split string on a number', () => {
			const actual = resolveOperation('a2b', '/', 2);
			expect(actual).toEqual(['a', 'b']);
		});

		it('should return empty value if values are not compatible', () => {
			const actual = resolveOperation('a', '/', false);
			expect(actual).toBeNull();
		});
	});
	
	describe('*', () => {
		it('should multiply numbers', () => {
			const actual = resolveOperation(2, '*', 3);
			expect(actual).toBe(6);
		});

		it('should join string', () => {
			const actual = resolveOperation(['a', 'b', 'c'], '*', ', ');
			expect(actual).toBe('a, b, c');
		});
		
		it('should join a string even if values are reversed', () => {
			const actual = resolveOperation(', ', '*', ['a', 'b', 'c']);
			expect(actual).toBe('a, b, c');
		});
		
		it('should repeat a string', () => {
			const actual = resolveOperation('0', '*', 4);
			expect(actual).toBe('0000');
		});
		
		it('should repeat a string even if values are reversed', () => {
			const actual = resolveOperation(4, '*', '0');
			expect(actual).toBe('0000');
		});

		it('should return empty value if values are not compatible', () => {
			const actual = resolveOperation('a', '*', 'b');
			expect(actual).toBeNull();
		});
	});
	
	describe('%', () => {
		it('should mod numbers', () => {
			const actual = resolveOperation(3, '%', 2);
			expect(actual).toBe(1);
		});

		it('should return empty value if values are not compatible', () => {
			const actual = resolveOperation('a', '%', 2);
			expect(actual).toBeNull();
		});
	});
	
	describe('^', () => {
		it('should raise a number to the power of another number', () => {
			const actual = resolveOperation(2, '^', 3);
			expect(actual).toBe(8);
		});

		it('should return empty if values are not compatible', () => {
			const actual = resolveOperation(2, '^', 'a');
			expect(actual).toBeNull();
		});
	});
	
	describe('.', () => {
		it('should fetch from object using a variable key', () => {
			const actual = resolveOperation({ a: 'b', b: 2 }, '.', 'b');
			expect(actual).toBe(2);
		});

		it('should fetch from object using a string key', () => {
			const actual = resolveOperation({ a: 2 }, '.', 'a');
			expect(actual).toBe(2);
		});
		
		it('should fetch from object using a number key', () => {
			const actual = resolveOperation({ '0': 2 }, '.', 0);
			expect(actual).toBe(2);
		});

		it('should fetch from array using a string key', () => {
			const actual = resolveOperation([2], '.', 'length');
			expect(actual).toBe(1);
		});

		it('should fetch from array using a number key', () => {
			const actual = resolveOperation([2], '.', 0);
			expect(actual).toBe(2);
		});

		it('should fetch from string using a string key', () => {
			const actual = resolveOperation('asdf', '.', 'length');
			expect(actual).toBe(4);
		});
		
		it('should fetch from string using a number key', () => {
			const actual = resolveOperation('asdf', '.', 2);
			expect(actual).toBe('d');
		});

		it('should return empty value if values are not compatible', () => {
			const actual = resolveOperation(2, '.', 'a');
			expect(actual).toBeNull();
		});
	});
	
	describe('?', () => {
		it('should return true if value exists', () => {
			const actual = resolveOperation(undefined, '?', { a: 'a' });
			expect(actual).toBe(true);
		});

		it('should return false if value does not exist', () => {
			const actual = resolveOperation(undefined, '?', null);
			expect(actual).toBe(false);
		});
	});
});
