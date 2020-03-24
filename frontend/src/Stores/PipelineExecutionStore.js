import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import workspaceStore from './WorkspaceStore';
import actionStore from './ActionStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import pipelineStore from './PipelineStore';

class PipelineExecutionStore {

    @observable executions = [];
    @observable execution;


	@action setData({executions}) {
		console.log(executions)
		this.executions = executions;
	}

    @action getExecutions(){
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/executions`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({workspace_id:workspaceStore.currentWorkspace._id, pipeline_id:pipelineStore.currentPipeline._id})
        })
        .then(res => res.json())
        .then(data => this.setData(data))
    }

    @action selectExecution(execution){
        this.execution = execution
        routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/executions/${execution._id}`)
    }


}

const pipelineExecutionStore = new PipelineExecutionStore();
export default pipelineExecutionStore
