import { isEmpty } from './is-empty';
import { isEqual } from './is-equal';
import { mergeObjects } from './merge-objects';
import { typeOf } from './type-of';

export function resolveOperation (firstValue, operator, secondValue) {
	const generalOperator = `${operator}:${typeOf(firstValue, true)}:${typeOf(secondValue, true)}`;
	const specificOperator = `${operator}:${typeOf(firstValue)}:${typeOf(secondValue)}`;
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
			result = isEqual(secondValue, firstValue, true) && !isEqual(secondValue, firstValue) ? firstValue : null;
			break;
		case '<:literal:literal':
			result = firstValue < secondValue ? firstValue : null;
			break;
		case '>:structure:structure':
			result = isEqual(firstValue, secondValue, true) && !isEqual(firstValue, secondValue) ? firstValue : null;
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
