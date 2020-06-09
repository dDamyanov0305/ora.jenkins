import { observable, action } from 'mobx';
import React from 'react'
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
        workdir:'/',
        emailing:false,
        cron_date:'* * * * *',
        email_time:'ON_EVERY_EXECUTION',
        push_image:false,
        docker_user:'',
        docker_password:'',
        docker_image_tag:'',
        docker_repository:''
    }

    branchesContainerRef = React.createRef()
    emailingRef = React.createRef()

	@observable data = this.default_data
    @observable branches = []
    @observable errorText = ''
    @observable showModal = false
    @observable project = null
    @observable allowValue = {};

    @action openModal = () => {
        this.showModal = true
    }

    @action closeModal = () => {
        this.showModal = false
    }

    @action showBranches = () =>{
        this.branchesContainerRef.current.classList.toggle("show")
    }

    @action showEmailTimes = (e) =>{
        e.stopPropagation()
        this.emailingRef.current.classList.toggle("show")
    }

    
    @action setProject = (project) => {
        this.project = project
    }

    @action selectBranch = (branch) => {
        this.data.branch = branch
        this.branchesContainerRef.current.classList.toggle("show")
    }

    @action selectEmailTime = (time) => {
        this.data.email_time = time
        this.emailingRef.current.classList.toggle("show")
    }

    @action selectTriggerMode = (mode) => {
        this.data.trigger_mode = mode
        if(this.data.trigger_mode !== 'RECURRENT'){
            delete this.allowValue.cron_date
        }
    }

    @action go = () => {
        if(this.project){

            routeStore.push("/pipeline/create")
            pipelineFormStore.getBranches()
            this.closeModal()
            projectStore.setProject(this.project)
        }
    }
    
    @action submit = async (e) => {
        e.preventDefault()

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/pipelines/create`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body: JSON.stringify({
                ...this.data, 
                project_id:this.project._id, 
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
            routeStore.push(`/project/${this.project.name}/pipelines`)
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
            body: JSON.stringify({project_id:this.project._id})
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
