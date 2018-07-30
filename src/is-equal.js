import { isEmpty } from './is-empty';

export function isEqual (firstValue, secondValue, relaxed) {
	if (firstValue === null || typeof firstValue !== 'object'
			|| secondValue === null || typeof secondValue !== 'object') {
		return firstValue === secondValue;
	}

	if (isEmpty(firstValue) || isEmpty(secondValue)) {
		return false;
	}

	const firstValueKeys = Object.keys(firstValue);
	const secondValueKeys = Object.keys(secondValue);

	if (!relaxed && firstValueKeys.length !== secondValueKeys.length
			|| relaxed && firstValueKeys.length < secondValueKeys.length) {
		return false;
	}

	for (const key of secondValueKeys) {
		if (!isEqual(firstValue[key], secondValue[key], relaxed)) {
			return false;
		}
	}

	return true;
}
