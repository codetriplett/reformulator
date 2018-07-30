import { isClientSide } from '../environment';
import resolve from '../reformulator';

jest.mock('../environment', () => ({ isClientSide: jest.fn() }));

describe('reformulator', () => {
	describe('server side', () => {
		beforeEach(() => {
			isClientSide.mockReturnValue(false);
		});

		it('should render final element', () => {
			const actual = resolve('<p ["a"]>');
			expect(actual).toBe('<p>a</p>');
		});

		it('should pass through none element results', () => {
			const actual = resolve('1 + a', { a: 'a' });
			expect(actual).toBe('1a');
		});
	});

	describe.skip('client side', () => {
		beforeEach(() => {
			document.body.innerHTML = '';
		});

		it('should not include client side initializer if not needed', () => {
			expect(resolve('<p ["a"]>')).toBe('<p>a</p>');
		});

		it('should include client side initializer if needed', () => {
			expect(resolve('<a [@ + (on & "Off" | "On")] onclick: on>', 'Turn ')).toBe([
				'<a href="javascript:void(0);">Turn On</a>',
				'<script>resolve("<a [@ + (on & \\"Off\\" | \\"On\\")] onclick: on>", "Turn ");</script>'
			].join(''));
		});
		
		it('should handle click events', () => {
			const element = document.createElement('a');
			expect(resolve('<a [@ + (on & "Off" | "On")] onclick: on>', 'Turn ', element)).toBe(element);
		});
		
		it('should handle click events', () => {
			document.body.innerHTML = [
				'<a href="javascript:void(0);">Turn On</a>',
				'<script>resolve("<a [@ + (on & \\"Off\\" | \\"On\\")] onclick: on>", "Turn ");</script>'
			].join('');

			const element = document.querySelector('a');
			expect(resolve('<a [@ + (on & "Off" | "On")] onclick: on>', 'Turn ')).toBe(element);
		});
	});
});
