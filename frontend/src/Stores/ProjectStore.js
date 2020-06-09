import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';


class ProjectStore {

	@observable currentProject;
    @observable projects = [];
    @observable loading = true


	@action setData({projects}) {
        this.loading = false
		this.projects = projects;
	}


    @action setProject(project){
        this.currentProject = project
        pipelineStore.getPipelines()
    }

	@action selectProject(project){
        this.currentProject = project
        pipelineStore.getPipelines()
        routeStore.push(`/project/${this.currentProject.name}/pipelines`)
    }
    
    @action getProjects(){
        this.loading = true
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
        this.loading = true
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
