import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import pipelineStore from './PipelineStore';
import routeStore from './RouteStore'
import workspaceStore from './WorkspaceStore';
import projectStore from './ProjectStore';
import actionStore from './ActionStore';


class ActionFormStore {

    default_data = {
        name:'',
        shell_script:false,
        execute_script:"",
        filename:"",
        execute_commands:'',
        prev_action_id: null,
        next:null,
        docker_image_name:'',
        docker_image_tag:'',
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
    @observable errorText = ''
    @observable projects = []
    @observable tasks = []
    @observable lists = []

    submit = async (e) => {
        e.preventDefault()

        let execute_commands = this.data.execute_commands.split('\n')

        const data = new FormData()

        if(this.data.prev_action_id){
            data.append('prev_action_id',this.data.prev_action_id)
        }

        if(this.data.next){
            data.append('next',this.data.next)
        }
        

        data.append('execute_script',this.data.execute_script)
        data.append('shell_script',this.data.shell_script)
        data.append('name',this.data.name)
        data.append('variables',JSON.stringify(this.data.variables))
        data.append('execute_commands',JSON.stringify(execute_commands))
        data.append('docker_image_name',this.data.docker_image_name)
        data.append('docker_image_tag',this.data.docker_image_tag)
        data.append('pipeline_id',pipelineStore.currentPipeline._id)
        data.append('workspace_id',workspaceStore.currentWorkspace._id)
        data.append('task_linkage',this.data.task_linkage)
        data.append('ora_task_id',this.data.ora_task_id)
        data.append('ora_project_id',this.data.ora_project_id)
        data.append('ora_list_id_on_success',this.data.ora_list_id_on_success)
        data.append('ora_list_id_on_failure',this.data.ora_list_id_on_failure)


        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/actions/test`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
            },
            body:data
        })
        
        const response_data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = response_data.error
        }
        else{
            this.data = this.default_data
            actionStore.getActions()
            routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}`)
        }
                                
    }

    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }

    @action handleFile = (e) => {
        console.log(e.target.files[0])
        this.data[e.target.name] = e.target.files[0]
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
        this.data[e.target.name] = e.target.checked
        if(e.target.checked)
        {
            const isIntegrated =  user.integrations.find(integration => integration.type === "ORA")
            
            if(!isIntegrated)
            {
                window.open(`https://ora.pm/authorize?client_id=${process.env.REACT_APP_ORA_OAUTH_CLIENT_ID}&redirect_uri=http://localhost:3000/ora/oauth/callback&response_type=code`,'_blank','height=570,width=520')
            }
            else
            {
                console.log('deba')
                this.getProjects()
            }
        }
    }

    @action getProjects = async() => 
    {
        const projectsRes = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ora/projects`,
        {
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            }
        })

        const data = await projectsRes.json()

        if(projectsRes.status < 200 || projectsRes.status >= 300)
        {
            this.errorText = data.error
        }
        else
        {
            console.log(data.projects)
            this.projects = data.projects
        }
    }

    @action selectProject = async(project) => 
    {
        this.data.ora_project_id = project.id

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ora/tasks_and_lists`,
        {
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`,
                'Content-type':'application/json'
            },
            body:JSON.stringify({
                project_id: project.id
            })
        })
        
        const data = await result.json()

        if(result.status < 200 || result.status >= 300)
        {
            this.errorText = data.error
        }
        else
        {
            this.tasks = data.tasks
            this.lists = data.lists
        }
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
        console.log(prev, next)
        this.data.prev_action_id = prev
        this.data.next = next
    }


}

const actionFormStore = new ActionFormStore();
export default actionFormStore
