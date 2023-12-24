import { useParams } from 'react-router-dom';
import user from '../../Stores/UserStore';
import providerStore from '../../Stores/ProviderStore';
import actionFormStore from '../../Stores/ActionFormStore';
import storage from '../../Services/perfectLocalStorage';
import workspaceFormStore from '../../Stores/WorkspaceFormStore';
import providers from '../../Providers/Providers';


const AuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const { type } = useParams()

  if(window.opener)
    window.opener.auth_done(urlParams.get('code'), type)
  
  window.close()
  return null
}


function resume(data) {
  user.addIntegration(data)

  const routes = {
    '/project/create': providerStore.getRepos,
    '/action/create': actionFormStore.fetchProjects,
    '/workspace/create': workspaceFormStore._getOrganizations,
    '/pipeline/create': () => {}
  }

  console.log(storage.get("return_uri"))

  for (let route in routes) {
    if(storage.get("return_uri") === route) {
      console.log('matched')
      routes[route]()
      break
    }
  }
}


function auth_done(code, type) {
  if (!code)
    console.error(`Could not obtain code for ${type} OAuth`)

  const provider = providers[type.toUpperCase()]
  provider.api
  .oauth({ code })
  .then(resume)
  .finally(() => storage.remove("return_uri"))
}


export { auth_done, AuthCallback }