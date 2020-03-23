import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import workspaceStore from './WorkspaceStore';
import actionStore from './ActionStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'
import pipelineStore from './PipelineStore';

class PipelineExecutionStore {

	@observable executions = [];


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


}

const pipelineExecutionStore = new PipelineExecutionStore();
export default pipelineExecutionStore
