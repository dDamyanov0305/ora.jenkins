import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import workspaceStore from './WorkspaceStore';
import actionStore from './ActionStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import runStore from './RunStore';

class PipelineStore {

	@observable currentPipeline;
	@observable pipelines = [];


	@action setData({pipelines}) {
		console.log(pipelines)
		this.pipelines = pipelines;
	}

	@action selectPipeline(pipeline){
        this.currentPipeline = pipeline
        actionStore.getActions(this.currentPipeline._id)
        routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${this.currentPipeline.name}`)
    }
    
    @action getPipelines(){
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/all`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({workspace_id:workspaceStore.currentWorkspace._id, project_id:projectStore.currentProject._id})
        })
        .then(res => res.json())
        .then(data => this.setData(data))
    }

    preRun = (pipeline) => {
        runStore.getCommits(pipeline)
        routeStore.push('/pipelines/run')
    }

    run = (pipeline) => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/run`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                pipeline_id:pipeline._id,
                comment:"execution",
                triggerMode:"MANUAL"
            })
        })
        
    }

    delete = async(pipeline) => {
        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines`,{
            method:'DELETE',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                pipeline_id:pipeline._id
            })
        }).then(()=>this.getPipelines())        
    }


}

const pipelineStore = new PipelineStore();
export default pipelineStore
