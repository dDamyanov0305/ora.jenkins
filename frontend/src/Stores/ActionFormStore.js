import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';
import projectStore from './ProjectStore';
import actionStore from './ActionStore';
import { actions, ora } from '../Services/Server';
import { ORA_PROVIDER } from '../Providers/Providers';
import { integrationTypes } from '../constants';


class ActionFormStore {

    default_data = {
        name:'',
        shell_script:false,
        execute_script:'',
        execute_commands:'',
        prev_action_id: '',
        next:'',
        variables: [],
        var_key: '',
        var_val: '',
        task_linkage:false,
        ora_task_id:null,
        ora_project_id:null,
        ora_list_id_on_success:null,
        ora_list_id_on_failure:null
    }

    @observable data = this.default_data
    @observable files = []
    @observable errorText = ''
    @observable modalError = ''
    @observable projects = []
    @observable tasks = []
    @observable lists = []
    @observable showModal = false

    @action openModal = (e) => {
        e.preventDefault()
        this.showModal = true
    }

    @action closeModal = (e) => {
        e.preventDefault()
        this.showModal = false
    }

    // @action validateForm = () => {
    //     if(this.data.task_linkage){
    //         if(!this.data.ora_project_id){ 
    //             this.modalError = 1
    //         }
    //         else if(!this.data.ora_task_id){ 
    //             this.modalError = 2
    //         }
    //         else if(!this.data.ora_list_id_on_success){ 
    //             this.modalError = 3
    //         }
    //         else if(!this.data.ora_list_id_on_failure){ 
    //             this.modalError = 4
    //         }
    //         else{
    //             this.modalError = 0
    //             this.showModal = false
    //         }

    //         if(this.modalError){
    //             this.showModal = true
    //         }
    //     }

    //     if(!this.data.name){
    //         this.formError = 1
    //     }
    //     else if(this.data.shell_script && !this.data.execute_script){
    //         this.formError = 3
    //     }
    //     else if(!this.data.shell_script && !this.data.execute_commands){
    //         this.formError = 3
    //     }
    //     else{
    //         this.formError = 0
    //     }

    //     if(this.formError){
    //         this.errorText = 'Fill all required fields'
    //         return
    //     }else{
    //         this.errorText = ''
    //     }
    // }

    @action submit = async (e) => {
        e.preventDefault()

        actions
        .createAction({
            ...this.data,
            pipeline_id: pipelineStore.currentPipeline._id,
            workspace_id: workspaceStore.currentWorkspace._id
        }, this.files)
        .then(() => {
            this.data = this.default_data
            actionStore.getActions()
            routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/actions`)
        })
        .catch(error => this.errorText = error.message)                 
    }

    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }

    @action updateKey = (e, index) => {
        this.data.variables[index] = {
            key:e.target.value,
            value: this.data.variables[index].val
        }
    }

    @action updateVal = (e, index) => {
        this.data.variables[index] = {
            key: this.data.variables[index].key,
            value: e.target.value
        }
    }

    @action handleFile = (e) => {
        this.files = e.target.files
    }

    @action setPrevAction = (action_id) => {
        this.data.prev_action_id = action_id || null
    }

    @action addVariable = (e) => {
        e.preventDefault()
        this.data.variables.push({key: this.data.var_key, value: this.data.var_val})
        this.data.var_key = ''
        this.data.var_val = ''
    }

    @action editVariable = (key, value) => {
        this.data.var_key = key
        this.data.var_val = value
    }

    @action checkTaskLinkage = (e) => {

        this.data.task_linkage = e.target.checked

        if (e.target.checked) {
            const isIntegrated =  user.integrations.find(integration => integration.type === integrationTypes.ORA)
            
            if (!isIntegrated) {
                ORA_PROVIDER.authorize()          
            }
            else {
                this.showModal = true
                this.fetchProjects()
            }
        }
        else {
            this.data.ora_project_id = null
            this.data.ora_task_id = null
            this.data.ora_list_id_on_success = null
            this.data.ora_list_id_on_failure = null
        }
    }

    @action fetchProjects = () => {
        ora
        .getProjects()
        .then(({ projects }) => this.projects = projects)
        .catch(({ message }) => this.errorText = message)
    }

    @action selectProject = (project) => {
        this.data.ora_project_id = project.id

        ora
        .getTasksAndLists({ project_id: project.id })
        .then(({ tasks, lists }) => {
            this.tasks = tasks
            this.lists = lists
        })
        .catch(({ message }) => this.errorText = message)
    }

    @action selectTask = (task) => {
        this.data.ora_task_id = task.id
    }

    @action selectOnSuccessList = (list) => {
        this.data.ora_list_id_on_success = list.id
    }

    @action selectOnFailureList = (list) => {
        this.data.ora_list_id_on_failure = list.id
    }

    @action setPos = (prev, next) => {
        this.data.prev_action_id = prev
        this.data.next = next
    }


}

const actionFormStore = new ActionFormStore();
export default actionFormStore
