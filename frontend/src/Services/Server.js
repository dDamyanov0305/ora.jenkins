import storage from '../Services/perfectLocalStorage';


function schema(validationRules = { required: [], optional: [] }) {
    return function (target, key, descriptor) {
        const originalMethod = descriptor.value;
  
        descriptor.value = function (...args) {

        for (const arg of validationRules.required) {
            if (!(arg in args[0])) {
                throw new Error(`Missing required argument: ${arg}`);
            }
        }
  
        for (const arg of validationRules.optional) {
            if (args[0][arg] === undefined) {
                console.warn(`Optional argument not provided: ${arg}`);
            }
        }
  
        return originalMethod.apply(this, args);
      };
  
      return descriptor;
    };
}


class Server {
    constructor(baseURL, getToken) {
        this.baseURL = baseURL
        this.token = getToken
    }

    setToken = (getToken) => {
        this.getToken = getToken
    }

    headers = () => {
        return {
            "Content-type": "application/json",
            "Authorization": `Bearer ${this.getToken()}`
        }
    }

    replacePathParams = (path, params) => {
        const replacedPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, param) => {
          return params[param] || `:${param}`;
        });
      
        return replacedPath;
    }

    addQueryParams = (path, params) => {
        query = Object.keys(params)
                .map(param => `${param}=${params[param]}`)
                .join("&")

        return [path, query].join("?")
    }

    request = (path, { pathParams, queryParams, extraHeaders, body, method, files }) => {
        parametrizedPath = this.replacePathParams(path, pathParams)
        fullPath = this.addQueryParams(parametrizedPath, queryParams)
        fullEndpoint = [this.baseURL, fullPath].join("")
        headers = { ...this.headers(), ...extraHeaders }

        if (files) {
            const formData = new FormData()
            const jsonBlob = new Blob([JSON.stringify(body)], { type: 'application/json' });
            formData.append('json', jsonBlob);
            formData.append('files[]', files)
            payload = formData
        }
        else {
            payload = JSON.stringify(body)
        }

        respPromise = fetch(fullEndpoint, {
            method,
            headers,
            body: payload
        })

        return respPromise.then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for method ${method} to ${fullEndpoint}! Status: ${response.status}`);
            }
            return response.json();
        })
    }

}

class Users {
    constructor(server) {
        this.server = server
    }

    getMe = () => this.server.request("/users/me")
    logout = () => this.server.request("/users/me/logout")
    login = (body) => this.server.request("/users/login", { body, method: "POST" })
    create = (body) => this.server.request("/users/create", { body, method: "POST" })

}

class Workspaces {
    constructor(server) {
        this.server = server
    }

    getWorkspaces = () => this.server.request("/workspaces/all")

    @schema({ required: ['name'] })
    createWorkspace = (body) => this.server.request("/workspaces/create", { body, method: "POST" })
    
    @schema({ required: ['email', 'workspace_id'] })
    inviteOne = (body) => this.server.request("/workspaces/invite_one", { body, method: "POST" })
    
    @schema({ required: ['emails', 'workspace_id'] })
    inviteMany = (body) => this.server.request("/workspaces/invite_many", { body, method: "POST" })

}

class Projects {
    constructor(server) {
        this.server = server
    }

    @schema({ required: ['workspace_id', 'hosting_provider', 'name', 'repository'] })
    createProject = (body) => this.server.request("/projects/create", { body, method: "POST" })
    
    @schema({ required: ['workspace_id'] })
    getAll = (body) => this.server.request("/projects/all", { body, method: "POST" })
    
    @schema({ required: ['project_id', 'workspace_id'] })
    deleteProject = (body) => this.server.request("/projects", { body, method: "DELETE" })
}

class Ora {
    constructor(server) {
        this.server = server
    }

    getOrganizations = () => this.server.request("/ora/organizations")

    getProjects = () => this.server.request("/ora/projects")
    
    @schema({ required: ['organization_id'] })
    getOrganizationMembers = (body) => this.server.request("/ora/organization/members", { body, method: "POST" })

    @schema({ required: ['project_id'] })
    getTasksAndLists = (body) => this.server.request("/ora/tasks_and_lists", { body, method: "POST" })
}

class Github {
    constructor(server) {
        this.server = server
    }

    getRepos = () => this.server.request("/github/repos")

    @schema({ required: ['project_id', 'workspace_id', 'branch'] })
    getRepoCommits = (body) => this.server.request("/github/repo/commits", { body, method: "POST" })

    @schema({ required: ['code'] })
    oauth = (queryParams) => this.server.request("/github/oauth", { queryParams })

    @schema({ required: ['project_id', 'workspace_id'] })
    getRepoBranches = (body) => this.server.request("/github/repo/branches", { body, method: "POST" })

}

class Gitlab {
    constructor(server) {
        this.server = server
    }

    getRepos = () => this.server.request("/gitlab/repos")

    @schema({ required: ['project_id', 'workspace_id', 'branch'] })
    getRepoCommits = (body) => this.server.request("/gitlab/repo/commits", { body, method: "POST" })

    @schema({ required: ['code'] })
    oauth = (queryParams) => this.server.request("/gitlab/oauth", { queryParams })

    @schema({ required: ['project_id', 'workspace_id'] })
    getRepoBranches = (body) => this.server.request("/github/repo/branches", { body, method: "POST" })

}

class Bitbucket {
    constructor(server) {
        this.server = server
    }

    getRepos = () => this.server.request("/bitbucket/repos")

    @schema({ required: ['project_id', 'workspace_id', 'branch'] })
    getRepoCommits = (body) => this.server.request("/bitbucket/repo/commits", { body, method: "POST" })

    @schema({ required: ['code'] })
    oauth = (queryParams) => this.server.request("/bitbucket/oauth", { queryParams })

    @schema({ required: ['project_id', 'workspace_id'] })
    getRepoBranches = (body) => this.server.request("/github/repo/branches", { body, method: "POST" })

}

class Pipelines {
    constructor(server) {
        this.server = server
    }

    @schema({ required: ['workspace_id', 'pipeline_id', 'comment', 'revision', 'trigger_mode'] })
    manualRun = (body) => this.server.request("/pipelines/run", { body, method: "POST" })

    @schema({ required: ['workspace_id', 'project_id'] })
    getAll = (body) => this.server.request("/pipelines/all", { body, method: "POST" })

    @schema({ required: ['workspace_id', 'project_id'] })
    deletePipeline = (body) => this.server.request("/pipelines", { body, method: "DELETE" })

    @schema({ required: ['workspace_id', 'project_id', 'name', 'trigger_mode'] })
    createPipeline = (body) => this.server.request("/pipelines/create", { body, method: "POST" })

    @schema({ required: ['workspace_id', 'pipeline_id'] })
    getExecutions = (body) => this.server.request("/pipelines/executions", { body, method: "POST" })

    @schema({ required: ['workspace_id', 'pipeline_id', 'pipeline_execution_id'] })
    getExecutionDetails = (body) => this.server.request("/pipelines/execution_details", { body, method: "POST" })

}

class Actions {
    constructor(server) {
        this.server = server
    }

    @schema({ required: ['workspace_id', 'pipeline_id'] })
    getAll = (body) => this.server.request("/actions/all", { body, method: "POST" })
    
    @schema({ required: ['workspace_id', 'action_id'] })
    deleteAction = (body) => this.server.request("/actions", { body, method: "DELETE" })

    createAction = (body, files) => this.server.request("/actions/create", { body, files, method: "POST" })
}

class Executions {
    constructor(server) {
        this.server = server
    }

    @schema({ required: ['workspace_id'] })
    getAll = (body) => this.server.request("/executions/all", { body, method: "POST" })
    
}


const server = new Server(process.env.REACT_APP_SERVER_ADDRESS, () => storage.get('ora.ci_token'))
const users = new Users(server)
const workspaces = new Workspaces(server)
const projects = new Projects(server)
const pipelines = new Pipelines(server)
const actions = new Actions(server)
const executions = new Executions(server)
const ora = new Ora(server)
const github = new Github(server)
const gitlab = new Gitlab(server)
const bitbucket = new Bitbucket(server)

export { users, workspaces, ora, pipelines, github, gitlab, bitbucket, projects, executions, actions }