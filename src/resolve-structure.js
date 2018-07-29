import {
	variableRegex,
	stringDefinition
} from './variables';

import { isEmpty } from './is-empty';
import { resolveExpression } from './resolve-expression';

const expressionDefinition = `((${stringDefinition}|[^:,])*)`;
const expressionRegex = new RegExp(`^ *${expressionDefinition} *$`);

export function resolveStructure (string, ...stack) {
	const isAttributeStructure = string[0] === '<';
	let remainingString = `${string.slice(1, -1)},`;
	let array = [];
	const object = {};

	while (remainingString.length) {
		let colonIndex = remainingString.indexOf(':');
		const commaIndex = remainingString.indexOf(',');

		if (colonIndex >= commaIndex) {
			colonIndex = -1;
		}

		const key = remainingString.slice(0, colonIndex).trim();
		const expression = remainingString.slice(colonIndex + 1, commaIndex);
		const isEvent = isAttributeStructure && key.indexOf('on') === 0;

		remainingString = remainingString.slice(commaIndex + 1);

		if ((colonIndex !== -1 && !variableRegex.test(key)) || !expressionRegex.test(expression)) {
			return;
		}

		const value = resolveExpression(expression, ...stack) || isEvent || null;

		if (isEmpty(value)) {
			continue;
		}

		if (colonIndex === -1) {
			array.push(value);
		} else {
			object[key] = value;
		}
	}

	return [object].concat(array);
}
