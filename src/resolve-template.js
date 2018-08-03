import { ElementStructure } from './element-structure';
import { isEmpty } from './is-empty';
import { resolveExpression } from './resolve-expression';

export function resolveTemplate (template, state, ...stack) {
	if (Array.isArray(stack[0])) {
		let result = [];
		const remainingStack = stack.slice(1);

		stack[0].forEach(local => {
			const value = resolveTemplate(template, state, local, ...remainingStack);

			if (!isEmpty(value, true)) {
				result.push(value);
			}
		});

		if (Array.isArray(template)) {
			result = result.reduce((total, value) => total.concat(value), []);
		}

		return result.length > 0 ? result : null;
	}

	let result;

	if (!template) {
		return null;
	} else if (Array.isArray(template)) {
		result = [];

		let previousStage = 0;
		let firstInStack = stack[0];
		let containerArray = [firstInStack];
		const remainingStack = stack.slice(1);

		(template.concat('@')).forEach(item => {
			const isArray = Array.isArray(item);
			let currentStage;

			if (isArray) {
				currentStage = 2;
			} else if (typeof item === 'string') {
				currentStage = 1;
			} else if (typeof item === 'object') {
				currentStage = 0;
			}

			if (previousStage && currentStage <= previousStage) {
				if (!isEmpty(containerArray, true)) {
					result = result.concat(containerArray);
				}

				containerArray = [firstInStack];
			}
			
			containerArray = containerArray.reduce((containerArray, container) => {
				const containerIsElement = container instanceof ElementStructure;
				const local = [containerIsElement ? container.scope : container].filter(item => item);
				const value = resolveTemplate(item, state, ...local, ...remainingStack);
				const valueIsEmpty = isEmpty(value, true);

				if (valueIsEmpty && (!isArray || item.length > 0)) {
					container = [];
				} else if (currentStage < 2) {
					container = value;
				} else if (isArray && item.length > 0) {
					container = containerIsElement ? container.append(value) : value;
				}

				return containerArray.concat(container);
			}, []);

			previousStage = currentStage;
		});
	} else if (typeof template === 'object') {
		result = {};

		for (const key in template) {
			const value = resolveTemplate(template[key], state, ...stack);

			if (!isEmpty(value, true)) {
				result[key] = value;
			}
		}
	} else if (typeof template === 'string') {
		result = resolveExpression(template, state, ...stack);
	}

	return !isEmpty(result, true) ? result : null;
}
