import { observable, action } from 'mobx'
import React from 'react'
import user from '../Stores/UserStore'
import routeStore from './RouteStore'
import projectStore from './ProjectStore';
import workspaceStore from './WorkspaceStore';
import storage from '../Services/perfectLocalStorage'


class ProviderStore {

	providers = [
        {
            name: 'GITHUB',
            integrationURL: `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID}&scope=repo user admin:repo_hook`
        },
        {
            name: 'GITLAB',
            integrationURL: `https://gitlab.com/oauth/authorize?client_id=${process.env.REACT_APP_GITLAB_OAUTH_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code&scope=api read_user read_api read_repository write_repository email`,
        },
        {
            name: 'BITBUCKET',
            integrationURL: `https://bitbucket.org/site/oauth2/authorize?client_id=${process.env.REACT_APP_BITBUCKET_OAUTH_CLIENT_ID}&response_type=code`,
        }
    ]

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

    @action init(){
        const integrations = user.integrations.map(i => i.type)
        const integrated_provider = this.providers.find(provider => integrations.includes(provider.name))
        
        if(integrated_provider)
            this.selectProvider(integrated_provider)
        else
            this.selectProvider(this.providers[0])
    }


    @action selectProvider(provider){
        this.currentProvider = provider
        this.step = 2

        const isIntegrated = user.integrations.find(integration => integration.type === this.currentProvider.name)
        if(!isIntegrated)
        {
            storage.set("return_uri","/project/create")
            window.open(this.currentProvider.integrationURL,'_blank','height=570,width=520')
        }
        else{
            this.getRepos()
        }
    }

    @action async getRepos(){

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/${this.currentProvider.name.toLowerCase()}/repos`,{
            headers:{
                "Content-type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        })

        const data = await result.json()

        if(result.status >= 200 && result.status < 300){
            this.personal_repos = data.personal_repos
            this.organization_repos = data.organization_repos || []
        }
        else{
            this.errorText = data.error
        }
        
    }

    @action async selectRepo({name, full_name: repository}){

        console.log(name,repository,this.currentProvider.name)

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/projects/create`,{
            method:'POST',
            headers:{
                "Content-type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body:JSON.stringify({
                workspace_id:workspaceStore.currentWorkspace._id, 
                name, 
                repository, 
                hosting_provider:this.currentProvider.name
            })
        })

        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            projectStore.getProjects()
            routeStore.push("/projects")
        }
       
    }

}

const providerStore = new ProviderStore();
export default providerStore
