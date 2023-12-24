import { observable, action } from 'mobx'
import React from 'react'
import workspaceStore from './WorkspaceStore'
import projectStore from './ProjectStore'
import { triggerModes } from '../constants'
import { pipelines } from '../Services/Server'
import providers from '../Providers/Providers'


class RunPipelineStore {

	@observable data = {
        comment: '',
        revision: {}
    }

    @observable pipeline = null
    @observable commits = []
    @observable showModal = false

    revisionRef = React.createRef()
    commitsRef = React.createRef()

    constructor() {
        document.addEventListener('click', this.closeCommits)
    }

	@action setPipeline(pipeline) {
        this.pipeline = pipeline
        this.getCommits()
        this.showModal = true
    }
    
    @action setCommits({commits}) {
        this.commits = commits
        this.data.revision = commits[0]
    }
    
    @action closeModal = () => {
        this.showModal = false
    }

    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.value
    }

    @action selectCommit = (commit) => {
        this.data.revision = commit
    }

    @action getCommits = () => {
        const provider = providers[projectStore.currentProject.hosting_provider]
        
        provider.api
        .getRepoCommits({
            workspace_id: workspaceStore.currentWorkspace._id, 
            project_id: projectStore.currentProject._id,
            branch: this.pipeline.branch
        })
        .then(data => this.setCommits(data))
    }

    run = () => {
        pipelines
        .manualRun({ 
            workspace_id: workspaceStore.currentWorkspace._id, 
            pipeline_id: this.pipeline._id,
            comment: this.data.comment,
            revision: this.data.revision,
            trigger_mode: triggerModes.MANUAL
        })
        .then(this.closeModal)
    }

    @action openCommits = (e) => {
        this.revisionRef.current.classList.toggle('shadow')
        this.commitsRef.current.classList.toggle('show')
    }

    @action closeCommits = (e) => {
        if (this.revisionRef.current) {
            this.revisionRef.current.classList.remove('shadow')
            this.commitsRef.current.classList.remove('show')
        }
    }

}


const runPipelineStore = new RunPipelineStore()
export default runPipelineStore
