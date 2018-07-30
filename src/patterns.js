export const variableDefinition = '([a-zA-Z_$][0-9a-zA-Z_$]*)';
export const stringDefinition = '("(\\\\"|[^"])*"|\'(\\\\\'|[^\'])*\')';
export const typeDefinition = '(!doctype|[a-z]+)';
export const objectDefinition = `(\\{(${stringDefinition}|[^}])*\\})`;
export const arrayDefinition = `(\\[(${stringDefinition}|[^\\]])*\\])`;
export const elementDefinition = `< *${typeDefinition} *(${arrayDefinition}(${stringDefinition}|[^>])*)?>`;
export const variableRegex = new RegExp(`^${variableDefinition}$`);
export const spaceRegex = / +/g;
