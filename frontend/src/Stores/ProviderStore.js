import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import routeStore from './RouteStore'
import projectStore from './ProjectStore';
import workspaceStore from './WorkspaceStore';


class ProviderStore {

	providers = [
        {
            name: 'GITHUB',
            integrationURL: `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID}&scope=repo user admin:repo_hook`
        },
        {
            name: 'GITLAB',
            integrationURL: '',
        },
        {
            name: 'BITBUCKET',
            integrationURL: '',
        }
    ]

    @observable repos = []
    @observable currentProvider = ''
    @observable step = 1
    @observable errorText = ''

    @action selectProvider(provider){
        this.currentProvider = provider
        this.step = 2
        const isIntegrated = user.integrations.find(integration => integration.type === this.currentProvider.name)

        if(!isIntegrated){
            window.open(this.currentProvider.integrationURL,'_blank','height=570,width=520')
        }
        else{
            this.getRepos()
        }
    }

    @action async getRepos(){
        if(this.currentProvider.name === 'GITHUB'){

            const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/github/repos`,{
                headers:{
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                }
            })
    
            const data = await result.json()

            if(result.status >= 200 && result.status < 300){
                this.repos = data.repos
            }
            else{
                this.errorText = data.error
            }
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
            body:JSON.stringify({workspace_id:workspaceStore.currentWorkspace._id, name, repository, hosting_provider:this.currentProvider.name})
        })

        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            projectStore.getProjects()
            //projectStore.selectProject(data.projects)
            routeStore.push("/projects")
        }
       
    }

}

const providerStore = new ProviderStore();
export default providerStore
