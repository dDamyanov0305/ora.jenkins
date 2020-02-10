import { observable } from 'mobx';
import storage from '../Services/perfectLocalStorage';

class UserStore {

	@observable token;
	@observable loggedIn;
	@observable id;

	constructor() {
		this.loggedIn = false;
		const account = storage.getObject('ora.jenkins_authenticated_account');
		if (account) {
			this.setAccount(account);
		}

	}

	 get githubToken() {
		return this.integrations?.find(i => i.type === 'GITHUB')	
	}

	setAccount(account) {
		
		this.loggedIn = true;
		this.id = account._id;
		this.name = account.name;
		this.email = account.email;
		this.token = account.token;
		
		storage.setObject(`ora.jenkins_authenticated_account`, account);
	}

	logout() {
		storage.clear();
		document.location.reload();
	}

}

const user = new UserStore();
export default user
