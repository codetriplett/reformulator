import { spaceRegex } from './patterns';
import { isClientSide } from './environment';
import { isEmpty } from './is-empty';
import { isEqual } from './is-equal';
import { mergeObjects } from './merge-objects';

const literalTypeRegex = /^(string|number)$/;
const singletonRegex = /^(wbr|track|source|param|meta|link|keygen|input|img|hr|embed|command|col|br|base|area|!doctype)$/;

const defaultAttributes = {
	img: { alt: '' },
	a: { href: 'javascript:void(0);' }
};

export function ElementStructure (type, options = {}) {
	const attributesAndVariables = mergeObjects(defaultAttributes[type] || {}, options.attributes || {});
	let classNames = options.classNames || [];
	const attributes = {};
	const events = {};
	const variables = {};

	classNames = classNames.reduce((classNames, className) => {
		return classNames.concat(className.trim().split(spaceRegex));
	}, []);

	for (const key in attributesAndVariables) {
		const value = attributesAndVariables[key];

		if (key.indexOf('on') === 0) {
			events[key] = value;
			variables[value] = true;
		} else {
			attributes[key] = value;
		}
	}

	this.type = type;
	this.scope = options.scope;
	this.classNames = classNames.sort();
	this.attributes = attributes;
	this.content = [];
	this.events = events;
	this.variables = variables;

	if (isClientSide()) {
		this.element = document.createElement(type);
	}
}

ElementStructure.prototype.append = function (newContent) {
	if (singletonRegex.test(this.type)) {
		return this;
	}

	const element = this.element;
	let content = this.content;

	if (!Array.isArray(newContent)) {
		newContent = [newContent];
	}

	newContent.forEach(item => {
		let child;

		if (item instanceof ElementStructure) {
			this.variables = { ...this.variables, ...item.variables };
			child = item.render();
		} else if (literalTypeRegex.test(typeof item)) {
			child = element ? document.createTextNode(item) : item;
		}
		
		if (child) {
			content.push(child);
		}
	});

	return this;
};

ElementStructure.prototype.render = function (shadow) {
	const type = this.type;
	const classNames = this.classNames;
	const attributes = this.attributes;
	const element = this.element;
	let content = this.content;
	let result = element || `<${this.type}`;

	if (!shadow && classNames.length > 0 || shadow && !isEqual(classNames, shadow.classNames)) {
		const classString = classNames.sort().join(' ');

		if (element) {
			result.className = classString;
		} else if (classString) {
			result += ` class="${classString}"`;
		}
	}
	
	let attributeString = '';
	let flagString = '';
	
	Object.keys(attributes).sort().forEach(key => {
		const value = attributes[key];

		if (!shadow || !isEqual(value, shadow.attributes[key])) {
			if (!element) {
				const keyString = ` ${key}`;

				if (literalTypeRegex.test(typeof value)) {
					attributeString += `${keyString}="${value}"`;
				} else if (value === true) {
					flagString += keyString;
				}
			} else if (value) {
				result.setAttribute(key, value);
			} else {
				result.removeAttribute(key);
			}
		}
	});

	if (!element) {
		result += `${attributeString}${flagString}>`;
	}

	if (!singletonRegex.test(type)) {
		if (isEmpty(content, true)) {
			this.append(this.scope);
			content = this.content;
		}

		if (element) {
			content.forEach(child => result.appendChild(child));
		} else {
			result += `${content.join('')}</${type}>`;
		}
	}

	return result;
};
