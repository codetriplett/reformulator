import { isClientSide } from '../environment';
import { LiveTemplate } from '../live-template';

jest.mock('../environment', () => ({ isClientSide: jest.fn() }));

describe('live-template', () => {
	describe('server side', () => {
		beforeEach(() => {
			isClientSide.mockReturnValue(false);
		});

		it('should pass through non element results', () => {
			const liveTemplate = new LiveTemplate('1 + a', { a: 'a' });
			const actual = liveTemplate.resolve();
			expect(actual).toBe('1a');
		});

		it('should return single element from string', () => {
			const liveTemplate = new LiveTemplate('<p ["a"]>');
			const actual = liveTemplate.resolve();
			expect(actual).toBe('<p>a</p>');
		});

		it('should wrap repeated elements from string', () => {
			const liveTemplate = new LiveTemplate('<p [@]>', ['a', 'b']);
			const actual = liveTemplate.resolve();
			expect(actual).toBe('<div><p>a</p><p>b</p></div>');
		});

		it('should return single element from template', () => {
			const liveTemplate = new LiveTemplate([
				'@', [
					'<p [@]>'
				]
			], 'a');

			const actual = liveTemplate.resolve();
			expect(actual).toBe('<p>a</p>');
		});

		it('should wrap repeated elements from template', () => {
			const liveTemplate = new LiveTemplate([
				'@', [
					'<p [@]>'
				]
			], ['a', 'b']);

			const actual = liveTemplate.resolve();
			expect(actual).toBe('<div><p>a</p><p>b</p></div>');
		});

		it('should not set parent state to empty children', () => {
			const liveTemplate = new LiveTemplate([
				'@', [
					'<p []>'
				]
			], ['a', 'b']);

			const actual = liveTemplate.resolve();
			expect(actual).toBe('<div><p></p><p></p></div>');
		});

		it('should not include client side initializer if not needed', () => {
			const liveTemplate = new LiveTemplate('<p ["a"]>');
			const actual = liveTemplate.resolve();
			expect(actual).toBe('<p>a</p>');
		});

		it('should include client side initializer if needed', () => {
			const liveTemplate = new LiveTemplate('<a [@ + (on & "Off" | "On")] onclick: on>', 'Turn ');
			const actual = liveTemplate.resolve();
			
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

		it('should set data and element if both are provided', () => {
			const element = document.createElement('div');
			const actual = new LiveTemplate('1 + a', { a: 'a' }, element);

			expect(actual).toMatchObject({
				data: { a: 'a' },
				element
			});
		});

		it('should set element using second parameter if data is not provided', () => {
			const element = document.createElement('div');
			const actual = new LiveTemplate('1 + a', element);

			expect(actual).toMatchObject({
				data: undefined,
				element
			});
		});

		it('should return single element from string', () => {
			const liveTemplate = new LiveTemplate('<p ["a"]>');
			const actual = liveTemplate.resolve();

			expect(actual.tagName.toLowerCase()).toBe('p');
			expect(actual.innerHTML).toBe('a');
		});

		it('should wrap repeated elements from string', () => {
			const liveTemplate = new LiveTemplate('<p [@]>', ['a', 'b']);
			const actual = liveTemplate.resolve();

			expect(actual.tagName.toLowerCase()).toBe('div');
			expect(actual.innerHTML).toBe('<p>a</p><p>b</p>');
		});

		it('should return single element from template', () => {
			const liveTemplate = new LiveTemplate([
				'@', [
					'<p [@]>'
				]
			], 'a');

			const actual = liveTemplate.resolve();
			expect(actual.tagName.toLowerCase()).toBe('p');
			expect(actual.innerHTML).toBe('a');
		});

		it('should wrap repeated elements from template', () => {
			const liveTemplate = new LiveTemplate([
				'@', [
					'<p [@]>'
				]
			], ['a', 'b']);

			const actual = liveTemplate.resolve();
			expect(actual.tagName.toLowerCase()).toBe('div');
			expect(actual.innerHTML).toBe('<p>a</p><p>b</p>');
		});

		it('should handle click events', () => {
			const liveTemplate = new LiveTemplate([
				'<div [] on & "on">', [
					'<a ["Turn " + (on & "Off" | "On")] onclick: on>'
				]
			]);

			let actual = liveTemplate.resolve();
			expect(actual.className).toBe('');
			expect(actual.children[0].innerHTML).toBe('Turn On');

			actual.children[0].click();
			expect(actual.className).toBe('on');
			expect(actual.children[0].innerHTML).toBe('Turn Off');
		});

		it('should update properly after a key event', () => {
			const liveTemplate = new LiveTemplate([
				'<input [] onkeypress: value>',
				'<p ["value: " + value]>'
			]);

			let actual = liveTemplate.resolve();
			expect(actual.children).toHaveLength(1);

			let input = actual.children[0];
			liveTemplate.update('value', 'asdf');

			expect(actual.children).toHaveLength(2);
			expect(actual.children[0]).toBe(input);
			expect(actual.children[1].innerHTML).toBe('value: asdf');
		});
	});
});