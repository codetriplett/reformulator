const operators = '()|&=!<>#+-/*%^.';
const operatorPrecedence = '0012333345566678';

const numberDefinition = '(-?(0|[1-9][0-9]*)(.[0-9]+)?)';
const variableDefinition = '([a-zA-Z_$][0-9a-zA-Z_$]*)';
const stringDefinition = '("(\\\\"|[^"])*"|\'(\\\\\'|[^\'])*\')';
const typeDefinition = '(!doctype|[a-z]+)';
const objectDefinition = `(\\{(${stringDefinition}|[^}])*\\})`;
const arrayDefinition = `(\\[(${stringDefinition}|[^\\]])*\\])`;
const elementDefinition = `< *${typeDefinition} *(${arrayDefinition}(${stringDefinition}|[^>])*)?>`;
const wrapperDefinition = `(${elementDefinition}|${arrayDefinition}|${objectDefinition}|${stringDefinition})`;

const operatorDefinition = '()|&=!<>#+\\-/*%^.\\?';
const operandDefinition = `((${wrapperDefinition}|${numberDefinition}|[^${operatorDefinition}:,])*)`;
const operationDefinition = `([${operatorDefinition}] *${operandDefinition})`;
const expressionDefinition = `((${stringDefinition}|[^:,])*)`;

const booleanRegex = /^(true|false)$/;
const literalTypeRegex = /^(string|number)$/;
const spaceRegex = / +/g;
const variableRegex = new RegExp(`^${variableDefinition}$`);
const stringRegex = new RegExp(`^${stringDefinition}$`);
const typeRegex = new RegExp(`^${typeDefinition}$`);
const singletonRegex = /^(wbr|track|source|param|meta|link|keygen|input|img|hr|embed|command|col|br|base|area|!doctype)$/;
const objectRegex = new RegExp(`^${objectDefinition}$`);
const arrayRegex = new RegExp(`^${arrayDefinition}$`);
const elementRegex = new RegExp(`^${elementDefinition}$`);
const scopeRegex = new RegExp(`^${arrayDefinition}`);
const operationRegex = new RegExp(`^${operationDefinition} *`);
const expressionRegex = new RegExp(`^ *${expressionDefinition} *$`);
const negativeSignRegex = new RegExp(`[${operatorDefinition}] *-(?=${variableDefinition}|\\()`);
const negationRegex = new RegExp(`[${operatorDefinition}] *!(?=${operandDefinition})`);
const existenceRegex = new RegExp(`[${operatorDefinition}] *\\?(?=${operandDefinition})`);

const escapedCharacterRegexMap = {
	'\'': /\\'/g,
	'"': /\\"/g
};

const defaultAttributes = {
	img: { alt: '' }
};

function Element (type, options = {}) {
	this.type = type;
	this.scope = options.scope;
	this.classNames = options.classNames || [];
	this.attributes = mergeObjects(defaultAttributes[type] || {}, options.attributes || {});
}

Element.prototype.render = function (content) {
	const type = this.type;
	const classNames = this.classNames;
	const attributes = this.attributes;

	const classString = classNames.length > 0 ? ` class="${classNames.sort().join(' ')}"` : '';
	let attributeString = '';
	let flagString = '';
	
	Object.keys(attributes).sort().forEach(key => {
		const value = attributes[key];
		let valueString = '';
		
		if (literalTypeRegex.test(typeof value)) {
			attributeString += ` ${key}="${value}"`;
		} else if (value === true) {
			flagString += ` ${key}`;
		}
	});

	const tag = `<${type}${classString}${attributeString}${flagString}>`;

	if (singletonRegex.test(type)) {
		return tag;
	} else if (isEmpty(content)) {
		content = this.scope;
	}

	if (!Array.isArray(content)) {
		content = [content];
	}

	content = content
		.filter(item => literalTypeRegex.test(typeof item))
		.join('');

	return `${tag}${content}</${type}>`;
};

function isEmpty (value, isStrict) {
	if (value === undefined || value === null || typeof value === 'number' && isNaN(value)
			|| isStrict && (value === '' || (typeof value === 'object' && !Object.keys(value).length))) {
		return true;
	}

	return false;
}

function isEqual (firstValue, secondValue, allowExtraProperties) {
	if ((firstValue === null || typeof firstValue !== 'object')
			&& (secondValue === null || typeof secondValue !== 'object')) {
		return firstValue === secondValue;
	}

	if (isEmpty(firstValue) || isEmpty(secondValue)) {
		return false;
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

function mergeObjects (first, second) {
	if (Array.isArray(first) && Array.isArray(second)) {
		const firstLength = first.length;
		const secondLength = second.length;
		const mergeCount = Math.min(firstLength, secondLength);

		const result = first.slice(0, mergeCount).map((item, i) => {
			return mergeObjects(item, second[i]);
		}).concat(firstLength < secondLength ? second.slice(firstLength) : first.slice(secondLength));

		return result;
	} else if (first === null || second === null
			|| typeof first !== 'object' || typeof second !== 'object'
			|| Array.isArray(first) || Array.isArray(second)) {
		return second;
	}

	const result = {};
	const firstKeys = Object.keys(first);
	const secondKeys = Object.keys(second);

	firstKeys.forEach(key => {
		result[key] = secondKeys.indexOf(key) !== -1 ? mergeObjects(first[key], second[key]) : first[key];
	});

	secondKeys.forEach(key => {
		if (firstKeys.indexOf(key) === -1) {
			result[key] = second[key];
		}
	});

	return result;
}

function resolveStructure (string, ...stack) {
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
		remainingString = remainingString.slice(commaIndex + 1);

		if ((colonIndex !== -1 && !variableRegex.test(key)) || !expressionRegex.test(expression)) {
			return;
		}

		const value = resolveExpression(expression, ...stack);

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

function resolveElement (string, ...stack) {
	const bracketIndex = string.indexOf('[');
	const type = string.slice(1, bracketIndex).trim();

	if (!typeRegex.test(type)) {
		return;
	}

	if (bracketIndex === -1) {
		return new Element(type);
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

	return new Element(type, { scope, classNames, attributes });
}

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
		const structure = resolveStructure(trimmedValue, ...stack);
		return structure ? structure[0] : null;
	} else if (arrayRegex.test(trimmedValue)) {
		const structure = resolveStructure(trimmedValue, ...stack);
		return structure ? structure.slice(1) : null;
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
			result = firstValue === undefined ? isEmpty(secondValue, true) : null;
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
		case '?:empty:structure':
		case '?:empty:literal':
		case '?:empty:empty':
			result = firstValue === undefined ? !isEmpty(secondValue, true) : null;
			break;
	}

	switch (specificOperator) {
		case '#:number:number': {
			const subtractedValue = firstValue - 1 / (2 * Math.pow(10, secondValue));
			result = subtractedValue.toFixed(secondValue);
			break;
		}
		case '+:object:object':
			result = mergeObjects(firstValue, secondValue);
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

export default function resolve (template, ...stack) {
	if (!template) {
		return null;
	} else if (Array.isArray(stack[0])) {
		const remaining = stack.slice(1);

		const result = stack[0]
			.map(item => resolve(template, item, ...remaining))
			.filter(value => !isEmpty(value));

		return result.length > 0 ? result : null;
	} else if (typeof template === 'string') {
		let result = resolveExpression(template, ...stack);

		if (result instanceof Element) {
			return result.render();
		} else if (Array.isArray(result) && result[0] instanceof Element) {
			result = result.map(item => item.render());
			result = result.length > 0 ? result : null;
		}

		return !isEmpty(result) ? result : null;
	} else if (Array.isArray(template)) {
		let result = [];
		let local = stack[0];
		let distant = stack.slice(1);
		let count = 0;
		let keepArray = false;
		let previous;

		template.concat(['']).forEach(templateItem => {
			const isArray = Array.isArray(templateItem);
			let container;

			if (previous) {
				const resolver = typeof previous === 'string' ? resolveExpression : resolve
				container = resolver(previous, local, ...distant);
			} else if (isArray) {
				container = '';
			}

			if (!isEmpty(container) && container !== false) {
				count++;

				if (!Array.isArray(container)) {
					container = [container];
				} else {
					keepArray = true;
				}

				const isElement = container[0] instanceof Element;
				keepArray = !isElement && keepArray;

				container.forEach(containerItem => {
					let scope = isElement ? containerItem.scope : (containerItem || null);
					scope = scope !== true ? scope : null;
					const content = isArray ? resolve(templateItem, scope, local, ...distant) : scope;

					if (!isEmpty(content)) {
						if (!isElement) {
							if (Array.isArray(content)) {
								keepArray = true;
							} else if (typeof content === 'object') {
								local = mergeObjects(local, content);
							}
						}

						result = result.concat(isElement ? containerItem.render(content) : content);
					}
				});
			}

			previous = !isArray ? templateItem : undefined;
		});

		if (!keepArray) {
			if (result.length === 0) {
				return null;
			}

			result = result.reduce((result, item) => {
				const merge = resolveOperation(result, '+', item);
				return typeof merge === typeof item && merge !== null ? merge : item;
			});
		}

		return !isEmpty(result) ? result : null;
	} else if (typeof template === 'object') {
		const result = {};

		Object.keys(template).forEach(key => {
			const value = resolve(template[key], ...stack);

			if (!isEmpty(value)) {
				result[key] = value;
			}
		});

		return Object.keys(result).length > 0 ? result : null;
	}
}
