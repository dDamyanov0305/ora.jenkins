// https://codemotion.quip.com/JcLsAiVPaMh5

const customLocalStorage = require('./customLocalStorage');

function setObject(key, value) {
	if (value === undefined) return;
	value = JSON.stringify(value);
	customLocalStorage.setItem(key, value);
	return value;
}

exports.storage = {
	set(key, value) {
		customLocalStorage.setItem(key, value);
		return String(value);
	},
	get(key, defaultValue = false) {
		return customLocalStorage.getItem(key) || defaultValue;
	},
	setObject,
	getObject(key) {
		return JSON.parse(customLocalStorage.getItem(key)) || {};
	},
	setArray: setObject,
	getArray(key) {
		return JSON.parse(customLocalStorage.getItem(key)) || [];
	},
	remove(key) {
		return customLocalStorage.removeItem(key);
	},
	clear() {
		return customLocalStorage.clear();
	}
};
