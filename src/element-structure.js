import {
	literalTypeRegex,
	spaceRegex,
} from './patterns';

import { isClientSide } from './environment';
import { isEqual } from './is-equal';
import { mergeObjects } from './merge-objects';
import { updateChildren } from './update-children';

const singletonRegex = /^(wbr|track|source|param|meta|link|keygen|input|img|hr|embed|command|col|br|base|area|!doctype)$/;
const inputRegex = /^(input)$/;
const rangeRegex = /(-[0-9]+)?$/;

const defaultAttributes = {
	img: { alt: '' },
	a: { href: 'javascript:void(0);' }
};

export function ElementStructure (type, options = {}) {
	const attributesAndVariables = mergeObjects(defaultAttributes[type] || {}, options.attributes || {});
	let classNames = options.classNames || [];
	let templateId = options.templateId;
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
		} else if (key !== 'key') {
			attributes[key] = value;
		} else if (templateId) {
			templateId = templateId.replace(rangeRegex, `-${value}`);
		}
	}

	this.type = type;
	this.scope = options.scope;
	this.classNames = classNames.sort();
	this.attributes = attributes;
	this.content = options.content;
	this.events = events;
	this.variables = variables;
	this.templateId = templateId;
}

ElementStructure.prototype.append = function (newContent) {
	if (singletonRegex.test(this.type)) {
		return this;
	}
	
	let content = this.content = [];

	if (!Array.isArray(newContent)) {
		newContent = [newContent];
	}

	newContent.forEach(item => {
		const itemIsElement = item instanceof ElementStructure;

		if (itemIsElement) {
			this.variables = { ...this.variables, ...item.variables };
		}
		
		if (itemIsElement || literalTypeRegex.test(typeof item)) {
			content.push(item);
		}
	});

	this.content = content;

	return this;
};

ElementStructure.prototype.render = function (liveTemplate) {
	const type = this.type;
	const classNames = this.classNames;
	const attributes = this.attributes;
	const events = this.events;
	const scope = this.scope;
	let content = this.content;
	let templateId = this.templateId;
	let shadow = liveTemplate.elements[templateId];
	let element;

	if (isClientSide()) {
		if (shadow) {
			element = shadow.element;
		} else {
			element = (!liveTemplate.initialized && liveTemplate.element) || document.createElement(type);
			liveTemplate.initialized = true;

			for (const key in events) {
				const variable = events[key];

				switch (key) {
					case 'onclick':
						element.addEventListener('click', () => liveTemplate.update(variable));
						break;
					case 'onkeydown':
						element.addEventListener('keydown', event => liveTemplate.update(variable, event.target.value));
						break;
					case 'onkeyup':
						element.addEventListener('keyup', event => liveTemplate.update(variable, event.target.value));
						break;
					case 'onkeypress':
						element.addEventListener('keypress', event => liveTemplate.update(variable, event.target.value));
						break;
					case 'onappear':
						liveTemplate.register('appear', element, variable);
						break;
					case 'onabove':
						liveTemplate.register('above', element, variable);
						break;
					case 'onbelow':
						liveTemplate.register('below', element, variable);
						break;
				}
			}
		}
		
		this.element = element;
	}

	let result = element || `<${this.type}`;

	if (content === undefined && literalTypeRegex.test(typeof scope)) {
		if (inputRegex.test(type)) {
			attributes.value = scope;
		} else {
			this.append(scope);
			content = this.content;
		}
	}
	
	if (!shadow || !isEqual(classNames, shadow.classNames)) {
		const classString = classNames.sort().join(' ');

		if (element) {
			if (classString) {
				result.className = classString;
			} else {
				result.removeAttribute('class');
			}
		} else if (classString) {
			result += ` class="${classString}"`;
		}
	}
	
	if (!shadow || !isEqual(attributes, shadow.attributes)) {
		let attributeString = '';
		let flagString = '';
		
		Object.keys(attributes).sort().forEach(key => {
			const value = attributes[key];

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
		});

		if (!element) {
			result += `${attributeString}${flagString}>`;
		}
	}

	if (!singletonRegex.test(type)) {
		const newChildren = (content || []).map(child => {
			if (child instanceof ElementStructure) {
				return child.render(liveTemplate);
			} else if (element) {
				return document.createTextNode(child);
			}

			return child;
		});

		const plainText = newChildren.length === 1 && !newChildren[0].tagName && newChildren[0].nodeValue;

		if (!element) {
			result += `${newChildren.join('')}</${type}>`;
		} else if (newChildren.length > 1 || !plainText) {
			updateChildren(element, newChildren);
		} else if (plainText !== element.innerHTML) {
			element.innerHTML = plainText || '';
		}
	}

	if (templateId !== undefined) {
		liveTemplate.newElements[templateId] = this;
	}

	return result;
};
