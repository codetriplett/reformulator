import { isEmpty } from './is-empty';
import { mergeObjects } from './merge-objects';

const literalTypeRegex = /^(string|number)$/;
const singletonRegex = /^(wbr|track|source|param|meta|link|keygen|input|img|hr|embed|command|col|br|base|area|!doctype)$/;

const defaultAttributes = {
	img: { alt: '' },
	a: { href: 'javascript:void(0);' }
};

export function ElementStructure (type, options = {}) {
	this.type = type;
	this.scope = options.scope;
	this.classNames = options.classNames || [];
	this.attributes = mergeObjects(defaultAttributes[type] || {}, options.attributes || {});
}

ElementStructure.prototype.render = function (content) {
	const type = this.type;
	const classNames = this.classNames;
	const attributes = this.attributes;

	const classString = classNames.length > 0 ? ` class="${classNames.sort().join(' ')}"` : '';
	let stateString = '';
	let attributeString = '';
	let flagString = '';
	
	Object.keys(attributes).sort().forEach(key => {
		const value = attributes[key];
		let keyString = ` ${key}`;
		
		if (key.indexOf('on') === 0) {
			stateString = keyString;
		} else if (literalTypeRegex.test(typeof value)) {
			attributeString += `${keyString}="${value}"`;
		} else if (value === true) {
			flagString += keyString;
		}
	});

	const tag = `<${type}${classString}${attributeString}${flagString}>`;

	if (singletonRegex.test(type)) {
		return tag;
	} else if (isEmpty(content)) {
		content = this.scope;
	}

	if (!Array.isArray(content)) {
		content = [content];
	}

	content = content
		.filter(item => literalTypeRegex.test(typeof item))
		.join('');

	return `${tag}${content}</${type}>${stateString ? `<!--${stateString} -->` : ''}`;
};
