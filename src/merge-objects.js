export function mergeObjects (first, second) {
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
