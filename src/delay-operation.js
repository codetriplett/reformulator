const operators = '()|&=!<>#+-/*%^.';
const operatorPrecedence = '0012333345566678';

export function delayOperation (currentOperator, nextOperator) {
	if (currentOperator === ')' || nextOperator === ')' || !nextOperator) {
		return false;
	} else if (currentOperator === '(' || nextOperator === '(') {
		return true;
	}

	const currentPrecedence = operatorPrecedence[operators.indexOf(currentOperator)];
	const nextPrecedence = operatorPrecedence[operators.indexOf(nextOperator)];

	return nextPrecedence > currentPrecedence;
}
