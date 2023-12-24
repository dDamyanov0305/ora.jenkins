import { observable, action } from 'mobx'
import React from 'react'
import user from '../Stores/UserStore'
import routeStore from './RouteStore'
import projectStore from './ProjectStore';
import workspaceStore from './WorkspaceStore';
import { integrationTypes } from  '../constants'
import { projects } from '../Services/Server';
import providers from '../Providers/Providers';


class ProviderStore {

    @observable personal_repos = []
    @observable organization_repos = []
    @observable currentProvider = {}
    @observable step = 1
    @observable errorText = ''

    providersRef = React.createRef()

    @action openOptions = () => {
        this.providersRef.current.classList.toggle("show")
        this.providersRef.current.classList.toggle("shadow")
    }

    @action init = () => {
        const integratedProvider = user.integrations.find(({ type }) => providers[type])
        
        if(integratedProvider)
            this.selectProvider(integratedProvider)
        else
            this.selectProvider(providers[integrationTypes.GITHUB])
    }

    @action selectProvider = (providerType) => {
        this.currentProvider = providers[providerType]
        this.step = 2

        const isIntegrated = user.integrations.find(({ type }) => type === this.currentProvider.provider.name)
        
        if (!isIntegrated)
            this.currentProvider.provider.authorize()
        else
            this.getRepos()
    }

    @action getRepos = () => {
        this.currentProvider.api
        .getRepos()
        .then(data => {
            this.personal_repos = data.personal_repos
            this.organization_repos = data.organization_repos || []
        })
        .catch(error => this.errorText = error.message)
    }

    @action selectRepo = ({ name, full_name: repository }) => {
        projects
        .createProject({
            workspace_id: workspaceStore.currentWorkspace._id, 
            hosting_provider: this.currentProvider.provider.name,
            name, 
            repository
        })
        .then(() => {
            projectStore.getProjects()
            routeStore.push("/projects")
        })
        .catch(error => this.errorText = error.message)       
    }

}

const providerStore = new ProviderStore();
export default providerStore
