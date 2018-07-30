import { ElementStructure } from './element-structure';
import { resolveTemplate } from './resolve-template';

export default (template, ...stack) => {
	let result = resolveTemplate(template, ...stack);
	return result instanceof ElementStructure ? result.render() : result;
};
