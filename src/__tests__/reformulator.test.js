import resolve from '../reformulator';

describe('reformulator', () => {
	describe('number', () => {
		it('should parse positive numbers', () => {
			expect(resolve('2')).toBe(2);
		});

		it('should parse negative numbers', () => {
			expect(resolve('-2')).toBe(-2);
		});
	});

	describe('boolean', () => {
		it('should parse boolean true values', () => {
			expect(resolve('true')).toBe(true);
		});

		it('should parse boolean false values', () => {
			expect(resolve('false')).toBe(false);
		});
	});

	describe('variable', () => {
		it('should use variables', () => {
			expect(resolve('a', { a: 2 })).toBe(2);
		});

		it('should allow negative variables', () => {
			expect(resolve('-a', { a: 2 })).toBe(-2);
		});

		it('should support using the entire state', () => {
			expect(resolve('@', 2)).toBe(2);
		});
	});

	describe('string', () => {
		it('should parse strings with single quotes', () => {
			expect(resolve("'http://www.domain.com'")).toBe('http://www.domain.com');
		});

		it('should parse strings with escaped single quotes inside single quotes', () => {
			expect(resolve("'key=\\'value\\''")).toBe('key=\'value\'');
		});

		it('should parse strings with double quotes', () => {
			expect(resolve('"http://www.domain.com"')).toBe('http://www.domain.com');
		});

		it('should parse strings with escaped double quotes inside double quotes', () => {
			expect(resolve('"key=\\"value\\""')).toBe("key=\"value\"");
		});
	});

	describe('object', () => {
		it('should parse objects', () => {
			expect(resolve('{ a: b + 1, c: 2 }', { b: 'b' })).toEqual({ a: 'b1', c: 2 });
		});

		it('should filter out empty entries', () => {
			expect(resolve('{ a: 1 + 2, b: b }')).toEqual({ a: 3 });
		});

		it('should return empty for invalid object', () => {
			expect(resolve('{ a: 1 + 2 : b }')).toBeNull();
		});
	});

	describe('array', () => {
		it('should parse arrays', () => {
			expect(resolve('[1 + 2, b]', { b: 'b' })).toEqual([3, 'b']);
		});

		it('should filter out empty entries', () => {
			expect(resolve('[1 + 2, b]')).toEqual([3]);
		});

		it('should return empty for invalid object', () => {
			expect(resolve('[1 + 2, b: "b": 2]')).toBeNull();
		});
	});

	describe('element', () => {
		it('should parse elements', () => {
			expect(resolve('<div [a] @, @ + 1, key: @, flag: true>', { a: 'a' })).toEqual('<div class="a a1" key="a" flag>a</div>');
		});

		it('should not set content or end tag for singleton elements', () => {
			expect(resolve('<br [a] @, @ + 1, key: @, flag: true>', { a: 'a' })).toEqual('<br class="a a1" key="a" flag>');
		});

		it('should set default props for img', () => {
			expect(resolve('<img>')).toEqual('<img alt="">');
		});

		it('should sort attributes alphabetically and by type', () => {
			expect(resolve('<img [] b: "b", d: true, "a c", a: "a", c: true, "b">')).toEqual('<img class="a b c" a="a" alt="" b="b" c d>');
		});

		it('should filter out empty classes and attributes', () => {
			expect(resolve('<img [] "a", b & "b", a: "a", b: b, alt: b>')).toEqual('<img class="a" a="a" alt="">');
		});

		it('should return array if scope is array', () => {
			expect(resolve('<br [x] @>', { x: ['a', 'b'] })).toEqual(['<br class="a">', '<br class="b">']);
		});

		it('should return empty if scope is empty', () => {
			expect(resolve('<div [a]>')).toBeNull();
		});

		it('should return empty for invalid object', () => {
			expect(resolve('<div [] @: @ + 1: 1 + 2>')).toBeNull();
		});
	});

	describe('order', () => {
		it('should respect the order of operations', () => {
			expect(resolve('1 + 2 * 3')).toBe(7);
		});

		it('should respect the order of operations with negative variables', () => {
			expect(resolve('1 + -a * 3', { a: 2 })).toBe(-5);
		});
	});

	describe('(', () => {
		it('should process expression to the right first', () => {
			expect(resolve('2 * (1 + 2)')).toBe(6);
		});

		it('should set result of expression in parenthesis to negative if sign is present', () => {
			expect(resolve('2 * -(1 + 2)')).toBe(-6);
		});
	});

	describe(')', () => {
		it('should process expression to the left first', () => {
			expect(resolve('(1 + 2) * 2')).toBe(6);
		});
	});

	describe('|', () => {
		it('should return first value if it is defined', () => {
			expect(resolve('@ | "fallback"', 'value')).toBe('value');
		});

		it('should return second value if first is empty', () => {
			expect(resolve('@ | "fallback"')).toBe('fallback');
		});
	});

	describe('&', () => {
		it('should return null if first is empty', () => {
			expect(resolve('@ & "value"')).toBeNull();
		});

		it('should return null if first is false', () => {
			expect(resolve('@ & "value"', false)).toBeNull();
		});

		it('should return second value if first is defined', () => {
			expect(resolve('@ & "value"', true)).toBe('value');
		});
	});

	describe('=', () => {
		it('should return value if both are the same', () => {
			expect(resolve('@ = 2', 2)).toBe(2);
		});

		it('should return first object if it matches second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			expect(resolve('a = b', {
				a: firstValue,
				b: {
					parent: { child: 2 }
				}
			})).toBe(firstValue);
		});

		it('should not return first object if it contains more than second object', () => {
			expect(resolve('a = b', {
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
			expect(resolve('a = b', {
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
			expect(resolve('@ = 2', { value: 2 })).toBeNull();
		});

		it('should return null if the values are not the same', () => {
			expect(resolve('@ = 2', 1)).toBeNull();
		});

		it('should return null if the first value is empty', () => {
			expect(resolve('@ = 2')).toBeNull();
		});
	});

	describe('!', () => {
		it('should return first value only if it is not the same as the second', () => {
			expect(resolve('@ ! 2', 1)).toBe(1);
		});

		it('should return first object if it does not match second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			expect(resolve('a ! b', {
				a: firstValue,
				b: 2
			})).toBe(firstValue);
		});

		it('should return first object if it contains more than second object', () => {
			const firstValue = {
				parent: { child: 2 },
				extra: 3
			};

			expect(resolve('a ! b', {
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

			expect(resolve('a ! b', {
				a: firstValue,
				b: {
					parent: { child: 2 },
					extra: 3
				}
			})).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			expect(resolve('a ! b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});

		it('should return null if the values are the same', () => {
			expect(resolve('@ ! 2', 2)).toBeNull();
		});

		it('should return null if the first value is empty', () => {
			expect(resolve('@ ! 2')).toBeNull();
		});

		it('should return true if immediate value is empty', () => {
			expect(resolve('!@')).toBe(true);
		});

		it('should return false if immediate value is defined', () => {
			expect(resolve('!@', 2)).toBe(false);
		});

		it('should test against a negated value', () => {
			expect(resolve('true ! !@', 2)).toBe(true);
		});
	});

	describe('<', () => {
		it('should return first value if it is less than the second value', () => {
			expect(resolve('2 < 3')).toBe(2);
		});

		it('should return first object if its properties match those same properties in second object', () => {
			const firstValue = {
				parent: { child: 2 }
			};

			expect(resolve('a < b', {
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
			expect(resolve('a < b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});

		it('should not return first object if second object contains the same data plus more', () => {
			expect(resolve('a < b', {
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
			expect(resolve('4 < 3')).toBeNull();
		});

		it('should return empty if the values are not comparable', () => {
			expect(resolve('a < 2', {
				a: { b: 2 }
			})).toBeNull();
		});
	});

	describe('>', () => {
		it('should return first value if it is less than the second value', () => {
			expect(resolve('3 > 2')).toBe(3);
		});

		it('should return first object if it contains all the same data as second object plus more', () => {
			const firstValue = {
				parent: {
					child: 2,
					extra: 3
				},
				extra: 3
			};

			expect(resolve('a > b', {
				a: firstValue,
				b: {
					parent: { child: 2 }
				}
			})).toBe(firstValue);
		});

		it('should not return first object if it matches second object', () => {
			expect(resolve('a > b', {
				a: {
					parent: { child: 2 }
				},
				b: {
					parent: { child: 2 }
				}
			})).toBeNull();
		});

		it('should not return first object if it is missing properties found in second object', () => {
			expect(resolve('a > b', {
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
			expect(resolve('3 > 4')).toBeNull();
		});

		it('should return empty if the values are not compatible', () => {
			expect(resolve('a > 2', {
				a: { b: 2 }
			})).toBeNull();
		});
	});

	describe('#', () => {
		it('should remove all decimals if second value is zero', () => {
			expect(resolve('1.666 # 0')).toBe('1');
		});
		
		it('should remove a set amount of decimals if second value is greater than zero', () => {
			expect(resolve('1.666 # 2')).toBe('1.66');
		});

		it('should return empty if the first value is not a number', () => {
			expect(resolve('"value" # 0')).toBeNull();
		});
	});
	
	describe('+', () => {
		it('should add numbers', () => {
			expect(resolve('1 + 2')).toBe(3);
		});

		it('should combine numbers and strings', () => {
			expect(resolve('"a" + 2')).toBe('a2');
		});

		it('should concatenate strings', () => {
			expect(resolve('"a" + "b"')).toBe('ab');
		});

		it('should concatenate arrays', () => {
			expect(resolve('a + b', {
				a: [2, 3],
				b: [4, 5]
			})).toEqual([2, 3, 4, 5]);
		});

		it('should overwrite properties from second object to first object', () => {
			expect(resolve('a + b', {
				a: {
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
				},
				b: {
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
				}
			})).toEqual({
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
			expect(resolve('a + 4', { a: [2, 3] })).toEqual([2, 3, 4]);
		});

		it('should add a value to the beginning of the array', () => {
			expect(resolve('4 + a', { a: [3, 2] })).toEqual([4, 3, 2]);
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolve('@ + 2', { value:  2 })).toBeNull();
		});
	});
	
	describe('-', () => {
		it('should subtracted numbers', () => {
			expect(resolve('2 - 1')).toBe(1);
		});

		it('should remove pattern from string', () => {
			expect(resolve('"asdf" - "^a.d"')).toBe('f');
		});

		it('should return result of subtracted suffix', () => {
			expect(resolve('"asdf" - "df"')).toBe('as');
		});

		it('should return first value if suffix is not present', () => {
			expect(resolve('"asdf" - "x"')).toBe('asdf');
		});

		it('should remove property from first object', () => {
			expect(resolve('@ - "remove"', {
				keep: 2,
				remove: 3
			})).toEqual({ keep: 2 });
		});

		it('should remove a number of values from the beginning of an array', () => {
			expect(resolve('2 - a', { a: [2, 3, 4, 5] })).toEqual([4, 5]);
		});

		it('should remove a number of values from the end of an array', () => {
			expect(resolve('a - 2', { a: [2, 3, 4, 5] })).toEqual([2, 3]);
		});

		it('should remove a number of values from the beginning of a string', () => {
			expect(resolve('2 - @', 'asdf')).toEqual('df');
		});

		it('should remove a number of values from the end of a string', () => {
			expect(resolve('@ - 2', 'asdf')).toEqual('as');
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolve('@ - 2', { value:  2 })).toBeNull();
		});
	});
	
	describe('/', () => {
		it('should divide numbers', () => {
			expect(resolve('6 / 2')).toBe(3);
		});

		it('should split string using a pattern', () => {
			expect(resolve('"a, b,c" / ", ?"')).toEqual(['a', 'b', 'c']);
		});

		it('should split string on a number', () => {
			expect(resolve('"a2b" / 2')).toEqual(['a', 'b']);
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolve('"a" / @', false)).toBeNull();
		});
	});
	
	describe('*', () => {
		it('should multiply numbers', () => {
			expect(resolve('2 * 3')).toBe(6);
		});

		it('should join string', () => {
			expect(resolve('a * ", "', { a: ['a', 'b', 'c'] })).toBe('a, b, c');
		});
		
		it('should join a string even if values are reversed', () => {
			expect(resolve('", " * a', { a: ['a', 'b', 'c'] })).toBe('a, b, c');
		});
		
		it('should repeat a string', () => {
			expect(resolve('"0" * 4')).toBe('0000');
		});
		
		it('should repeat a string even if values are reversed', () => {
			expect(resolve('4 * "0"')).toBe('0000');
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolve('"a" * "b"')).toBeNull();
		});
	});
	
	describe('%', () => {
		it('should mod numbers', () => {
			expect(resolve('3 % 2')).toBe(1);
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolve('"a" % 2')).toBeNull();
		});
	});
	
	describe('^', () => {
		it('should raise a number to the power of another number', () => {
			expect(resolve('2 ^ 3')).toBe(8);
		});

		it('should return empty if values are not compatible', () => {
			expect(resolve('2 ^ "a"')).toBeNull();
		});
	});
	
	describe('.', () => {
		it('should fetch from object using a variable key', () => {
			expect(resolve('@.a', { a: 'b', b: 2 })).toBe(2);
		});

		it('should fetch from object using a string key', () => {
			expect(resolve('@."a"', { a: 2 })).toBe(2);
		});
		
		it('should fetch from object using a number key', () => {
			expect(resolve('@.0', { '0': 2 })).toBe(2);
		});

		it('should fetch from array using a string key', () => {
			expect(resolve('a."length"', { a: [2] })).toBe(1);
		});

		it('should fetch from array using a number key', () => {
			expect(resolve('a.0', { a: [2] })).toBe(2);
		});

		it('should fetch from string using a string key', () => {
			expect(resolve('"asdf"."length"')).toBe(4);
		});
		
		it('should fetch from string using a number key', () => {
			expect(resolve('"asdf".2')).toBe('d');
		});

		it('should return empty value if values are not compatible', () => {
			expect(resolve('@."a"', 2)).toBeNull();
		});
	});

	describe('template', () => {
		it('should return single result by itself', () => {
			expect(resolve([{ x: '@ + "b"'}], 'a')).toEqual({ x: 'ab' });
		});
		
		it('should scope sub template by the value that came before it', () => {
			expect(resolve([
				'a', [
					'@ + 1'
				]
			], { a: ['a', 'b', 'c'] })).toEqual(['a1', 'b1', 'c1']);
		});
		
		it('should skip sub template if the value before it is empty', () => {
			expect(resolve([
				'b', [
					'"b"'
				]
			], 'a')).toBeNull();
		});
		
		it('should set contents of element', () => {
			expect(resolve([
				'<div>', [
					'<p [@]>'
				]
			], 'a')).toBe('<div><p>a</p></div>');
		});
		
		it('should scope and wrap each sub template of an element properly', () => {
			expect(resolve([
				'<p [x] @>', [
					'@'
				]
			], { x: ['a', 'b'] })).toEqual([
				'<p class="a">a</p>',
				'<p class="b">b</p>'
			]);
		});
		
		it('should skip element if result of sub template is empty', () => {
			expect(resolve([
				'<div>', [
					'a'
				]
			])).toBeNull();
		});
		
		it('should append multiple results into one string', () => {
			expect(resolve([
				'<p [@ + "b"]>',
				'<p [@ + "c"]>'
			], 'a')).toEqual([
				'<p>ab</p>',
				'<p>ac</p>'
			]);
		});

		it('should work with something more complicated', () => {
			expect(resolve([
				'<ul>', [
					'<li [links]>', [
						'<a [url & image & @] href: url> | @', [
							'<img [image] "image", src: image, alt: alt>'
						],
						'<p [(description | text) & @]>', [
							'description',
							'description & text & " "',
							'<a [url & text] href: url>'
						]
					]
				]
			], {
				links: [
					{
						url: '/one',
						text: 'click one',
						image: '/one.jpg',
						alt: 'image one',
						description: 'one one one'
					},
					{
						url: '/two',
						image: '/two.jpg',
						alt: 'image two',
						description: 'two two two'
					},
					{
						image: '/three.jpg',
						alt: 'image three',
						description: 'three three three'
					},
					{
						image: '/three.jpg',
						alt: 'image three',
					},
					{
						url: '/two'
					}
				]
			})).toBe([
				'<ul>',
				'<li><a href="/one"><img class="image" alt="image one" src="/one.jpg"></a><p>one one one <a href="/one">click one</a></p></li>',
				'<li><a href="/two"><img class="image" alt="image two" src="/two.jpg"></a><p>two two two</p></li>',
				'<li><img class="image" alt="image three" src="/three.jpg"><p>three three three</p></li>',
				'<li><img class="image" alt="image three" src="/three.jpg"></li>',
				'</ul>'
			].join(''));
		});
	});
});
