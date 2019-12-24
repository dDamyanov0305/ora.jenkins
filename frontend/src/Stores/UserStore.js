import { observable } from 'mobx';
import { storage } from '../Services/perfectLocalStorage';

class UserStore {

	@observable token;
	@observable loggedIn;
	@observable profilePicture;
	@observable id;

	constructor() {
		this.loggedIn = false;
		const account = storage.getObject('authenticatedAccount');
		if (account.id) {
			this.setAccount(account);
		}

	}

	setAccount(account) {
		// console.log(`setAccount is called`);
		this.loggedIn = true;
		this.id = account.id;
		this.username = account.username;
		this.email = account.email;
		this.token = account.token;
		this.profilePicture = account.profile_picture;
		this.fullName = account.full_name;
		
		// storage.setObject(`authenticatedAccount`, account);
	}

	logout() {
		api.send({ intention: 'logout' });
		storage.clear();
		document.location.reload();
	}

}

const user = new UserStore();
module.exports = user;
