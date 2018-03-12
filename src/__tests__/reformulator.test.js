import resolveBlock from '../reformulator';

describe('reformulator', () => {
	it('should parse positive numbers', () => {
		expect(resolveBlock('2')).toBe(2);
	});

	it('should parse negative numbers', () => {
		expect(resolveBlock('-2')).toBe(-2);
	});

	it('should parse boolean true values', () => {
		expect(resolveBlock('true')).toBe(true);
	});

	it('should parse boolean false values', () => {
		expect(resolveBlock('false')).toBe(false);
	});

	it('should use variables', () => {
		expect(resolveBlock('a', { a: 2 })).toBe(2);
	});

	it('should support using a literal as the input data', () => {
		expect(resolveBlock('$', 2)).toBe(2);
	});

	it('should parse strings with single quotes', () => {
		expect(resolveBlock("'http://www.domain.com'")).toBe('http://www.domain.com');
	});

	it('should parse strings with escaped single quotes inside single quotes', () => {
		expect(resolveBlock("'key=\\'value\\''")).toBe('key=\'value\'');
	});

	it('should parse strings with double quotes', () => {
		expect(resolveBlock('"http://www.domain.com"')).toBe('http://www.domain.com');
	});

	it('should parse strings with escaped double quotes inside double quotes', () => {
		expect(resolveBlock('"key=\\"value\\""')).toBe("key=\"value\"");
	});

	it('should respect the order of operations', () => {
		expect(resolveBlock('1 + 2 * 3')).toBe(7);
	});
	
	describe('(', () => {
		it('should process expression to the right first', () => {
			expect(resolveBlock('2 * (1 + 2)')).toBe(6);
		});

		it('should set result of expression in parenthesis to negative if sign is present', () => {
			expect(resolveBlock('2 * -(1 + 2)')).toBe(-6);
		});
	});

	describe(')', () => {
		it('should process expression to the left first', () => {
			expect(resolveBlock('(1 + 2) * 2')).toBe(6);
		});
	});

	describe('|', () => {
		it('should return first value if it is defined', () => {
			expect(resolveBlock('$ | "fallback"', 'value')).toBe('value');
		});

		it('should return second value if first is empty', () => {
			expect(resolveBlock('$ | "fallback"')).toBe('fallback');
		});
	});

	describe('&', () => {
		it('should return null if first is empty', () => {
			expect(resolveBlock('$ & "value"')).toBeNull();
		});

		it('should return null if first is false', () => {
			expect(resolveBlock('$ & "value"', false)).toBeNull();
		});

		it('should return second value if first is defined', () => {
			expect(resolveBlock('$ & "value"', true)).toBe('value');
		});
	});

	describe('=', () => {
		it('should return value if both are the same', () => {
			expect(resolveBlock('$ = 2', 2)).toBe(2);
		});

		it('should return first object if it matches second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			expect(resolveBlock('a = b', {
				a: firstValue,
				b: {
					parent: { child: 2 }
				}
			})).toBe(firstValue);
		});

		it('should not return first object if it contains more than second object', () => {
			expect(resolveBlock('a = b', {
				a: {
					parent: { child: 2 },
					extra: 3
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});

		it('should not return first object if it contains less than second object', () => {
			expect(resolveBlock('a = b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: { child: 2 },
					extra: 3
				}
			})).toBeNull();
		});

		it('should not return first object if values are incompatible', () => {
			expect(resolveBlock('$ = 2', { value: 2 })).toBeNull();
		});

		it('should return null if the values are not the same', () => {
			expect(resolveBlock('$ = 2', 1)).toBeNull();
		});

		it('should return null if the first value is empty', () => {
			expect(resolveBlock('$ = 2')).toBeNull();
		});
	});

	describe('!', () => {
		it('should return first value only if it is not the same as the second', () => {
			expect(resolveBlock('$ ! 2', 1)).toBe(1);
		});

		it('should return first object if it does not match second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			expect(resolveBlock('a ! b', {
				a: firstValue,
				b: 2
			})).toBe(firstValue);
		});

		it('should return first object if it contains more than second object', () => {
			const firstValue = {
				parent: { child: 2 },
				extra: 3
			};

			expect(resolveBlock('a ! b', {
				a: firstValue,
				b: {
					parent: { child: 2 }
				}
			})).toBe(firstValue);
		});

		it('should return first object if it contains less than second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			expect(resolveBlock('a ! b', {
				a: firstValue,
				b: {
					parent: { child: 2 },
					extra: 3
				}
			})).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			expect(resolveBlock('a ! b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});

		it('should return null if the values are the same', () => {
			expect(resolveBlock('$ ! 2', 2)).toBeNull();
		});

		it('should return null if the first value is empty', () => {
			expect(resolveBlock('$ ! 2')).toBeNull();
		});

		it('should return true if immediate value is empty', () => {
			expect(resolveBlock('!$')).toBe(true);
		});

		it('should return false if immediate value is defined', () => {
			expect(resolveBlock('!$', 2)).toBe(false);
		});
	});

	describe('<', () => {
		it('should return first value if it is less than the second value', () => {
			expect(resolveBlock('2 < 3')).toBe(2);
		});

		it('should return first object if its properties match those same properties in second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			expect(resolveBlock('a < b', {
				a: firstValue,
				b: {
					parent: {
						child: 2,
						extra: 3
					},
					extra: 3
				}
			})).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			expect(resolveBlock('a < b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});

		it('should not return first object if second object contains the same data plus more', () => {
			expect(resolveBlock('a < b', {
				a: {
					parent: {
						child: 2,
						extra: 3
					},
					extra: 3
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});
		
		it('should return empty if it is not less than the second value', () => {
			expect(resolveBlock('4 < 3')).toBeNull();
		});

		it('should return empty if the values are not comparable', () => {
			expect(resolveBlock('a < 2', { a: { b: 2 }})).toBeNull();
		});
	});

	describe('>', () => {
		it('should return first value if it is less than the second value', () => {
			expect(resolveBlock('3 > 2')).toBe(3);
		});

		it('should return first object if it contains all the same data as second object plus more', () => {
			const firstValue = {
				parent: {
					child: 2,
					extra: 3
				},
				extra: 3
			};

			expect(resolveBlock('a > b', {
				a: firstValue,
				b: {
					parent: { child: 2 }
				}
			})).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			expect(resolveBlock('a > b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});

		it('should not return first object if it is missing properties found in second object', () => {
			expect(resolveBlock('a > b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: {
						child: 2,
						extra: 3
					},
					extra: 3
				}
			})).toBeNull();
		});
		
		it('should return empty if it is not less than the second value', () => {
			expect(resolveBlock('3 > 4')).toBeNull();
		});

		it('should return empty if the values are not compatible', () => {
			expect(resolveBlock('a > 2', {
				a: { b: 2 }
			})).toBeNull();
		});
	});

	describe('#', () => {
		it('should remove all decimals if second value is zero', () => {
			expect(resolveBlock('1.666 # 0')).toBe('1');
		});
		
		it('should remove a set amount of decimals if second value is greater than zero', () => {
			expect(resolveBlock('1.666 # 2')).toBe('1.66');
		});

		it('should return empty if the first value is not a number', () => {
			expect(resolveBlock('"value" # 0')).toBeNull();
		});
	});
	
	describe('+', () => {
		it('should add numbers', () => {
			expect(resolveBlock('1 + 2')).toBe(3);
		});

		it('should combine numbers and strings', () => {
			expect(resolveBlock('"a" + 2')).toBe('a2');
		});

		it('should concatenate strings', () => {
			expect(resolveBlock('"a" + "b"')).toBe('ab');
		});

		it('should concatenate arrays', () => {
			expect(resolveBlock('a + b', {
				a: [2, 3],
				b: [4, 5]
			})).toEqual([2, 3, 4, 5]);
		});

		it('should overwrite properties from second object to first object', () => {
			expect(resolveBlock('a + b', {
				a: {
					keep: 2,
					overwrite: 3,
				},
				b: {
					overwrite: 4,
					add: 5
				}
			})).toEqual({
				keep: 2,
				overwrite: 4,
				add: 5
			});
		});

		it('should add a value to the end of the array', () => {
			expect(resolveBlock('$ + 4', [2, 3])).toEqual([2, 3, 4]);
		});

		it('should add a value to the beginning of the array', () => {
			expect(resolveBlock('4 + $', [3, 2])).toEqual([4, 3, 2]);
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolveBlock('$ + 2', { value:  2 })).toBeNull();
		});
	});
	
	describe('-', () => {
		it('should subtracted numbers', () => {
			expect(resolveBlock('2 - 1')).toBe(1);
		});

		it('should remove pattern from string', () => {
			expect(resolveBlock('"asdf" - "^a.d"')).toBe('f');
		});

		it('should return result of subtracted suffix', () => {
			expect(resolveBlock('"asdf" - "df"')).toBe('as');
		});

		it('should return first value if suffix is not present', () => {
			expect(resolveBlock('"asdf" - "x"')).toBe('asdf');
		});

		it('should remove property from first object', () => {
			expect(resolveBlock('$ - "remove"', {
				keep: 2,
				remove: 3
			})).toEqual({ keep: 2 });
		});

		it('should remove a number of values from the beginning of an array', () => {
			expect(resolveBlock('2 - $', [2, 3, 4, 5])).toEqual([4, 5]);
		});

		it('should remove a number of values from the end of an array', () => {
			expect(resolveBlock('$ - 2', [2, 3, 4, 5])).toEqual([2, 3]);
		});

		it('should remove a number of values from the beginning of a string', () => {
			expect(resolveBlock('2 - $', 'asdf')).toEqual('df');
		});

		it('should remove a number of values from the end of a string', () => {
			expect(resolveBlock('$ - 2', 'asdf')).toEqual('as');
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolveBlock('$ - 2', { value:  2 })).toBeNull();
		});
	});
	
	describe('/', () => {
		it('should divide numbers', () => {
			expect(resolveBlock('6 / 2')).toBe(3);
		});

		it('should split string using a pattern', () => {
			expect(resolveBlock('"a, b,c" / ", ?"')).toEqual(['a', 'b', 'c']);
		});

		it('should split string on a number', () => {
			expect(resolveBlock('"a2b" / 2')).toEqual(['a', 'b']);
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolveBlock('"a" / $', false)).toBeNull();
		});
	});
	
	describe('*', () => {
		it('should multiply numbers', () => {
			expect(resolveBlock('2 * 3')).toBe(6);
		});

		it('should join string', () => {
			expect(resolveBlock('$ * ", "', ['a', 'b', 'c'])).toBe('a, b, c');
		});
		
		it('should join a string even if values are reversed', () => {
			expect(resolveBlock('", " * $', ['a', 'b', 'c'])).toBe('a, b, c');
		});
		
		it('should repeat a string', () => {
			expect(resolveBlock('"0" * 4')).toBe('0000');
		});
		
		it('should repeat a string even if values are reversed', () => {
			expect(resolveBlock('4 * "0"')).toBe('0000');
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolveBlock('"a" * "b"')).toBeNull();
		});
	});
	
	describe('%', () => {
		it('should mod numbers', () => {
			expect(resolveBlock('3 % 2')).toBe(1);
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolveBlock('"a" % 2')).toBeNull();
		});
	});
	
	describe('.', () => {
		it('should fetch from object using a variable key', () => {
			expect(resolveBlock('$.b', { b: 'c', c: 2 })).toBe(2);
		});

		it('should fetch from object using a string key', () => {
			expect(resolveBlock('$."b"', { b: 2 })).toBe(2);
		});
		
		it('should fetch from object using a number key', () => {
			expect(resolveBlock('$.0', { '0': 2 })).toBe(2);
		});

		it('should fetch from array using a string key', () => {
			expect(resolveBlock('$."length"', [2])).toBe(1);
		});

		it('should fetch from array using a number key', () => {
			expect(resolveBlock('$.0', [2])).toBe(2);
		});

		it('should fetch from string using a string key', () => {
			expect(resolveBlock('"asdf"."length"')).toBe(4);
		});
		
		it('should fetch from string using a number key', () => {
			expect(resolveBlock('"asdf".2')).toBe('d');
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolveBlock('$."b"', 2)).toBeNull();
		});
	});

	it('should use local state', () => {
		const actual = resolveBlock({
			_: { b: 'a * 2' },
			value: '1 + b'
		}, { a: 2 });

		expect(actual).toEqual({ value: 5 });
	});

	it('should not look beyond local state for a value that was set to null', () => {
		const actual = resolveBlock({
			_: {
				a: 'a',
				b: 'c * 2'
			},
			value: '1 + b'
		}, { a: 2 }, { b: 3 });

		expect(actual).toBeNull();
	});
	
	it('should transform an array', () => {
		const actual = resolveBlock({
			value: '1 + b'
		}, [
			{ b: 1 },
			{ b: 2 }
		]);

		expect(actual).toEqual([
			{ value: 2 },
			{ value: 3 }
		]);
	});

	it('should transform an array within an object', () => {
		const actual = resolveBlock({
			_: 'a',
			value: '1 + b'
		}, {
			a: [
				{ b: 1 },
				{ b: 2 }
			]
		});

		expect(actual).toEqual([
			{ value: 2 },
			{ value: 3 }
		]);
	});

	it('should use representation block', () => {
		const actual = resolveBlock({
			_: { b: 'a * 2' },
			$: '1 + b'
		}, { a: 2 });

		expect(actual).toEqual(5);
	});

	it('should use representation block in an array', () => {
		const actual = resolveBlock({
			_: 'a',
			$: '1 + b'
		}, {
			a: [
				{ b: 1 },
				{ b: 2 }
			]
		});

		expect(actual).toEqual([2, 3]);
	});

	it('should transform arrays of arrays', () => {
		expect(resolveBlock({
			$: {
				$: '$ + 1'
			}
		}, [
			[0, 1],
			['a', 'b']
		])).toEqual([
			[1, 2],
			['a1', 'b1']
		]);
	});

	it('should not transform properties if there is a literal representation', () => {
		const actual = resolveBlock({
			$: 'a = 2',
			value: '3'
		}, { a: 2 });

		expect(actual).toEqual(2);
	});

	it('should not transform if local state is empty', () => {
		const actual = resolveBlock({
			_: 'a ! 2',
			value: '1 + $'
		}, { a: 2 });

		expect(actual).toBeNull();
	});

	it('should modify an existing object', () => {
		const actual = resolveBlock({
			$: 'a',
			c: '3'
		}, {
			a: { b: 2 }
		});

		expect(actual).toEqual({
			b: 2,
			c: 3
		});
	});

	it('should not transform if input data is missing and is expected', () => {
		const actual = resolveBlock('1 + a');
		expect(actual).toBeNull();
	});

	it('should use them all together', () => {
		const actual = resolveBlock({
			_: { width: 'container = "wide" & 120 | 60' },
			panels: {
				_: 'images',
				image: {
					_: 'image',
					$: '"http://image.domain.com/" + (rectangle | square) + "?width=" + width + "&height=" + (width * 9 / 16 # 0)'
				},
				comments: {
					_: 'showComments & comments',
					$: 'author & author + ": " + comment'
				}
			}
		}, {
			container: 'wide',
			images: [
				{
					showComments: true,
					image: {
						square: 'square-image.jpg',
						rectangle: 'rectangle-image.jpg'
					},
					comments: [
						{
							comment: 'Comment One'
						},
						{
							author: 'Author Two',
							comment: 'Comment Two'
						}
					]
				},
				{
					showComments: true,
					image: {
						square: 'square-image.jpg'
					},
					comments: [
						{
							author: 'Author',
							comment: 'Comment'
						}
					]
				},
				{
					showComments: false,
					image: {
						square: 'square-image.jpg'
					},
					comments: [
						{
							author: 'Author',
							comment: 'Comment'
						}
					]
				}
			]
		});

		expect(actual).toEqual({
			panels: [
				{
					image: 'http://image.domain.com/rectangle-image.jpg?width=120&height=67',
					comments: ['Author Two: Comment Two']
				},
				{
					image: 'http://image.domain.com/square-image.jpg?width=120&height=67',
					comments: ['Author: Comment']
				},
				{
					image: 'http://image.domain.com/square-image.jpg?width=120&height=67',
				}
			]
		});
	});
});
