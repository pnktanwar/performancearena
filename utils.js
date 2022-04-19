const PERCENTILE_ACCURACY = 0.95;

const asc = (arr) => arr.sort((a, b) => a - b);

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const mean = (arr) => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
	const mu = mean(arr);
	const diffArr = arr.map((a) => (a - mu) ** 2);
	return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr, q) => {
	const sorted = asc(arr);
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	} else {
		return sorted[base] || 0;
	}
};

const clearDiv = (div) => {
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }
};


const addClass = (selector, clazz) => {
	document.querySelectorAll(selector).forEach(elem => {
		elem.classList.add(clazz);
	});
};

const removeClass = (selector, clazz) => {
	document.querySelectorAll(selector).forEach(elem => {
		elem.classList.remove(clazz);
	});
};

const addListener = (selector, listenerType, listenerFn) => {
	document.querySelectorAll(selector).forEach(elem => {
		elem.addEventListener(listenerType, listenerFn, false);
	});
};
