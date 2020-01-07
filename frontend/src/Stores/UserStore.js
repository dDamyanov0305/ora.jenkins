import { observable } from 'mobx';
import storage from '../Services/perfectLocalStorage';

class UserStore {

	@observable token;
	@observable loggedIn;
	@observable id;

	constructor() {
		this.loggedIn = false;
		const account = storage.getObject('ora.jenkins_authenticated_account');
		if (account.id) {
			this.setAccount(account);
		}

	}

	 get githubToken() {
		for(let integration in this.integrations){
			if(integration.type === 'github')
				return integration.token
		}
		return null
	}

	setAccount(account) {
		
		this.loggedIn = true;
		this.id = account.id;
		this.name = account.name;
		this.email = account.email;
		this.token = account.token;
		this.integrations = account.integrations || []
		
		storage.setObject(`ora.jenkins_authenticated_account`, account);
	}

	logout() {
		storage.clear();
		document.location.reload();
	}

}

const user = new UserStore();
export default user
