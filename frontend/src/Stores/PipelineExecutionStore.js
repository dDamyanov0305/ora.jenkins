import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import workspaceStore from './WorkspaceStore';
import actionStore from './ActionStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import pipelineStore from './PipelineStore';

class PipelineExecutionStore {

    @observable pipeline_executions = [];
    @observable selected_execution;
    @observable action_executions = []


	@action setPipelineExecutions({pipeline_executions}) {
        console.log(pipeline_executions)
		this.pipeline_executions = pipeline_executions;
    }
    
    @action setActionExecutions({action_executions}) {
		this.action_executions = action_executions;
    }
    
    @action selectExecution(execution){
        this.selected_execution = execution
        this.getActionExecutions()
        routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/executions/${execution._id}`)
    }

    rerun = (execution) => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/run`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                pipeline_id:execution.pipeline_id,
                comment:execution.comment,
                revision:execution.revision,
                trigger_mode:"MANUAL"
            })
        })
    }

    getPipelineExecutions = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/executions`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({workspace_id:workspaceStore.currentWorkspace._id, pipeline_id:pipelineStore.currentPipeline._id})
        })
        .then(res => res.json())
        .then(data => this.setPipelineExecutions(data))
    }

    getActionExecutions = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/execution_details`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({workspace_id:workspaceStore.currentWorkspace._id, pipeline_id:pipelineStore.currentPipeline._id, pipeline_execution_id: this.selected_execution._id})
        })
        .then(res => res.json())
        .then(data => this.setActionExecutions(data))
    }

    getLatestExecutions = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/executions/all`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({workspace_id:workspaceStore.currentWorkspace._id})
        })
        .then(res => res.json())
        .then(data => this.setPipelineExecutions(data))

        routeStore.push('/executions/latest')
    }


}

const pipelineExecutionStore = new PipelineExecutionStore();
export default pipelineExecutionStore
