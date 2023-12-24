import { observable, action } from 'mobx';
import storage from '../Services/perfectLocalStorage';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';
import { users } from '../Services/Server'


class UserStore {

	@observable token
	@observable loggedIn
	@observable id

	constructor() {
		this.loggedIn = false;
		this.token = storage.get('ora.ci_token')

		if (this.token) {
			routeStore.push('/projects')
			this.getMe()
		}
		else {
			routeStore.push('/login')
			storage.remove('ora.ci_workspace')
		}
	}

	getMe = () => {
		users
		.getMe()
		.then(data => this.setAccount(data))
		.catch(error => console.error(error))
	}

	@action setAccount({user: account, token, integrations}) {
		this.loggedIn = true
		this.id = account._id
		this.name = account.name
		this.email = account.email
		this.token = token
		this.integrations = integrations
		storage.set('ora.ci_token', token)
		workspaceStore.getWorkspaces()
		routeStore.push('/projects')
	}

	@action addIntegration(integration) {
		this.integrations.push(integration)
	}

	logout = () => {
		storage.clear()
		users
		.logout()
		.then(() => document.location.reload())
	}
}


const user = new UserStore();
export default user
