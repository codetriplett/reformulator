import { ElementStructure } from '../element-structure';
import { typeOf } from '../type-of';

describe('type-of', () => {
	describe('specific', () => {
		it('should detect elements', () => {
			const actual = typeOf(new ElementStructure(undefined, 'div'));
			expect(actual).toBe('element');
		});

		it('should detect arrays', () => {
			const actual = typeOf(['value']);
			expect(actual).toBe('array');
		});

		it('should detect objects', () => {
			const actual = typeOf({ key: 'value' });
			expect(actual).toBe('object');
		});

		it('should detect strings', () => {
			const actual = typeOf('value');
			expect(actual).toBe('string');
		});

		it('should detect number', () => {
			const actual = typeOf(1);
			expect(actual).toBe('number');
		});

		it('should detect boolean', () => {
			const actual = typeOf(false);
			expect(actual).toBe('boolean');
		});

		it('should detect empty', () => {
			const actual = typeOf(null);
			expect(actual).toBe('empty');
		});
	});
	
	describe('generic', () => {
		it('should detect elements', () => {
			const actual = typeOf(new ElementStructure(undefined, 'div'), true);
			expect(actual).toBe('structure');
		});

		it('should detect arrays', () => {
			const actual = typeOf(['value'], true);
			expect(actual).toBe('structure');
		});

		it('should detect objects', () => {
			const actual = typeOf({ key: 'value' }, true);
			expect(actual).toBe('structure');
		});

		it('should detect strings', () => {
			const actual = typeOf('value', true);
			expect(actual).toBe('literal');
		});

		it('should detect number', () => {
			const actual = typeOf(1, true);
			expect(actual).toBe('literal');
		});

		it('should detect boolean', () => {
			const actual = typeOf(false, true);
			expect(actual).toBe('literal');
		});

		it('should detect empty', () => {
			const actual = typeOf(null, true);
			expect(actual).toBe('empty');
		});
	});
});
