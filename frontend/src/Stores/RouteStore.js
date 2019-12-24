
import { observable } from 'mobx';

//  This store updates from Header.js on each render
//  It provides easy access to push function and current pathname

class RouteStore {
	@observable pathname = '';
	push = function () { }

	update(history, location) {
		this.push = history.push;
		this.pathname = location.pathname;
	}
}

const routeStore = new RouteStore();
export default routeStore;
