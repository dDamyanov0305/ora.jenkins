import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';


class ProjectStore {

	@observable currentProject;
    @observable projects = [];


	@action setData({projects}) {
		console.log(projects)
		this.projects = projects;
	}

	@action selectProject(project){
        this.currentProject = project
        pipelineStore.getPipelines(this.currentProject._id)
        routeStore.push(`/project/${this.currentProject.name}/pipelines`)
    }
    
    @action getProjects(){
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/projects/all`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({workspace_id:workspaceStore.currentWorkspace._id})
        })
        .then(res => res.json())
        .then(data => this.setData(data))
    }

    delete = async(project) => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/projects`,{
            method:'DELETE',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                project_id:project._id
            })
        }).then(()=>this.getProjects())        
    }

}

const projectStore = new ProjectStore();
export default projectStore
