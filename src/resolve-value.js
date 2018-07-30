import {
	stringDefinition,
	objectDefinition,
	arrayDefinition,
	elementDefinition,
	variableRegex
} from './patterns';

import { isEmpty } from './is-empty';
import { resolveElement } from './resolve-element';
import { resolveStructure } from './resolve-structure';

const booleanRegex = /^(true|false)$/;
const stringRegex = new RegExp(`^${stringDefinition}$`);
const objectRegex = new RegExp(`^${objectDefinition}$`);
const arrayRegex = new RegExp(`^${arrayDefinition}$`);
const elementRegex = new RegExp(`^${elementDefinition}$`);

const escapedCharacterRegexMap = {
	'\'': /\\'/g,
	'"': /\\"/g
};

export function resolveValue (value, ...stack) {
	let trimmedValue = value.trim();

	if (trimmedValue === '') {
		return;
	} else if (!isNaN(trimmedValue)) {
		return Number(trimmedValue);
	} else if (stringRegex.test(trimmedValue)) {
		const escapedQuote = trimmedValue[0];

		return trimmedValue
			.slice(1, -1)
			.replace(escapedCharacterRegexMap[escapedQuote], escapedQuote);
	} else if (booleanRegex.test(trimmedValue)) {
		return trimmedValue === 'true';
	} else if (objectRegex.test(trimmedValue) || arrayRegex.test(trimmedValue)) {
		return resolveStructure(trimmedValue, ...stack);
	} else if (elementRegex.test(trimmedValue)) {
		return resolveElement(trimmedValue, ...stack);
	} else if (!variableRegex.test(trimmedValue) && trimmedValue !== '@') {
		return null;
	}

	let foundValue;

	for (const variables of stack) {
		if (trimmedValue === '@') {
			foundValue = variables;
		} else if (variables && variables !== null && typeof variables === 'object') {
			foundValue = variables[trimmedValue];
		}

		if (!isEmpty(foundValue) || variables && variables.hasOwnProperty(trimmedValue)) {
			break;
		}
	}

	return !isEmpty(foundValue) ? foundValue : null;
}
