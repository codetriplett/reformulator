import { mergeObjects } from '../merge-objects';

describe('merge-objects', () => {
	it('should merge objects', () => {
		const actual = mergeObjects(
			{ keep: 'first', update: 'first' },
			{ update: 'second', add: 'second' }
		);

		expect(actual).toEqual({ keep: 'first', update: 'second', add: 'second' });
	});
	
	it('should merge arrays', () => {
		let actual = mergeObjects(
			[
				{ keep: 'first', update: 'first' },
				{ keep: 'first' }
			],
			[
				{ update: 'second', add: 'second' }
			]
		);

		expect(actual).toEqual([
			{ keep: 'first', update: 'second', add: 'second' },
			{ keep: 'first'}
		]);

		actual = mergeObjects(
			[
				{ keep: 'first', update: 'first' }
			],
			[
				{ update: 'second', add: 'second' },
				{ add: 'second' }
			]
		);
		
		expect(actual).toEqual([
			{ keep: 'first', update: 'second', add: 'second' },
			{ add: 'second'}
		]);
	});
	
	it('should keep second input if types are not compatible', () => {
		let actual = mergeObjects('string', null);
		expect(actual).toBe(null);

		actual = mergeObjects(null, 'string');
		expect(actual).toBe('string');

		actual = mergeObjects({ key: 'object' }, 'string');
		expect(actual).toBe('string');

		actual = mergeObjects('string', { key: 'object' });
		expect(actual).toEqual({ key: 'object' });

		actual = mergeObjects(['array'], { key: 'object' });
		expect(actual).toEqual({ key: 'object' });

		actual = mergeObjects({ key: 'object' }, ['array']);
		expect(actual).toEqual(['array']);
	});
});
