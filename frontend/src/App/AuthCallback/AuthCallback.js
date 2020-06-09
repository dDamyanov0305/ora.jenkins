import { useParams } from 'react-router-dom';
import user from '../../Stores/UserStore';
import providerStore from '../../Stores/ProviderStore';
import actionFormStore from '../../Stores/ActionFormStore';
import storage from '../../Services/perfectLocalStorage';
import workspaceFormStore from '../../Stores/WorkspaceFormStore';

const AuthCallback = () =>
{
  const urlParams = new URLSearchParams(window.location.search);
  let { type } = useParams()

  if(window.opener)
  {
    //alert(urlParams.get('code'))
    window.opener.auth_done(urlParams.get('code'), type)
  }
  window.close()
  return null
}

async function auth_done(code, type) {

  if(code){
    const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/${type}/oauth?code=${code}`,
    {
      headers: {'Authorization': `Bearer ${user.token}`}
    })

    if(result.status >= 200 && result.status < 300)
    {
      const data = result.json()
      user.addIntegration(data)

      console.log('auth callback')

      let routes = {
        '/project/create':()=>{providerStore.getRepos()},
        '/action/create':()=>{actionFormStore.getProjects()},
        '/workspace/create':()=>{workspaceFormStore._getOrganizations()},
        '/pipeline/create':()=>{}
      }

      console.log(storage.get("return_uri"))

      for(let route in routes){
        if(storage.get("return_uri") === route){
          console.log('matched')
          routes[route]()
          break
        }
      }
    }
  }
  else{
    console.log('no code')
  }
  storage.remove("return_uri")
}

export {
    auth_done,
    AuthCallback
}