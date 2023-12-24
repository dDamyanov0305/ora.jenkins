import { integrationTypes } from  '../constants'
import routeStore from '../Stores/RouteStore'
import { github, gitlab, bitbucket } from '../Services/Server';



class OauthProvider {
    constructor(name, oauthAuthorizeURL, query) {
        this.name = name
        this.oauthAuthorizeURL = oauthAuthorizeURL
        this.query = query
    }

    get integrationURL() {
        queryParams = Object.keys(this.query)
                            .map(param => `${param}=${this.query[param]}`)
                            .join("&")
        return `${this.oauthAuthorizeURL}?${queryParams}`
    }

    authorize = () => {
        storage.set("return_uri", routeStore.pathname)
        window.open(this.integrationURL, '_blank', 'height=570,width=520')
    }
    
}


const GITHUB_PROVIDER = new OauthProvider(
    integrationTypes.GITHUB,
    "https://github.com/login/oauth/authorize",
    {
        client_id: process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID,
        scope: "repo user admin:repo_hook"
    }
)


const GITLAB_PROVIDER = new OauthProvider(
    integrationTypes.GITLAB,
    "https://gitlab.com/oauth/authorize",
    {
        client_id: process.env.REACT_APP_GITLAB_OAUTH_CLIENT_ID,
        redirect_uri: [process.env.REACT_APP_CLIENT_ADDRESS, process.env.REACT_APP_GITLAB_REDIRECT_ENDPOINT].join("/"),
        response_type: "code",
        scope: "api read_user read_api read_repository email"
    }
)


const BITBUCKET_PROVIDER = new OauthProvider(
    integrationTypes.BITBUCKET,
    "https://bitbucket.org/site/oauth2/authorize",
    {
        client_id: process.env.REACT_APP_BITBUCKET_OAUTH_CLIENT_ID,
        response_type: "code",
    }
)

const ORA_PROVIDER = new OauthProvider(
    integrationTypes.ORA,
    "https://ora.pm/authorize",
    {
        client_id: process.env.REACT_APP_ORA_OAUTH_CLIENT_ID,
        redirect_uri: [process.env.REACT_APP_CLIENT_ADDRESS, process.env.REACT_APP_ORA_REDIRECT_ENDPOINT].join("/"),
        response_type: "code",
    }
)

const providers = {
    [integrationTypes.GITHUB]: { provider: GITHUB_PROVIDER, api: github },
    [integrationTypes.GITLAB]: { provider: GITLAB_PROVIDER, api: gitlab },
    [integrationTypes.BITBUCKET]: { provider: BITBUCKET_PROVIDER, api: bitbucket }
}

export { GITHUB_PROVIDER, GITLAB_PROVIDER, BITBUCKET_PROVIDER, ORA_PROVIDER }
export default providers