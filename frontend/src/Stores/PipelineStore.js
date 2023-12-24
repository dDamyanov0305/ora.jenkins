import { observable, action } from 'mobx';
import workspaceStore from './WorkspaceStore';
import actionStore from './ActionStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import runStore from './RunPipelineStore';
import pipelineExecutionStore from './PipelineExecutionStore';
import runPipelineStore from './RunPipelineStore';
import { pipelines } from '../Services/Server';


class PipelineStore {

	@observable currentPipeline;
    @observable pipelines = [];
    @observable commits = [];
    @observable comment = '';

	@action setData = ({pipelines}) => {
		this.pipelines = pipelines;
	}

    @action setPipeline = (pipeline) => {
        this.currentPipeline = pipeline
        actionStore.getActions(this.currentPipeline._id)
        pipelineExecutionStore.getPipelineExecutions()
    }

	@action selectPipeline = (pipeline) => {
        this.currentPipeline = pipeline
        actionStore.getActions(this.currentPipeline._id)
        pipelineExecutionStore.getPipelineExecutions()
        routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${this.currentPipeline.name}`)
    }
    
    @action getPipelines = () => {
        pipelines.getAll({
            workspace_id: workspaceStore.currentWorkspace._id, 
            project_id: projectStore.currentProject?._id
        }).then(data => this.setData(data))
    }

    preRun = () => {
        runStore.getCommits()
        routeStore.push('/pipelines/run')
    }

    run = (pipeline) => {
        runPipelineStore.setPipeline(pipeline)
    }

    delete = (pipeline) => {
        pipelines
        .deletePipeline({
            workspace_id:workspaceStore.currentWorkspace._id, 
            pipeline_id:pipeline._id
        })
        .then(this.getPipelines)    
    }

}

const pipelineStore = new PipelineStore();
export default pipelineStore
