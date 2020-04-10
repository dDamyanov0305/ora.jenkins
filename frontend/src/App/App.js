import React from 'react';
import { observer } from 'mobx-react';
import { Switch, Route, withRouter, useParams } from 'react-router-dom';
import routeStore from '../Stores/RouteStore';
import user from '../Stores/UserStore';
import WorkspacesList from './WorkspacesList/WorkspacesList'
import Login from './Login/Login'
import Register from './Register/Register'
import WorkspaceForm from './WorkspaceForm/WorkspaceForm'
import ProjectForm from './ProjectForm/ProjectForm'
import ActionForm from './ActionForm/ActionForm'
import PipelinesPanel from './PipelinesPanel/PipelinesPanel';
import ProjectsPanel from './ProjectsPanel/ProjectsPanel'
import PipelinePage from './PipelinePage/PipelinePage';
import ExecutionPage from './ExecutionPage/ExecutionPage';
import PipelineForm from './PipelineForm/PipelineForm';
import providerStore from '../Stores/ProviderStore';
import actionFormStore from '../Stores/ActionFormStore';
import storage from '../Services/perfectLocalStorage';


const GithubAuthCallback = () => 
{
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams)

  if(window.opener)
  {
    alert(urlParams.get('code'))
    window.opener.github_auth_done(urlParams.get('code'))
  }
  window.close()
  return
}

const OraAuthCallback = () => 
{
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams)

  if(window.opener)
  {
    alert(urlParams.get('code'))
    window.opener.ora_auth_done(urlParams.get('code'))
  }
  window.close()
  return null
}

const AuthCallback = () => 
{
  const urlParams = new URLSearchParams(window.location.search);
  //console.log(urlParams)
  let { type } = useParams()

  if(window.opener)
  {
    alert(urlParams.get('code'))
    window.opener.auth_done(urlParams.get('code'), type)
  }
  window.close()
  return null
}

async function auth_done(code, type) 
{
  //console.log('vliza')

  if(code)
  {
    const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/${type}/oauth?code=${code}`,
    {
      headers: {'Authorization': `Bearer ${user.token}`}
    })

    //console.log(result.status)

    if(result.status >= 200 && result.status < 300)
    {
      const data = result.json()
      user.addIntegration(data)

      if(type === 'github')
      {
        providerStore.getRepos()
      }
      else if(type === 'ora')
      {
        actionFormStore.getProjects()
      }

      routeStore.push(storage.get("return_uri"))
      storage.remove("return_uri")
    }
  }
  else{
    console.log('no code')
  }

}

async function github_auth_done(code) 
{
  console.log('vliza')

  if(code)
  {
    const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/github/oauth?code=${code}`,
    {
      headers: {'Authorization': `Bearer ${user.token}`}
    })

    console.log(result.status)

    if(result.status >= 200 && result.status < 300)
    {
      const data = result.json()
      user.addIntegration(data)
      providerStore.getRepos()
      routeStore.push('/project/create')
    }
  }
  else{
    console.log('no code')
  }

}

async function ora_auth_done(code) 
{
  console.log('vliza')

  if(code)
  {
    const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ora/oauth?code=${code}`,
    {
      headers: {'Authorization': `Bearer ${user.token}`}
    })

    console.log(result.status)

    if(result.status >= 200 && result.status < 300)
    {
      const data = result.json()
      user.addIntegration(data)
      actionFormStore.getProjects()
      routeStore.push('/actions/create')
    }
  }
  else{
    console.log('no code')
  }

}

const App = (props) => {

  const { history, location } = props

  routeStore.update(history, location)

  window.github_auth_done = github_auth_done
  window.ora_auth_done = ora_auth_done
  window.auth_done = auth_done

  if(!user.loggedIn && 
    routeStore.pathname !== '/login' && 
    routeStore.pathname !== '/register' && 
    !routeStore.pathname.includes("/oauth/callback")
    /*routeStore.pathname !== '/github/oauth/callback' &&
    routeStore.pathname !== '/ora/oauth/callback'*/)
  {
    routeStore.push('/login');
  }
  
  return (
    <div>
      {user.email}
      <button onClick={user.logout}>logout</button>
      <WorkspacesList/>
      <Switch>
        <Route path="/login" component={Login}/>
        <Route path="/register" component={Register}/>
        <Route path="/projects" component={ProjectsPanel}/>
        <Route path="/workspace/create" component={WorkspaceForm}/>
        <Route path="/project/create" component={ProjectForm}/>
        <Route path="/pipeline/create" component={PipelineForm}/>
        <Route path="/actions/create" component={ActionForm}/>
        <Route path="/project/:project_name/pipelines/:pipeline_name/executions/:execution_id" component={ExecutionPage}/>
        <Route path="/project/:project_name/pipelines/:pipeline_name" component={PipelinePage}/>
        <Route path="/project/:project_name/pipelines" component={PipelinesPanel}/>
        <Route path="/github/oauth/callback" component={GithubAuthCallback}/>
        <Route path="/ora/oauth/callback" component={OraAuthCallback}/>
        <Route path="/oauth/callback/:type" component={AuthCallback}/>
      </Switch>
    </div>

  );
  
}

export default withRouter(observer(App));
