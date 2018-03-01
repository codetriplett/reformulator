const operators = '()|&=!<>#+-/*%.';
const operatorPrecedence = '001233334556667';
const stringSingleDefinition = '\'([^\']|[^\\\\]\')*\'';
const stringDoubleDefinition = '"([^"]|[^\\\\]")*"';
const numberDefinition = '-?([1-9][0-9]+|[0-9])(.[0-9]+)?';
const variableDefinition = '[a-zA-Z_$][0-9a-zA-Z_$]*';
const negativeSignDefinition = `-(?=(${stringSingleDefinition}|${stringDoubleDefinition}|${variableDefinition}|[(]))`;
const stringSingleRegex = new RegExp(`^${stringSingleDefinition}$`);
const stringDoubleRegex = new RegExp(`^${stringDoubleDefinition}$`);
const variableRegex = new RegExp(`^${variableDefinition}$`);
const negativeSignRegex = new RegExp(`${negativeSignDefinition}`, 'g');
const operationRegex = new RegExp(`[${operators}]? *(${stringSingleDefinition}|${stringDoubleDefinition}|${numberDefinition}|${negativeSignDefinition}|[^${operators}])*`);

function isEmpty (value) {
	if (value === undefined || value === null || typeof value === 'number' && isNaN(value)) {
		return true;
	}
}

function isEqual (firstValue, secondValue) {
	if ((firstValue === null || typeof firstValue !== 'object')
			&& (secondValue === null || typeof secondValue !== 'object')) {
		return firstValue === secondValue;
	}

	const firstValueKeys = Object.keys(firstValue).sort();
	const secondValueKeys = Object.keys(secondValue).sort();

	if (firstValueKeys.length !== secondValueKeys.length) {
		return false;
	}

	firstValueKeys.forEach((key, i) => {
		if (secondValueKeys[i] !== key || !isEqual(firstValue[key], secondValue[key])) {
			return false;
		}
	});

	return true;
}

function resolveValue (value, ...stack) {
	let trimmedValue = value.trim();

	if (trimmedValue === '') {
		return;
	} else if (!isNaN(trimmedValue)) {
		return Number(trimmedValue);
	} else if (stringSingleRegex.test(trimmedValue)) {
		return trimmedValue.replace(/^'|'$/g, '');
	} else if (stringDoubleRegex.test(trimmedValue)) {
		return trimmedValue.replace(/^"|"$/g, '');
	} else if (!variableRegex.test(trimmedValue)) {
		return null;
	}

	let foundValue;

	for (const variables of stack) {
		if (trimmedValue === '$') {
			foundValue = variables;
		} else if (variables && typeof variables === 'object') {
			foundValue = variables[trimmedValue];
		}

		if (!isEmpty(foundValue)) {
			break;
		}
	}

	return !isEmpty(foundValue) ? foundValue : null;
}

function delayOperation (currentOperator, nextOperator) {
	if (currentOperator === ')' || nextOperator === ')' || !nextOperator) {
		return false;
	} else if (currentOperator === '(' || nextOperator === '(') {
		return true;
	}

	const currentPrecedence = operatorPrecedence[operators.indexOf(currentOperator)];
	const nextPrecedence = operatorPrecedence[operators.indexOf(nextOperator)];

	return nextPrecedence > currentPrecedence;
}

function resolveOperation (firstValue, operator, secondValue) {
	let firstValueType = 'empty';
	let secondValueType = 'empty';

	if (!isEmpty(firstValue)) {
		firstValueType = Array.isArray(firstValue) ? 'array' : typeof firstValue;
	}

	if (!isEmpty(secondValue)) {
		secondValueType = Array.isArray(secondValue) ? 'array' : typeof secondValue;
	}

	const specificOperator = `${operator}:${firstValueType}:${secondValueType}`;

	if (firstValueType !== 'empty') {
		firstValueType = typeof firstValue === 'object' ? 'structure' : 'literal';
	}

	if (secondValueType !== 'empty') {
		secondValueType = typeof secondValue === 'object' ? 'structure' : 'literal';
	}

	const generalOperator = `${operator}:${firstValueType}:${secondValueType}`;
	let result;

	switch (operator) {
		case '|':
			result = !isEmpty(firstValue) && firstValue !== false ? firstValue : secondValue;
			break;
		case '&':
			result = !isEmpty(firstValue) && firstValue !== false ? secondValue : null;
			break;
	}

	switch (generalOperator) {
		case '(:empty:structure':
		case '(:empty:literal':
			result = secondValue;
			break;
		case '):structure:empty':
		case '):literal:empty':
			result = firstValue;
			break;
		case '=:structure:structure':
			result = isEqual(firstValue, secondValue) ? firstValue : null;
			break;
		case '=:literal:literal':
			result = firstValue === secondValue ? firstValue : null;
			break;
		case '!:structure:structure':
		case '!:structure:literal':
		case '!:structure:empty':
			result = !isEqual(firstValue, secondValue) ? firstValue : null;
			break;
		case '!:literal:literal':
			result = firstValue !== secondValue ? firstValue : null;
			break;
		case '!:empty:structure':
		case '!:empty:literal':
		case '!:empty:empty':
			result = firstValue === undefined ? !secondValue : null;
			break;
		case '<:literal:literal':
			result = firstValue < secondValue ? firstValue : null;
			break;
		case '>:literal:literal':
			result = firstValue > secondValue ? firstValue : null;
			break;
		case '+:literal:literal':
			result = firstValue + secondValue;
			break;
	}

	switch (specificOperator) {
		case '#:number:number': {
			const subtractedValue = firstValue - 1 / (2 * Math.pow(10, secondValue));
			result = subtractedValue.toFixed(secondValue);
			break;
		}
		case '-:string:number':
		case '-:string:string':
			result = firstValue.replace(new RegExp(secondValue, 'g'), '');
			break;
		case '-:number:number':
			result = firstValue - secondValue;
			break;
		case '/:string:number':
		case '/:string:string':
			result = firstValue.split(new RegExp(secondValue, 'g'));
			break;
		case '/:number:number':
			result = firstValue / secondValue;
			break;
		case '*:array:string':
		case '*:string:array': {
			let arrayValue = Array.isArray(firstValue) ? firstValue : secondValue;
			const stringValue = typeof firstValue === 'string' ? firstValue : secondValue;

			result = arrayValue.join(stringValue);
			break;
		}
		case '*:number:number':
			result = firstValue * secondValue;
			break;
		case '*:number:string':
		case '*:string:number': {
			let numberValue = typeof firstValue === 'number' ? firstValue : secondValue;
			const stringValue = typeof firstValue === 'string' ? firstValue : secondValue;
			result = '';

			while (numberValue > 0) {
				result += stringValue;
				numberValue--;
			}

			break;
		}
		case '%:number:number': {
			result = firstValue % secondValue;
			break;
		}
		case '.:object:string':
		case '.:object:number':
		case '.:array:number':
		case '.:string:number':
			result = firstValue[secondValue];
			break;
	}

	return !isEmpty(result) ? result : null;
}

function resolveExpression (expression, ...stack) {
	const valueStack = [];
	const operatorStack = [];
	let remainingExpression = ` ${expression.replace(negativeSignRegex, '-1 * ')}`;
	let nextOperation;

	while (remainingExpression.length) {
		nextOperation = remainingExpression.match(operationRegex)[0];
		remainingExpression = remainingExpression.slice(nextOperation.length);

		const currentOperator = nextOperation[0];
		const nextOperator = remainingExpression[0];
		const value = resolveValue(nextOperation.slice(1), ...stack);

		if (currentOperator === ' ' || delayOperation(currentOperator, nextOperator)) {
			if (currentOperator !== ' ') {
				operatorStack.splice(0, 0, currentOperator);
			}

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

	return valueStack[0];
}

export default function resolveBlock (block, ...stack) {
	switch (typeof block) {
		case 'object': {
			if (!block) {
				break;
			}

			const variables = resolveBlock(block._, ...stack);
			let result;
			
			if (block._ && variables === null) {
				break;
			}

			if (Array.isArray(variables)) {
				const reduction = { ...block, _: undefined };

				result = variables
					.map(item => resolveBlock(reduction, item, ...stack))
					.filter(value => value !== null);

				if (result.length === 0) {
					break;
				}
			} else {
				result = resolveBlock(block.$, variables, ...stack);

				if (typeof result !== 'object') {
					return result;
				}

				result = result || {};

				for (const key in block) {
					if (key === '_' || key === '$') {
						continue;
					}

					const value = resolveBlock(block[key], variables, ...stack);

					if (value !== undefined && value !== null) {
						result[key] = value;
					}
				}

				if (Object.keys(result).length === 0) {
					break;
				}
			}

			return result;
		}
		case 'string':
			return resolveExpression(block, ...stack);
	}
	
	return null;
}
