import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import workspaceStore from './WorkspaceStore';
import actionStore from './ActionStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import runStore from './RunPipelineStore';
import pipelineExecutionStore from './PipelineExecutionStore';
import runPipelineStore from './RunPipelineStore';

class PipelineStore {

	@observable currentPipeline;
    @observable pipelines = [];
    @observable commits = [];
    @observable comment = '';


	@action setData({pipelines}) {
		this.pipelines = pipelines;
	}

    @action setPipeline(pipeline){
        this.currentPipeline = pipeline
        actionStore.getActions(this.currentPipeline._id)
        pipelineExecutionStore.getPipelineExecutions()
    }

	@action selectPipeline(pipeline){
        this.currentPipeline = pipeline
        actionStore.getActions(this.currentPipeline._id)
        pipelineExecutionStore.getPipelineExecutions()
        routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${this.currentPipeline.name}`)
    }
    
    @action getPipelines = async() => {
        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/all`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                project_id:projectStore.currentProject?._id
            })
        })

        if(result.status >= 200 && result.status<300){
            const data = await result.json()
            this.setData(data)
        }
    }

    preRun = (pipeline) => {
        runStore.getCommits(pipeline)
        routeStore.push('/pipelines/run')
    }

    @action getCommits = async(pipeline) => {
        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/github/commits`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                project_id:projectStore.currentProject._id,
                branch: pipeline.branch
            })
        })

        if(result.status >= 200 && result.status<300){
            const data = await result.json()
            this.commits = data.commits
        }
    }

    
    run = (pipeline) => {
        
        runPipelineStore.setPipeline(pipeline)
        runPipelineStore.setPipeline(pipeline)
        
    }

    delete = async(pipeline) => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines`,{
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
