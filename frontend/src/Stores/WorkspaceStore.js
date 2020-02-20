import { observable } from 'mobx';
import storage from '../Services/perfectLocalStorage';
import user from '../Stores/UserStore'

class WorkspaceStore {

	@observable token;
	@observable loggedIn;
	@observable id;

	constructor() {
        
		if (user.loggedtoken) {
			console.log(token)
			fetch('http://localhost:5000/users/me',{
				headers:{'Authorization':'Bearer '+token}
			})
			.then(res=>res.json())
			.then(data=>this.setAccount(data))
		}

	}


	setAccount({user: account, token}) {
		console.log(account)
		this.loggedIn = true;
		this.id = account._id;
		this.name = account.name;
		this.email = account.email;
		this.token = token
		storage.set('ora.ci_token', token);
	}

	logout() {
		storage.clear();
		document.location.reload();
	}

}

const user = new UserStore();
export default user
