import reform from '../reformulator';

jest.mock('../live-template', () => {
	function LiveTemplate (...params) { this.params = params; }
	LiveTemplate.prototype.resolve = function () { return this.params; };
	return { LiveTemplate };
});

describe('reformulator', () => {
	it('should return the live template result', () => {
		const template = '1 + a';
		const data = { a: 'a' };

		const actual = reform(template, data);
		expect(actual).toEqual([template, data]);
	});
});
