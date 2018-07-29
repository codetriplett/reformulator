export function isEmpty (value, isStrict) {
	if (value === undefined || value === null || typeof value === 'number' && isNaN(value)
			|| isStrict && (value === '' || (typeof value === 'object' && !Object.keys(value).length))) {
		return true;
	}

	return false;
}
