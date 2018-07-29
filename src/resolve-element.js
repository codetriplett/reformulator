import {
	typeDefinition,
	arrayDefinition
} from './variables';

import { ElementStructure } from './element-structure';
import { isEmpty } from './is-empty';
import { resolveExpression } from './resolve-expression';
import { resolveStructure } from './resolve-structure';

const spaceRegex = / +/g;
const typeRegex = new RegExp(`^${typeDefinition}$`);
const scopeRegex = new RegExp(`^${arrayDefinition}`);

export function resolveElement (string, ...stack) {
	const bracketIndex = string.indexOf('[');
	const type = string.slice(1, bracketIndex).trim();

	if (!typeRegex.test(type)) {
		return;
	}

	if (bracketIndex === -1) {
		return new ElementStructure(type);
	}

	const scopeExpression = string.slice(bracketIndex).match(scopeRegex)[0].slice(1, -1).trim();
	let remainingString = `${string.slice(bracketIndex + scopeExpression.length + 2, -1)}`;

	const scope = resolveExpression(scopeExpression || '@', ...stack);

	if (scopeExpression && isEmpty(scope)) {
		return;
	} else if (Array.isArray(scope)) {
		const reducedString = `${string.slice(0, bracketIndex)}[]${remainingString}>`;

		const result = scope
			.map(item => resolveElement(reducedString, item, ...stack))
			.filter(item => !isEmpty(item));

		return result.length > 0 ? result : null;
	}

	const structure = resolveStructure(`<${remainingString}>`, scope, ...stack);

	if (!structure) {
		return null;
	}

	const attributes = structure[0];

	const classNames = structure.slice(1).reduce((array, item) => {
		return array.concat(typeof item === 'string' ? item.trim().split(spaceRegex) : item);
	}, []);

	return new ElementStructure(type, { scope, classNames, attributes });
}
