import { observable, action } from 'mobx';
import storage from '../Services/perfectLocalStorage';
import user from '../Stores/UserStore'
import projectStore from './ProjectStore';
import routeStore from './RouteStore';

class WorkspaceStore {

	@observable currentWorkspace;
	@observable workspaces = [];


	@action setData({workspaces}) {
		this.workspaces = workspaces;

		let workspace_id = storage.get('ora.ci_workspace')
		let selected = null

		if(!workspace_id){
			selected = this.workspaces.find(workspace => workspace.name === user.name)
		}
		else{
			selected = this.workspaces.find(workspace => workspace._id === workspace_id)
		}

		this.selectWorkspace(selected)
		
	}

	@action selectWorkspace(workspace){
		this.currentWorkspace = workspace
		storage.set('ora.ci_workspace', this.currentWorkspace._id)
		projectStore.getProjects()
		routeStore.push("/projects")
	}

	@action async getWorkspaces(){
        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/workspaces/all`,{
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            }
        })
		const data = await result.json()
		if(result.status < 200 || result.status >= 300){
			console.log(data.error)
		}
		else{
			this.setData(data)
		}
		
    }

}

const workspaceStore = new WorkspaceStore();
export default workspaceStore
