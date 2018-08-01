import { ElementStructure } from './element-structure';
import { isEmpty } from './is-empty';

export function typeOf (value, generic) {
	if (isEmpty(value)) {
		return 'empty';
	} else if (generic) {
		return typeof value === 'object' ? 'structure' : 'literal';
	} else if (value instanceof ElementStructure) {
		return 'element';
	}

	return Array.isArray(value) ? 'array' : typeof value;
}
