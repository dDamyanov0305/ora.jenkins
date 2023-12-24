import { observable, action } from 'mobx';
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';
import { projects } from '../Services/Server';


class ProjectStore {

	@observable currentProject;
    @observable projects = [];
    @observable loading = true

	@action setData = ({projects}) => {
        this.loading = false
		this.projects = projects;
	}

    @action setProject = (project) => {
        this.currentProject = project
        pipelineStore.getPipelines()
    }

	@action selectProject = (project) => {
        this.currentProject = project
        pipelineStore.getPipelines()
        routeStore.push(`/project/${this.currentProject.name}/pipelines`)
    }
    
    @action getProjects = () => {
        this.loading = true
        projects.getAll({ workspace_id: workspaceStore.currentWorkspace._id })
            .then(data => this.setData(data))
    }

    @action delete = (project) => {
        this.loading = true
        projects
        .deleteProject({
            workspace_id: workspaceStore.currentWorkspace._id, 
            project_id: project._id
        })
        .then(this.getProjects)        
    }

}

const projectStore = new ProjectStore();
export default projectStore
