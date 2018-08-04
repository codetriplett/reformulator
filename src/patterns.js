export const variableDefinition = '([a-zA-Z_$][0-9a-zA-Z_$]*)';
export const keyDefinition = `(${variableDefinition}(-${variableDefinition})*)`;
export const stringDefinition = '("(\\\\"|[^"])*"|\'(\\\\\'|[^\'])*\')';
export const typeDefinition = '(!doctype|[a-z]+)';
export const objectDefinition = `(\\{(${stringDefinition}|[^}])*\\})`;
export const arrayDefinition = `(\\[(${stringDefinition}|[^\\]])*\\])`;
export const elementDefinition = `< *${typeDefinition} *(${arrayDefinition}(${stringDefinition}|[^>])*)?>`;
export const variableRegex = new RegExp(`^${variableDefinition}$`);
export const keyRegex = new RegExp(`^${keyDefinition}$`);
export const literalTypeRegex = /^(string|number)$/;
export const rangeRegex = /-[0-9]+$/;
export const spaceRegex = / +/g;
