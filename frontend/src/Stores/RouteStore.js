import { observable } from 'mobx';


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
