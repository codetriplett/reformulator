import {
	variableDefinition,
	stringDefinition,
	objectDefinition,
	arrayDefinition,
	elementDefinition
} from './patterns';

import { delayOperation } from './delay-operation';
import { resolveOperation } from './resolve-operation';
import { resolveValue } from './resolve-value';

const numberDefinition = '(-?(0|[1-9][0-9]*)(.[0-9]+)?)';
const wrapperDefinition = `(${elementDefinition}|${arrayDefinition}|${objectDefinition}|${stringDefinition})`;
const operatorDefinition = '()|&=!<>#+\\-/*%^.\\?';
const operandDefinition = `((${wrapperDefinition}|${numberDefinition}|[^${operatorDefinition}:,])*)`;
const operationDefinition = `([${operatorDefinition}] *${operandDefinition})`;

const operationRegex = new RegExp(`^${operationDefinition} *`);
const negativeSignRegex = new RegExp(`[${operatorDefinition}] *-(?=${variableDefinition}|\\()`);
const negationRegex = new RegExp(`[${operatorDefinition}] *!(?=${operandDefinition})`);
const existenceRegex = new RegExp(`[${operatorDefinition}] *\\?(?=${operandDefinition})`);
const doctypeRegex = /< *\( *! *doctype/;

export function resolveExpression (expression, state, ...stack) {
	const valueStack = [];
	const operatorStack = [];
	let nextOperation;

	let remainingExpression = `(${expression.trim()}`
		.replace(negationRegex, match => `${match[0]}(!`)
		.replace(doctypeRegex, '<!doctype')
		.replace(existenceRegex, match => `${match[0]}(?`)
		.replace(negativeSignRegex, match => `${match[0]}(-1 * `);

	while (remainingExpression.length) {
		const operationMatch = remainingExpression.match(operationRegex);

		if (operationMatch === null) {
			return null;
		}

		nextOperation = operationMatch[0];
		remainingExpression = remainingExpression.slice(nextOperation.length);

		const currentOperator = nextOperation[0];
		const nextOperator = remainingExpression[0];
		const value = resolveValue(nextOperation.slice(1), state, ...stack);

		if (delayOperation(currentOperator, nextOperator)) {
			operatorStack.splice(0, 0, currentOperator);
			valueStack.splice(0, 0, value);
		} else {
			valueStack[0] = resolveOperation(valueStack[0], currentOperator, value);

			while (operatorStack.length > 0 && !delayOperation(operatorStack[0], nextOperator)) {
				const previousValue = valueStack.splice(0, 1)[0];
				const previousOperator = operatorStack.splice(0, 1)[0];
				valueStack[0] = resolveOperation(valueStack[0], previousOperator, previousValue);
			}
		}
	}

	const result = valueStack[0];

	if (result !== null && typeof result === 'object' && !Object.keys(result).length) {
		return null;
	}

	return result;
}
