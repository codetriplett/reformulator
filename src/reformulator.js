import { isClientSide } from './environment';
import { LiveTemplate } from './live-template';

export default function reform (template, ...stack) {
	const liveTemplate = new LiveTemplate(template, ...stack);
	const result = liveTemplate.resolve();

	reform.measure(liveTemplate);
	reform.survey(liveTemplate);

	return result;
}

if (isClientSide()) {
	reform.scrollElements = [];

	let surveyLocked = false;
	let surveyQueued = false;

	reform.measure = function (scopedLiveTemplate) {
		if (surveyLocked) {
			surveyQueued = true;
		} else {
			surveyLocked = true;
			surveyQueued = false;

			const scrollElements = reform.scrollElements;

			scrollElements.forEach((item, i) => {
				const { element, liveTemplate } = item;

				if (!scopedLiveTemplate || liveTemplate === scopedLiveTemplate) {
					const elementTop = element.offsetTop;
					const elementBottom = elementTop + element.offsetHeight;

					scrollElements[i].elementTop = elementTop;
					scrollElements[i].elementBottom = elementBottom;
				}
			});

			setTimeout(() => {
				surveyLocked = false;
				
				if (surveyQueued) {
					reform.measure();
				}
			}, 200);
		}
	};

	reform.survey = function (scopedLiveTemplate) {
		const scrollElements = reform.scrollElements;
		const scrollTop = window.pageYOffset;
		const scrollBottom = scrollTop + window.innerHeight;

		scrollElements.forEach((item, i) => {
			const {
				type,
				elementTop,
				elementBottom,
				variable,
				liveTemplate,
				above = false,
				below = false
			} = item;

			if (!scopedLiveTemplate || liveTemplate === scopedLiveTemplate) {
				switch (type) {
					case 'appear':
						if (elementTop <= scrollBottom && elementBottom >= scrollTop) {
							liveTemplate.update(variable);
							scrollElements.splice(i, 1);
						}
						break;
					case 'above':
						if (above !== elementTop <= scrollTop) {
							liveTemplate.update(variable);
							item.above = !above;
						}
						break;
					case 'below':
						if (below !== elementBottom >= scrollBottom) {
							liveTemplate.update(variable);
							item.below = !below;
						}
						break;
				}
			}
		});
	};

	window.addEventListener('scroll', () => {
		reform.measure();
		reform.survey();
	});
} else {
	reform.measure = function () {};
	reform.survey = function () {};
}
