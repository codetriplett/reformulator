import { LiveTemplate } from './live-template';

export default (template, ...stack) => {
	const liveTemplate = new LiveTemplate(template, ...stack);
	return liveTemplate.resolve();
};
