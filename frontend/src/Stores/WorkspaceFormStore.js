import { observable, action } from "mobx";
import user from './UserStore'
import routeStore from './RouteStore'
import storage from '../Services/customLocalStorage'

class WorkspaceFormStore{
    @observable invited = [];
    @observable name = ''
    @observable email = ''
    @observable organizationMembers = []
    @observable step = 1
    @observable workspace = {}
    @observable errorText = ''


    @action handleSubmit = async(e) => {
        e.preventDefault()
        
        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/workspaces/create`,{
            method:'POST',
            headers:{
                "Content-type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body:JSON.stringify({name:this.name})
        })

        const data = await result.json()
        
        if(result.status >= 200 && result.status < 300 ){
            this.step = 2
            this.workspace = data.workspace
        }
        else
        {
            this.errorText = data.error
        }
    }

    @action handleNameChange = (e) => {
        this.name = e.target.value
    }

    @action handleEmailChange = (e) => {
        this.email = e.target.value
    }

    @action getOrganizationMembers = () => {
        const isIntegrated = user.integrations.find(integration => integration.type === "ORA")
            
        if(!isIntegrated)
        {
            storage.set("return_uri",routeStore.pathname)
            window.open(`https://ora.pm/authorize?client_id=${process.env.REACT_APP_ORA_OAUTH_CLIENT_ID}&redirect_uri=http://localhost:3000/ora/oauth/callback&response_type=code`,'_blank','height=570,width=520')
        }
        else
        {
            this._getOrganizationMembers()
        }
    }

    @action _getOrganizationMembers = () =>{
        
    }
    
}

const workspaceFormStore = new WorkspaceFormStore()
export default workspaceFormStore