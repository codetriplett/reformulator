import { ElementStructure } from './element-structure';
import { extractState } from './extract-state';
import { isEmpty } from './is-empty';
import { mergeObjects } from './merge-objects';
import { resolveExpression } from './resolve-expression';
import { resolveOperation } from './resolve-operation';

export function resolveTemplate (template, ...stack) {
	if (!template) {
		return null;
	} else if (Array.isArray(stack[0])) {
		const remaining = stack.slice(1);

		const result = stack[0]
			.map(item => resolveTemplate(template, item, ...remaining))
			.filter(value => !isEmpty(value));

		return result.length > 0 ? result : null;
	} else if (typeof template === 'string') {
		let result = resolveExpression(template, ...stack);

		if (result instanceof ElementStructure) {
			return result.render();
		} else if (Array.isArray(result) && result[0] instanceof ElementStructure) {
			result = result.map(item => item.render());
			result = result.length > 0 ? result : null;
		}

		return !isEmpty(result) ? result : null;
	} else if (Array.isArray(template)) {
		let result = [];
		let local = stack[0];
		let distant = stack.slice(1);
		let keepArray = false;
		const stateVariables = {};
		let previous;

		template.concat(['']).forEach(templateItem => {
			const isArray = Array.isArray(templateItem);
			let container;

			if (previous) {
				const resolver = typeof previous === 'string' ? resolveExpression : resolveTemplate;
				container = resolver(previous, local, ...distant);
			} else if (isArray) {
				container = '';
			}

			if (!isEmpty(container) && container !== false) {
				if (!Array.isArray(container)) {
					container = [container];
				} else {
					keepArray = true;
				}

				const isElement = container[0] instanceof ElementStructure;

				keepArray = !isElement && keepArray;

				container.forEach(containerItem => {
					let scope = isElement ? containerItem.scope : (containerItem || null);
					scope = scope !== true ? scope : null;
					let content = isArray ? resolveTemplate(templateItem, scope, local, ...distant) : scope;

					if (!isEmpty(content) || scope === null || templateItem.length === 0) {
						if (!isElement) {
							if (Array.isArray(content)) {
								keepArray = true;
							} else if (typeof content === 'object') {
								local = mergeObjects(local, content);
							}
						}

						if (isElement) {
							content = extractState(content, stateVariables);
						}

						let renderedContent = isElement ? containerItem.render(content) : content;

						if (isElement) {
							renderedContent = extractState(renderedContent, stateVariables);
						}

						result = result.concat(renderedContent);
					}
				});
			}

			previous = !isArray ? templateItem : undefined;
		});

		if (!keepArray) {
			if (result.length === 0) {
				return null;
			}
			
			const stateString = Object.keys(stateVariables).join(' ');
			
			if (stateString) {
				result.push(`<!-- ${stateString} -->`);
			}

			result = result.reduce((result, item) => {
				const merge = resolveOperation(result, '+', item);
				return typeof merge === typeof item && merge !== null ? merge : item;
			});
		}

		return !isEmpty(result) ? result : null;
	} else if (typeof template === 'object') {
		const result = {};

		Object.keys(template).forEach(key => {
			const value = resolveTemplate(template[key], ...stack);

			if (!isEmpty(value)) {
				result[key] = value;
			}
		});

		return Object.keys(result).length > 0 ? result : null;
	}
}
