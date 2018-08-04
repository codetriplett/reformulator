import { isClientSide } from './environment';
import { ElementStructure } from './element-structure';
import { isEmpty } from './is-empty';
import { resolveTemplate } from './resolve-template';

export function LiveTemplate (template, ...others) {
	let data = others[0];

	if (isClientSide()) {
		let element;

		if (data instanceof Element) {
			element = data;
			data = undefined;
		} else {
			const scripts = document.querySelectorAll('script');

			if (scripts.length > 0) {
				element = scripts[scripts.length - 1].previousSibling;
			}
		}

		this.element = element;
	}

	this.template = template;
	this.data = data;
	this.state = {};
}

LiveTemplate.prototype.update = function (variable, value) {
	const state = this.state;
	state[variable] = value !== undefined ? value : !state[variable];
	this.resolve();
};

LiveTemplate.prototype.resolve = function () {
	const template = this.template;
	const data = this.data;
	let result = resolveTemplate(template, this.state, data);
	const resultIsArray = Array.isArray(result);
	const resultIsElement = (resultIsArray && result[0] || result) instanceof ElementStructure;

	if (resultIsElement) {
		if (resultIsArray) {
			const content = result;
			result = new ElementStructure('div', { templateId: '' });
			result.append(content);
		}
		
		const variables = result.variables;

		this.elements = this.elements || {};
		this.newElements = {};
		result = result.render(this);

		if (!isClientSide() && !isEmpty(variables, true)) {
			const params = [template, data].map(param => JSON.stringify(param));
			result += `<script>reform(${params.join(', ')});</script>`;
		}

		this.element = result;
		this.elements = this.newElements;
	}

	return resultIsElement || !isEmpty(result, true) ? result : '';
};
