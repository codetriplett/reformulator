import {
	typeDefinition,
	arrayDefinition,
	literalTypeRegex,
	spaceRegex
} from './patterns';

import { ElementStructure } from './element-structure';
import { isEmpty } from './is-empty';
import { resolveExpression } from './resolve-expression';
import { resolveStructure } from './resolve-structure';

const typeRegex = new RegExp(`^${typeDefinition}$`);
const scopeRegex = new RegExp(`^${arrayDefinition}`);

export function resolveElement (string, state, ...stack) {
	const templateId = (state || {})[''] || '';
	const bracketIndex = string.indexOf('[');
	const type = string.slice(1, bracketIndex).trim();

	if (!typeRegex.test(type)) {
		return null;
	}

	if (bracketIndex === -1) {
		return new ElementStructure(type, { scope: stack[0], templateId });
	}

	const scopeExpression = string.slice(bracketIndex).match(scopeRegex)[0].slice(1, -1).trim();
	let remainingString = `${string.slice(bracketIndex + scopeExpression.length + 2, -1)}`;

	const scope = resolveExpression(scopeExpression || '@', state, ...stack);

	if (scopeExpression && isEmpty(scope)) {
		return null;
	} else if (Array.isArray(scope)) {
		const reducedString = `${string.slice(0, bracketIndex)}[]${remainingString}>`;

		const result = scope.map((item, i) => {
			const repeatTemplateId = `${templateId}-${i}`;
			const repeatState = { ...state, '': repeatTemplateId };
			return resolveElement(reducedString, repeatState, item, ...stack);
		}).filter(item => !isEmpty(item));

		return result.length > 0 ? result : null;
	}

	const attributes = resolveStructure(`<${remainingString}>`, state, scope, ...stack);

	if (!attributes) {
		return null;
	}

	const classNames = (attributes[''] || []).reduce((array, item) => {
		return array.concat(typeof item === 'string' ? item.trim().split(spaceRegex) : item);
	}, []);

	delete attributes[''];

	return new ElementStructure(type, { scope, classNames, attributes, templateId });
}
