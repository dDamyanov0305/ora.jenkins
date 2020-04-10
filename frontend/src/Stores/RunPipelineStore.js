import { observable, action } from 'mobx';
import user from './UserStore'
import workspaceStore from './WorkspaceStore';
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import projectStore from './ProjectStore'

class RunPipelineStore {

	@observable data = {
        comment:'',
        revision:'',
    };

    @observable pipeline = null;
    @observable commits = [];
    @observable showModal = false;


	@action setPipeline(pipeline) {
        this.pipeline = pipeline;
        this.getCommits();
        this.showModal = true;
    }
    
    @action setCommits({commits}) {
        console.log(commits)
		this.commits = commits
    }
    
    @action closeModal = () => {
        this.showModal = false
    }

    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.value
    }

    
    @action getCommits = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/github/repo/commits`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                project_id:projectStore.currentProject._id,
                branch: this.pipeline.branch
            })
        })
        .then(res => res.json())
        .then(data => this.setCommits(data))
    }

    run = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/run`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                pipeline_id:this.pipeline._id,
                comment:this.data.comment,
                revision:this.data.revision,
                triggerMode:"MANUAL"
            })
        })

        this.closeModal()
    }


}

const runPipelineStore = new RunPipelineStore();
export default runPipelineStore
