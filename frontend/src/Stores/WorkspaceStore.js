import { observable, action } from 'mobx';
import storage from '../Services/perfectLocalStorage';
import user from '../Stores/UserStore'
import projectStore from './ProjectStore';
import routeStore from './RouteStore';
import { workspaces } from '../Services/Server'


class WorkspaceStore {

	@observable currentWorkspace
	@observable workspaces = []

	@action setData({ workspaces }) {
		this.workspaces = workspaces

		let workspace_id = storage.get('ora.ci_workspace')
		let selected = null

		if(!workspace_id) {
			selected = this.workspaces.find(workspace => workspace.name === user.name)
		}
		else {
			selected = this.workspaces.find(workspace => workspace._id === workspace_id)
		}

		this.selectWorkspace(selected)
	}

	@action selectWorkspace(workspace) {
		this.currentWorkspace = workspace
		storage.set('ora.ci_workspace', this.currentWorkspace._id)
		projectStore.getProjects()
		routeStore.push("/projects")
	}

	@action getWorkspaces() {
		workspaces
		.getWorkspaces()
		.then(data => this.setData(data))	
    }

}

const workspaceStore = new WorkspaceStore()
export default workspaceStore
