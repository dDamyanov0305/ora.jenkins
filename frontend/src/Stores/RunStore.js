import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import workspaceStore from './WorkspaceStore';
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'

class RunStore {

	@observable data = {
        comment:'',
        revision:'',
    };

    @observable pipeline;
    @observable commits;


	@action setData(pipeline) {
		this.pipeline = pipeline;
    }
    
    @action setCommits({commits}) {
		this.commits = commits;
	}

    
    @action getCommits(){
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/github/commits`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                project_id:projectStore.currentProject._id,
                branch: pipelineStore.currentPipeline.branch
            })
        })
        .then(res => res.json())
        .then(data => this.setCommits(data))
    }

    preRun = (pipeline) => {
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


}

const runStore = new RunStore();
export default runStore
