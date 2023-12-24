import { observable, action } from 'mobx';
import workspaceStore from './WorkspaceStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import pipelineStore from './PipelineStore';
import { pipelines, executions } from '../Services/Server';
import { triggerModes } from '../constants';


class PipelineExecutionStore {

    @observable pipeline_executions = [];
    @observable selected_execution;
    @observable action_executions = []
    @observable showModal = false

	@action setPipelineExecutions = ({ pipeline_executions }) => {
        console.log(pipeline_executions)
		this.pipeline_executions = pipeline_executions;
    }
    
    @action setActionExecutions = ({action_executions}) => {
        console.log(action_executions)
		this.action_executions = action_executions;
    }
    
    @action selectExecution = (execution) => {
        this.selected_execution = execution
        this.getActionExecutions()
        this.showModal = true
        //routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/executions/${execution._id}`)
    }

    @action closeModal = () => {
        this.showModal = false
    }

    rerun = (execution) => {
        pipelines.manualRun({
            workspace_id: workspaceStore.currentWorkspace._id, 
            pipeline_id: execution.pipeline_id,
            comment: execution.comment,
            revision: execution.revision,
            trigger_mode: triggerModes.MANUAL
        })
    }

    getPipelineExecutions = () => {
        pipelines
        .getExecutions({
            workspace_id: workspaceStore.currentWorkspace._id,
            pipeline_id: pipelineStore.currentPipeline._id
        })
        .then(data => this.setPipelineExecutions(data))
    }

    getActionExecutions = () => {
        pipelines
        .getExecutionDetails({
            workspace_id: workspaceStore.currentWorkspace._id, 
            pipeline_id: pipelineStore.currentPipeline._id,
            pipeline_execution_id: this.selected_execution._id
        })
        .then(data => this.setActionExecutions(data))
    }

    getLatestExecutions = () => {
        executions
        .getAll({workspace_id: workspaceStore.currentWorkspace._id})
        .then(data => {
            this.setPipelineExecutions(data)
            routeStore.push('/executions/latest')
        })
    }

}

const pipelineExecutionStore = new PipelineExecutionStore();
export default pipelineExecutionStore
