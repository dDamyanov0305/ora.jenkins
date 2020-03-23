import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';
import projectStore from './ProjectStore';


class PipelineFormStore {

    default_data = {
        name:'',
        trigger_mode:'',
        branch:'master',
        emailing:false,
        cron_date:'* * * * *',
        email_time:'ON_EVERY_EXECUTION',
        push_image:false,
        docker_user:'',
        docker_password:'',
        docker_image_tag:'',
        docker_repository:''
    }

	@observable data = this.default_data

    @observable branches = []
    @observable errorText = ''
    
    submit = async (e) => {
        e.preventDefault()

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/create`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body: JSON.stringify({
                ...this.data, 
                project_id:projectStore.currentProject._id, 
                workspace_id:workspaceStore.currentWorkspace._id
            })
        })
        
        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            this.data = this.default_data
            pipelineStore.getPipelines()
            pipelineStore.selectPipeline(data.pipeline)
            routeStore.push(`/project/${projectStore.currentProject.name}/pipelines`)
        }
                                
    }


    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }

    @action getBranches = async () => {
        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/github/repo/branches`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body: JSON.stringify({project_id: projectStore.currentProject._id})
        })
        
        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            this.branches = data.branches
        }
    }


}

const pipelineFormStore = new PipelineFormStore();
export default pipelineFormStore
