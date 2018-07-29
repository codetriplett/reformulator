import {
	typeDefinition,
	variableDefinition,
	stringDefinition
} from './variables';

import { extractState } from './extract-state';
import { resolveTemplate } from './resolve-template';

const htmlDefinition = ` *< *${typeDefinition}( *${variableDefinition}( *=${stringDefinition})?)*>`;
const htmlRegex = new RegExp(`^${htmlDefinition}`);

export default (template, ...stack) => {
	let element = stack[stack.length - 1];
	
	if (!(element instanceof Element) && document && typeof document.querySelector === 'function') {
		const scripts = document.querySelectorAll('script');
		element = scripts && scripts.length > 0 && scripts[scripts.length - 1].previousSibling;
	}

	const stateVariables = {};
	const result = extractState(resolveTemplate(template, ...stack), stateVariables);

	if (element) {
		return element;
	} else if (htmlRegex.test(result) && Object.keys(stateVariables).length > 0) {
		const stringifiedParams = [template].concat(stack).map(param => JSON.stringify(param));
		return `${result}<script>resolve(${stringifiedParams.join(', ')});</script>`;
	} else {
		return result;
	}
};
