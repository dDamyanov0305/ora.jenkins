import customLocalStorage from './customLocalStorage'

function setObject(key, value) {
	if (value === undefined) return;
	value = JSON.stringify(value);
	customLocalStorage.setItem(key, value);
	return value;
}

const storage = {
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

export default storage
