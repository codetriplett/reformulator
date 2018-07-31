import { isClientSide } from './environment';
import { isEmpty } from './is-empty';
import { ElementStructure } from './element-structure';
import { resolveTemplate } from './resolve-template';

export default (template, ...stack) => {
	let result = resolveTemplate(template, ...stack);
	const startsWithElement = Array.isArray(result) && result[0] instanceof ElementStructure;

	if (Array.isArray(template) || startsWithElement) {
		if (result.length > 1) {
			const content = result;
			result = new ElementStructure('div');
			result.append(content);
		} else {
			result = result[0];
		}
	}

	const resultIsElement = result instanceof ElementStructure;

	if (resultIsElement) {
		const variables = result.variables;
		result = result.render();

		if (!isClientSide() && !isEmpty(variables, true)) {
			const params = [template, ...stack].map(param => JSON.stringify(param));
			result += `<script>reform(${params.join(', ')});</script>`;
		}
	}

	return resultIsElement || !isEmpty(result, true) ? result : '';
};
