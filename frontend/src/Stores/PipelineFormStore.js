import { observable, action } from 'mobx'
import React from 'react'
import pipelineStore from './PipelineStore'
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore'
import projectStore from './ProjectStore'
import { triggerModes, triggerTimes } from '../constants'
import { pipelines } from '../Services/Server'
import providers from '../Providers/Providers'


class PipelineFormStore {

    default_data = {
        branch: 'master',
        trigger_mode: triggerModes.MANUAL,
        email_time: triggerTimes.ON_EVERY_EXECUTION,
        name: '',
        workdir: '/',
        emailing: false,
        cron_date: '* * * * *',
        push_image: false,
        docker_user: '',
        docker_password: '',
        docker_image_tag: '',
        docker_repository: ''
    }

    branchesContainerRef = React.createRef()
    emailingRef = React.createRef()

	@observable data = this.default_data
    @observable branches = []
    @observable errorText = ''
    @observable showModal = false
    @observable project = null
    @observable allowValue = {}

    @action openModal = () => {
        this.showModal = true
    }

    @action closeModal = () => {
        this.showModal = false
    }

    @action showBranches = () => {
        this.branchesContainerRef.current.classList.toggle("show")
    }

    @action showEmailTimes = (e) => {
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
        if(this.data.trigger_mode !== triggerModes.RECCURENTLY) {
            delete this.allowValue.cron_date
        }
    }

    @action go = () => {
        if(this.project) {
            routeStore.push("/pipeline/create")
            pipelineFormStore.getBranches()
            this.closeModal()
            projectStore.setProject(this.project)
        }
    }
    
    @action submit = (e) => {
        e.preventDefault()

        pipelines
        .createPipeline({
            ...this.data,
            project_id: this.project._id,
            workspace_id: workspaceStore.currentWorkspace._id
        })
        .then(data => {
            this.data = this.default_data
            pipelineStore.getPipelines()
            pipelineStore.selectPipeline(data.pipeline)
            routeStore.push(`/project/${this.project.name}/pipelines`)
        })
        .catch(error => this.errorText = error.message)                                
    }

    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }

    @action getBranches = () => {
        const provider = providers[projectStore.currentProject.hosting_provider]
        
        provider.api
        .getRepoBranches({
            workspace_id: workspaceStore.currentWorkspace._id, 
            project_id: this.project._id
        })
        .then(data => this.branches = data.branches)
        .catch(error => this.errorText = error.message)
    }

}


const pipelineFormStore = new PipelineFormStore()
export default pipelineFormStore
