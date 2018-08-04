import {
	keyRegex,
	stringDefinition
} from './patterns';

import { isEmpty } from './is-empty';
import { resolveExpression } from './resolve-expression';

const expressionDefinition = `((${stringDefinition}|[^:,])*)`;
const expressionRegex = new RegExp(`^ *${expressionDefinition} *$`);

export function resolveStructure (string, state, ...stack) {
	const keepObject = string[0] === '{' || string[0] === '<';
	const keepArray = string[0] === '[' || string[0] === '<';
	const keepBoth = keepObject && keepArray;
	let remainingString = `${string.slice(1, -1)},`;
	let array = [];
	const object = {};

	while (remainingString.length) {
		const commaIndex = remainingString.indexOf(',');
		let key = '';
		let expression = remainingString.slice(0, commaIndex);
		let colonIndex = expression.indexOf(':');

		if (colonIndex !== -1) {
			key = expression.slice(0, colonIndex).trim();
			expression = expression.slice(colonIndex + 1);
		}

		let value = expression.trim();
		const isEvent = keepBoth && key.indexOf('on') === 0;
		remainingString = remainingString.slice(commaIndex + 1);

		if ((colonIndex !== -1 && !keyRegex.test(key)) || !expressionRegex.test(expression)) {
			return null;
		}

		if (!keepBoth || key.indexOf('on') !== 0) {
			value = resolveExpression(expression, state, ...stack) || isEvent || null;
		}

		if (isEmpty(value)) {
			continue;
		}

		if (colonIndex === -1) {
			array.push(value);
		} else {
			object[key] = value;
		}
	}

	if (keepBoth && array.length) {
		object[''] = array;
	}

	if (keepObject) {
		return object;
	} else if (keepArray) {
		return array;
	}

	return null;
}
