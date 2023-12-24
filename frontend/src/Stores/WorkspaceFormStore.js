import { observable, action } from "mobx";
import user from './UserStore'
import { integrationTypes } from "../constants"
import { workspaces, ora } from '../Services/Server'
import { ORA_PROVIDER } from "../Providers/Providers"


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
        if (this.toInvite.includes(email)) {
            this.toInvite = this.toInvite.filter(invitedEmail => invitedEmail !== email)
        }
        else {
            this.toInvite.push(email)
        }
    } 

    @action selectAll = () => {
        this.toInvite = [ ...this.toInvite, ...this.members.map(member => member.email) ]
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

        const { name } = this
        workspaces
        .createWorkspace({ name })
        .then(data => { 
            this.workspace = data.workspace
            this.step = 2
        })
        .catch(error => this.errorText = error.message)
    }

    @action getOrganizationMembers = () => {
        const isIntegrated = user.integrations.find(integration => integration.type === integrationTypes.ORA)
            
        if (!isIntegrated)
            ORA_PROVIDER.authorize()
        
        else
            this._getOrganizations()
        
    }

    @action _getOrganizations = () =>{
        ora
        .getOrganizations()
        .then(data => {
            this.organizations = data.organizations
            this.showModal = true
        })
        .catch(error => this.errorText = error.message)
    }

    @action _getMembers = () => {
        const { organization_id } = this

        ora
        .getOrganizationMembers({ organization_id })
        .then(data => this.members = data.members.developers)
        .catch(error => this.errorText = error.message)
    }

    @action sendInvite = () => {
        const { email, workspace } = this

        if(this.invited.includes(email)) 
            return

        workspaces
        .inviteOne({ email, workspace_id: workspace._id })
        .then(() => {
            this.invited.push(email)
            this.email = ''
        })
        .catch(error => this.errorText = error.message)
    }

    @action sendInvites = () => {
        const { toInvite: emails } = this

        workspaces
        .inviteMany({ emails, workspace_id: workspace._id })
        .then(() => {
            this.invited = [...this.invited, ...emails]
        })
        .catch(error => this.errorText = error.message)
    }
    
}


const workspaceFormStore = new WorkspaceFormStore()
export default workspaceFormStore