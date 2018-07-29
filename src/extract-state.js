import { variableDefinition } from './variables';

const stateDefinition = `(<!--( ${variableDefinition})+ -->)`;
const stateRegex = new RegExp(`${stateDefinition}?$`);

export function extractState (string, variables) {
	if (typeof string === 'string') {
		const stateString = string.match(stateRegex)[0];

		if (stateString) {
			stateString.slice(4, -3).trim().split(' ').forEach(key => variables[key] = true);
			return string.slice(0, -stateString.length);
		}
	}

	return string;
}
