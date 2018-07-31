import { isClientSide } from '../environment';
import reform from '../reformulator';

jest.mock('../environment', () => ({ isClientSide: jest.fn() }));

describe('reformulator', () => {
	describe('server side', () => {
		beforeEach(() => {
			isClientSide.mockReturnValue(false);
		});

		it('should pass through non element results', () => {
			const actual = reform('1 + a', { a: 'a' });
			expect(actual).toBe('1a');
		});

		it('should return single element from string', () => {
			const actual = reform('<p ["a"]>');
			expect(actual).toBe('<p>a</p>');
		});

		it('should wrap repeated elements from string', () => {
			const actual = reform('<p [@]>', ['a', 'b']);
			expect(actual).toBe('<div><p>a</p><p>b</p></div>');
		});

		it('should return single element from template', () => {
			const actual = reform([
				'@', [
					'<p [@]>'
				]
			], 'a');

			expect(actual).toBe('<p>a</p>');
		});

		it('should wrap repeated elements from template', () => {
			const actual = reform([
				'@', [
					'<p [@]>'
				]
			], ['a', 'b']);

			expect(actual).toBe('<div><p>a</p><p>b</p></div>');
		});

		it('should not include client side initializer if not needed', () => {
			const actual = reform('<p ["a"]>');
			expect(actual).toBe('<p>a</p>');
		});

		it('should include client side initializer if needed', () => {
			const actual = reform('<a [@ + (on & "Off" | "On")] onclick: on>', 'Turn ');
			
			expect(actual).toBe([
				'<a href="javascript:void(0);">Turn On</a>',
				'<script>reform("<a [@ + (on & \\"Off\\" | \\"On\\")] onclick: on>", "Turn ");</script>'
			].join(''));
		});
	});

	describe('client side', () => {
		beforeEach(() => {
			isClientSide.mockReturnValue(true);
			document.body.innerHTML = '';
		});

		it('should return single element from string', () => {
			const actual = reform('<p ["a"]>');
			expect(actual.tagName.toLowerCase()).toBe('p');
			expect(actual.innerHTML).toBe('a');
		});

		it('should wrap repeated elements from string', () => {
			const actual = reform('<p [@]>', ['a', 'b']);
			expect(actual.tagName.toLowerCase()).toBe('div');
			expect(actual.innerHTML).toBe('<p>a</p><p>b</p>');
		});

		it('should return single element from template', () => {
			const actual = reform([
				'@', [
					'<p [@]>'
				]
			], 'a');

			expect(actual.tagName.toLowerCase()).toBe('p');
			expect(actual.innerHTML).toBe('a');
		});

		it('should wrap repeated elements from template', () => {
			const actual = reform([
				'@', [
					'<p [@]>'
				]
			], ['a', 'b']);

			expect(actual.tagName.toLowerCase()).toBe('div');
			expect(actual.innerHTML).toBe('<p>a</p><p>b</p>');
		});
	});
});
