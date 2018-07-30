export function isEmpty (value, strict) {
	if (value === undefined || value === null || typeof value === 'number' && isNaN(value)
			|| strict && (value === '' || (typeof value === 'object' && !Object.keys(value).length))) {
		return true;
	}

	return false;
}
