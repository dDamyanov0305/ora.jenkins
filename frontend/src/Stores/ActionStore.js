import { observable, action } from 'mobx';
import workspaceStore from './WorkspaceStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import pipelineStore from './PipelineStore';
import { actions } from '../Services/Server';


class ActionStore {

    @observable currentAction;
	@observable actions = [];

	@action setData = ({ actions }) => {
		this.actions = actions
    }
    
    @action selectAction = (action) => {
        this.currentAction = action
        routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/actions/${action.name}`)
    }

    getActions = () => {
        actions
        .getAll({
            workspace_id: workspaceStore.currentWorkspace._id,
            pipeline_id: pipelineStore.currentPipeline._id
        })
        .then(data => this.setData(data))
    }

    delete(action){
        actions
        .deleteAction({
            workspace_id: workspaceStore.currentWorkspace._id,
            action_id: action._id
        })
        .then(this.getActions)
    }

}

const actionStore = new ActionStore();
export default actionStore
