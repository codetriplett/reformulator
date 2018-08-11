import { isClientSide } from './environment';
import { ElementStructure } from './element-structure';
import { isEmpty } from './is-empty';
import { resolveTemplate } from './resolve-template';

export function LiveTemplate (template, ...others) {
	let data = others[0];
	let element = others[1];

	if (isClientSide()) {
		if (data instanceof Element) {
			element = data;
			data = undefined;
		} else if (element === true) {
			const scripts = document.querySelectorAll('script');
			const script = scripts[scripts.length - 1];

			if (script && script.innerHTML.indexOf('reform(') === 0) {
				element = script.previousSibling;
			}
		} else if (!(element instanceof Element)) {
			element = undefined;
		}
	}

	this.template = template;
	this.data = data;
	this.state = {};
	this.element = element;
}

LiveTemplate.prototype.register = function (type, element, variable) {
	window.reform && window.reform.scrollElements.push({
		type,
		element,
		variable,
		liveTemplate: this
	});
};

LiveTemplate.prototype.update = function (variable, value) {
	const state = this.state;
	state[variable] = value !== undefined ? value : !state[variable];
	this.resolve();
};

LiveTemplate.prototype.resolve = function () {
	const template = this.template;
	const data = this.data;
	let result = resolveTemplate(template, this.state, data);
	const resultWasArray = Array.isArray(result);
	const resultArray = resultWasArray ? result : [result];
	const resultHasElement = resultArray.filter(resultItem => resultItem instanceof ElementStructure).length > 0;
	let doctypeElement;

	if (resultHasElement) {
		if (resultWasArray) {
			if (result[0].type === '!doctype' && result.length > 1) {
				doctypeElement = result[0];
				result = result[1];
			} else {
				const content = result;
				result = new ElementStructure('div', { templateId: '' });
				result.append(content);
			}
		}

		const variables = result.variables;

		this.elements = this.elements || {};
		this.newElements = {};
		result = result.render(this);

		if (!isClientSide()) {
			if (doctypeElement) {
				result = `${doctypeElement.render(this)}${result}`;
			}

			if (this.element !== false && !isEmpty(variables, true)) {
				const params = [template, data || {}].map(param => JSON.stringify(param));
				result += `<script>reform(${params.join(',')},true);</script>`;
			}
		}

		this.element = result;
		this.elements = this.newElements;
	}

	return resultHasElement || !isEmpty(result, true) ? result : '';
};
