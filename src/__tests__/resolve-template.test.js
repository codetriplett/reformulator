import { resolveTemplate } from '../resolve-template';

jest.mock('../environment', () => ({ isClientSide: () => false }));

describe('resolve-template', () => {
	it('should resolve strings', () => {
		const actual = resolveTemplate('1 + @', {}, 2);
		expect(actual).toBe(3);
	});
	
	it('should resolve objects', () => {
		const actual = resolveTemplate({ key: '1 + @' }, {}, 2);
		expect(actual).toEqual({ key: 3 });
	});

	it('should repeat string template if data is an array', () => {
		const actual = resolveTemplate('@ + 1', {}, ['a', 'b']);
		expect(actual).toEqual(['a1', 'b1']);
	});

	it('should repeat object template if data is an array', () => {
		const actual = resolveTemplate({ key: '@ + 1' }, {}, ['a', 'b']);

		expect(actual).toEqual([
			{ key: 'a1' },
			{ key: 'b1' }
		]);
	});
	
	it('should return null if no properties from object exist', () => {
		const actual = resolveTemplate({ key: '1 + @' });
		expect(actual).toBeNull();
	});
	
	it('should return null when template is empty', () => {
		const actual = resolveTemplate();
		expect(actual).toBeNull();
	});
	
	it('should return null when template type is invalid', () => {
		const actual = resolveTemplate(1);
		expect(actual).toBeNull();
	});

	describe('arrays', () => {
		it('should repeat array template if data is an array', () => {
			const actual = resolveTemplate([
				'@', [
					'@ + 1',
					'@ + 2',
				]
			], {}, ['a', 'b']);

			expect(actual).toEqual(['a1', 'a2', 'b1', 'b2']);
		});

		it('should return array of values that use different local data', () => {
			const actual = resolveTemplate([
				{ key: '@' },
				'1 + key',
				{ key: '@' },
				{ key: 'key + 1' },
				'2 + key'
			], {}, 3);

			expect(actual).toEqual([4, 6]);
		});

		it('should skip string template if object is null', () => {
			const actual = resolveTemplate([
				{ key: '@' },
				'1 + key'
			]);

			expect(actual).toBeNull();
		});
		
		it('should resolve sub template using a custom scope', () => {
			const actual = resolveTemplate([
				'key', [
					'1 + @',
					'2 + @'
				]
			], {}, { key: 2 });

			expect(actual).toEqual([3, 4]);
		});

		it('should skip sub template if the value before it is empty', () => {
			const actual = resolveTemplate([
				'b', [
					'"b"'
				]
			], {}, 'a');

			expect(actual).toBeNull();
		});
		
		it('should allow empty elements if the scope was also empty', () => {
			const actual = resolveTemplate(['<div []>']);

			expect(actual).toMatchObject({
				type: 'div',
				scope: null
			});
		});
		
		it('should scope and wrap each sub template of an element properly', () => {
			const actual = resolveTemplate([
				'<p [x] @>', [
					'@'
				]
			], {}, { x: ['a', 'b'] });

			expect(actual).toMatchObject([
				{
					type: 'p',
					classNames: ['a'],
					content: ['a'],
					scope: 'a'
				},
				{
					type: 'p',
					classNames: ['b'],
					content: ['b'],
					scope: 'b'
				}
			]);
		});

		it('should skip element if result of sub template is empty', () => {
			const actual = resolveTemplate([
				'<div>', [
					'a'
				]
			]);

			expect(actual).toBeNull();
		});
		
		it('should still render container if sub template is empty', () => {
			const actual = resolveTemplate([
				'<div>', []
			]);

			expect(actual).toMatchObject({
				type: 'div'
			});
		});

		it('should work with something more complicated', () => {
			const actual = resolveTemplate([
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
			], {}, {
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
			});

			expect(actual).toMatchObject({
				type: 'ul',
				classNames: [],
				attributes: {},
				content: [
					{
						type: 'li',
						classNames: [],
						attributes: {},
						content: [
							{
								type: 'a',
								classNames: [],
								attributes: { href: '/one' },
								content: [
									{
										type: 'img',
										classNames: ['image'],
										attributes: { alt: 'image one', src: '/one.jpg' },
										content: undefined
									}
								]
							},
							{
								type: 'p',
								classNames: [],
								attributes: {},
								content: [
									'one one one',
									' ',
									{
										type: 'a',
										attributes: { href: '/one' },
										scope: 'click one'
									}
								]
							}
						]
					},
					{
						type: 'li',
						classNames: [],
						attributes: {},
						content: [
							{
								type: 'a',
								classNames: [],
								attributes: { href: '/two' },
								content: [
									{
										type: 'img',
										classNames: ['image'],
										attributes: { alt: 'image two', src: '/two.jpg' },
										content: undefined
									}
								]
							},
							{
								type: 'p',
								classNames: [],
								attributes: {},
								content: [
									'two two two'
								]
							}
						]
					},
					{
						type: 'li',
						classNames: [],
						attributes: {},
						content: [
							{
								type: 'img',
								classNames: ['image'],
								attributes: { alt: 'image three', src: '/three.jpg' },
								content: undefined
							},
							{
								type: 'p',
								classNames: [],
								attributes: {},
								content: [
									'three three three'
								]
							}
						]
					},
					{
						type: 'li',
						classNames: [],
						attributes: {},
						content: [
							{
								type: 'img',
								classNames: ['image'],
								attributes: { alt: 'image three', src: '/three.jpg' },
								content: undefined
							}
						]
					}
				]
			});
		});
	});
});
