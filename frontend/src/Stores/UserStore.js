import { observable, action } from 'mobx';
import storage from '../Services/perfectLocalStorage';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';

class UserStore {

	@observable token;
	@observable loggedIn;
	@observable id;

	constructor() {
		this.loggedIn = false;
		this.token = storage.get('ora.ci_token');
		console.log(this.token)
		if (this.token) {
			routeStore.push('/projects')
			this.getMe()
		}else{
			routeStore.push('/login')
			storage.remove('ora.ci_workspace')
		}

	}

	getMe = async () => {
		const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/users/me`,
		{
			headers:{'Authorization':`Bearer ${this.token}`}
		})

		
		const data = await result.json()
		
        if(result.status < 200 || result.status >= 300){
            console.log(data.error)
        }
        else{
			
			this.setAccount(data)

        }
	}


	@action setAccount({user: account, token, integrations}) {
		console.log(integrations)
		this.loggedIn = true;
		this.id = account._id;
		this.name = account.name;
		this.email = account.email;
		this.token = token
		this.integrations = integrations
		storage.set('ora.ci_token', token);
		workspaceStore.getWorkspaces()
		//routeStore.push('/projects')
	}

	@action addIntegration(integration){
		this.integrations.push(integration)
	}

	logout = async() => {
		storage.clear();
		fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/users/me/logout`,{
			headers:{'Authorization':`Bearer ${this.token}`}
		})
		.then(res => res.json())
		.then(data => console.log(data))
		document.location.reload();
	}

}

const user = new UserStore();
export default user
