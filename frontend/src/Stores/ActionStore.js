import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import workspaceStore from './WorkspaceStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import pipelineStore from './PipelineStore';


class ActionStore {

    @observable currentAction;
	@observable actions = [];


	@action setData({actions}) {
		this.actions = actions
    }
    
    @action selectAction(action){
        this.currentAction = action
        routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/actions/${action.name}`)
    }

    
    getActions(){
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/actions/all`,{
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

    delete(action){
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/actions`,{
            method:'DELETE',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id,
                action_id:action._id
            })
        }).then(() => this.getActions() )

    }

}

const actionStore = new ActionStore();
export default actionStore
