import { spaceRegex } from './patterns';
import { isClientSide } from './environment';
import { isEmpty } from './is-empty';
import { isEqual } from './is-equal';
import { mergeObjects } from './merge-objects';

const literalTypeRegex = /^(string|number)$/;
const singletonRegex = /^(wbr|track|source|param|meta|link|keygen|input|img|hr|embed|command|col|br|base|area|!doctype)$/;
const inputRegex = /^(input)$/;

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
}

ElementStructure.prototype.append = function (newContent) {
	if (singletonRegex.test(this.type)) {
		return this;
	}

	let content = this.content;

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

	return this;
};

ElementStructure.prototype.render = function (liveTemplate, existingElement) {
	const type = this.type;
	const classNames = this.classNames;
	const attributes = this.attributes;
	const events = this.events;
	const scope = this.scope;
	let content = this.content;
	let element;

	if (isClientSide()) {
		element = existingElement || document.createElement(type);

		if (element !== liveTemplate.element || !liveTemplate.initialized) {
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
				}
			}

			liveTemplate.initialized = true;
		}
		
		if (element === liveTemplate.element) {
			liveTemplate.element = undefined;
		}
		
		this.element = element;
	}

	let result = element || `<${this.type}`;

	if (isEmpty(content, true)) {
		if (inputRegex.test(type)) {
			attributes.value = scope;
		} else {
			this.append(scope);
			content = this.content;
		}
	}
	
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

	if (!singletonRegex.test(type)) {
		const children = content.map(child => {
			if (child instanceof ElementStructure) {
				return child.render(liveTemplate);
			} if (literalTypeRegex.test(typeof child)) {
				if (element) {
					return document.createTextNode(child);
				}

				return child;
			}
		});

		if (element) {
			result.innerHTML = '';
			children.forEach(child => result.appendChild(child));
		} else {
			result += `${children.join('')}</${type}>`;
		}
	}

	return result;
};
