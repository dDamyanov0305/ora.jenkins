const randomString = 'ctu0YYLtGe';

class TemporaryStorage {
	constructor() {
		this._data = {};
	}

	getItem(key) {
		if (this._data[key] === undefined)			{ return null; }
		return this._data[key];
	}

	setItem(key, value) {
		this._data[key] = value.toString();
	}

	removeItem(key) {
		delete this._data[key];
	}
}

function storage() {
	try {
		if (typeof localStorage !== 'object') {
			return new TemporaryStorage();
		}
	} catch (e) {
		return new TemporaryStorage();
	}

	try { // This try catch is meaningful -Nestorov
		localStorage.setItem(randomString, 1);
		if (localStorage.getItem(randomString) !== '1') throw 'LS';
		localStorage.removeItem(randomString);
		return localStorage;
	} catch (e) {
		return new TemporaryStorage();
	}
}

module.exports = storage();
