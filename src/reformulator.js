const operators = '()|&=!<>#+-/*%^.';
const operatorPrecedence = '0012333345566678';

const numberDefinition = '(-?(0|[1-9][0-9]*)(.[0-9]+)?)';
const variableDefinition = '([a-zA-Z_$][0-9a-zA-Z_$]*)';
const stringDefinition = '("(\\\\"|[^"])*"|\'(\\\\\'|[^\'])*\')';
const objectDefinition = `\\{(${stringDefinition}|[^}])*\\}`;
const arrayDefinition = `\\[(${stringDefinition}|[^\\]])*\\]`;

const operatorDefinition = '()|&=!<>#+\\-/*%^.';
const operandDefinition = `((${arrayDefinition}|${objectDefinition}|${stringDefinition}|${numberDefinition}|[^${operatorDefinition}:,])*)`;
const operationDefinition = `([${operatorDefinition}] *${operandDefinition})`;
const expressionDefinition = `((${stringDefinition}|[^:,])*)`;

const booleanRegex = /^(true|false)$/;
const variableRegex = new RegExp(`^${variableDefinition}$`);
const stringRegex = new RegExp(`^${stringDefinition}$`);
const objectRegex = new RegExp(`^${objectDefinition}$`);
const arrayRegex = new RegExp(`^${arrayDefinition}$`);
const operationRegex = new RegExp(`^${operationDefinition} *`);
const expressionRegex = new RegExp(`^ *${expressionDefinition} *$`);
const negativeSignRegex = new RegExp(`[${operatorDefinition}] *-(?=${variableDefinition}|\\()`);
const negationRegex = new RegExp(`[${operatorDefinition}] *!(?=${operandDefinition})`);

const escapedCharacterRegexMap = {
	'\'': /\\'/g,
	'"': /\\"/g
};

function isEmpty (value) {
	if (value === undefined || value === null || typeof value === 'number' && isNaN(value)) {
		return true;
	}
}

function isEqual (firstValue, secondValue, allowExtraProperties) {
	if ((firstValue === null || typeof firstValue !== 'object')
			&& (secondValue === null || typeof secondValue !== 'object')) {
		return firstValue === secondValue;
	}

	const firstValueKeys = Object.keys(firstValue);
	const secondValueKeys = Object.keys(secondValue);

	if (!allowExtraProperties && firstValueKeys.length !== secondValueKeys.length
			|| allowExtraProperties && firstValueKeys.length <= secondValueKeys.length) {
		return false;
	}

	secondValueKeys.forEach((key, i) => {
		if (!isEqual(firstValue[key], secondValue[key], allowExtraProperties)) {
			return false;
		}
	});

	return true;
}

function resolveObject (string, ...stack) {
	let remainingString = `${string.slice(1, -1)},`;
	const object = {};

	while (remainingString.length) {
		const colonIndex = remainingString.indexOf(':');
		const commaIndex = remainingString.indexOf(',');
		const key = remainingString.slice(0, colonIndex !== -1 ? colonIndex : commaIndex).trim();
		const expression = remainingString.slice(colonIndex + 1, commaIndex);

		if (!variableRegex.test(key) || !expressionRegex.test(expression)) {
			return;
		}

		const value = resolveExpression(expression, ...stack);

		if (!isEmpty(value)) {
			object[key] = value;
		}

		remainingString = remainingString.slice(commaIndex + 1);
	}

	return object;
};

function resolveArray (string, ...stack) {
	let remainingString = `${string.slice(1, -1)},`;
	const array = [];

	while (remainingString.length) {
		const commaIndex = remainingString.indexOf(',');
		const expression = remainingString.slice(0, commaIndex);
		
		if (!expressionRegex.test(expression)) {
			return;
		}

		const value = resolveExpression(expression, ...stack);

		if (!isEmpty(value)) {
			array.push(value);
		}

		remainingString = remainingString.slice(commaIndex + 1);
	}

	return array;
};

function resolveValue (value, ...stack) {
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
	} else if (objectRegex.test(trimmedValue)) {
		return resolveObject(trimmedValue, ...stack);
	} else if (arrayRegex.test(trimmedValue)) {
		return resolveArray(trimmedValue, ...stack);
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

		if (!isEmpty(foundValue) || variables && variables.hasOwnProperty(trimmedValue)) {
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
		case '<:structure:structure':
			result = isEqual(secondValue, firstValue, true) ? firstValue : null;
			break;
		case '<:literal:literal':
			result = firstValue < secondValue ? firstValue : null;
			break;
		case '>:structure:structure':
			result = isEqual(firstValue, secondValue, true) ? firstValue : null;
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
		case '+:object:object':
			result = { ...firstValue, ...secondValue };
			break;
		case '+:array:array':
			result = [...firstValue, ...secondValue];
			break;
		case '+:array:boolean':
		case '+:array:number':
		case '+:array:string':
		case '+:array:object':
			result = [...firstValue, secondValue];
			break;
		case '+:boolean:array':
		case '+:number:array':
		case '+:string:array':
		case '+:object:array':
			result = [firstValue, ...secondValue];
			break;
		case '-:object:string': {
			let { [secondValue]: removal, ...remainder } = firstValue;
			result = remainder;
			break;
		}
		case '-:number:array':
		case '-:number:string':
			result = secondValue.slice(firstValue);
			break;
		case '-:array:number':
		case '-:string:number':
			result = firstValue.slice(0, secondValue);
			break;
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
		case '^:number:number': {
			result = Math.pow(firstValue, secondValue);
			break;
		}
		case '.:object:string':
		case '.:object:number':
		case '.:array:string':
		case '.:array:number':
		case '.:string:string':
		case '.:string:number':
			result = firstValue[secondValue];
			break;
	}

	return !isEmpty(result) ? result : null;
}

function resolveExpression (expression, ...stack) {
	const valueStack = [];
	const operatorStack = [];
	let nextOperation;
	
	let remainingExpression = `(${expression.trim()}`
		.replace(negationRegex, match => `${match[0]}(!`)
		.replace(negativeSignRegex, match => `${match[0]}(-1 * `);

	while (remainingExpression.length) {
		nextOperation = remainingExpression.match(operationRegex)[0];
		remainingExpression = remainingExpression.slice(nextOperation.length);

		const currentOperator = nextOperation[0];
		const nextOperator = remainingExpression[0];
		const value = resolveValue(nextOperation.slice(1), ...stack);

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
		return;
	}

	return result;
}

export default function resolve (block, ...stack) {
	switch (typeof block) {
		case 'object': {
			if (!block) {
				break;
			}

			let variables = resolve(block._, ...stack, null);
			let result;

			if (variables === null) {
				if (block._) {
					break;
				}

				variables = stack[0];
			}

			if (Array.isArray(variables)) {
				const reduction = { ...block, _: undefined };

				result = variables
					.map(item => resolve(reduction, item, ...stack))
					.filter(value => value !== null);

				if (result.length === 0) {
					break;
				}
			} else {
				result = resolve(block.$, variables, ...stack);

				if (typeof result !== 'object') {
					return result;
				}

				const allowEmpty = stack[stack.length - 1] === null;
				let someDefined = false;
				result = result || {};

				for (const key in block) {
					if (key === '_' || key === '$') {
						continue;
					}

					const value = resolve(block[key], variables, ...stack);
					const isDefined = !isEmpty(value);

					if (isDefined || allowEmpty) {
						result[key] = value;

						if (isDefined) {
							someDefined = true;
						}
					}
				}

				if (!someDefined) {
					break;
				}
			}

			return result;
		}
		case 'string': {
			const result = resolveExpression(block, ...stack);
			
			if (!isEmpty(result)) {
				return result;
			}
		}
	}
	
	return null;
}
