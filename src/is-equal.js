import { isEmpty } from './is-empty';

export function isEqual (firstValue, secondValue, allowExtraProperties) {
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

	secondValueKeys.forEach(key => {
		if (!isEqual(firstValue[key], secondValue[key], allowExtraProperties)) {
			return false;
		}
	});

	return true;
}
