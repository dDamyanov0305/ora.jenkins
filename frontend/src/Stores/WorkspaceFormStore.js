import { observable, action } from "mobx";
import user from './UserStore'
import routeStore from './RouteStore'
import storage from '../Services/perfectLocalStorage'

class WorkspaceFormStore{
    @observable name = ''
    @observable email = ''
    @observable step = 2
    @observable workspace = {}
    @observable errorText = ''
    @observable invited = [];
    @observable organization_id = ''
    @observable toInvite = [];
    @observable organizations = []
    @observable members = []
    @observable showModal = false

   
    @action selectWorkspace = (workspace) => {
        this.workspace = workspace
    }

    @action addToInvite = email => {
        if(this.toInvite.includes(email)){
            this.toInvite = this.toInvite.filter(invitedEmail => invitedEmail !== email)
        }else{
            this.toInvite.push(email)
        }
    } 

    @action selectAll = () => {
        this.toInvite = [...this.toInvite, ...(this.members.map(member=>member.email))]
    }

    @action handleNameChange = (e) => {
        this.name = e.target.value
    }

    @action handleEmailChange = (e) => {
        this.email = e.target.value
    }

    @action handleChange = (e) => {
        this[e.target.name] = e.target.value
    }

    @action openModal = () => {
        this.showModal = true
    }

    @action closeModal = () => {
        this.showModal = false
    }

    @action selectOrganization = (id) => {
        this.organization_id = id
        this._getMembers()
    }

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
        else{
            this.errorText = data.error
        }
    }

    @action getOrganizationMembers = () => {
        const isIntegrated = user.integrations.find(integration => integration.type === "ORA")
        console.log("is integrated:", isIntegrated)
            
        if(!isIntegrated){
            storage.set("return_uri",'/workspace/create')
            window.open(`https://ora.pm/authorize?client_id=${process.env.REACT_APP_ORA_OAUTH_CLIENT_ID}&redirect_uri=http://localhost:3000/ora/oauth/callback&response_type=code`,'_blank','height=570,width=520')
        }
        else{
            this._getOrganizations()
        }
    }

    @action _getOrganizations = async() =>{

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ora/organizations`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            }
        })

        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            console.log(data.organizations)
            this.organizations = data.organizations
            this.showModal = true
        }
    }

    @action _getMembers = async() => {

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ora/organization_members`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({organization_id:this.organization_id})

        })

        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            console.log(data.members)
            this.members = data.members.developers
        }
    }

    @action sendInvite = async() => {

        const email = this.email

        if(!this.invited.includes(email)){

            const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/workspaces/invite_one`,{
                method:'POST',
                headers:{
                    'Authorization':`Bearer ${user.token}`,
                    'Content-type':'application/json'
                },
                body:JSON.stringify({
                    workspace_id: this.workspace._id,
                    email
                })
            })
    
            const data = await result.json()
    
            if(result.status < 200 || result.status >= 300){
                this.errorText = data.error
            }
            else{
                this.invited.push(email)
                this.email = ''
            }
        }

    }

    @action sendInvites = async() => {

        const emails = this.toInvite

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/workspaces/invite_many`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                workspace_id: this.workspace._id,       
                emails
            })
        })

        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            this.invited = [...this.invited, ...emails]
        }
    }
    
}

const workspaceFormStore = new WorkspaceFormStore()
export default workspaceFormStore