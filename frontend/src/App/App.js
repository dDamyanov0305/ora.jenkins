import React from 'react';
import { observer } from 'mobx-react';
import { Switch, Route, withRouter } from 'react-router-dom';
import routeStore from '../Stores/RouteStore';
import user from '../Stores/UserStore';
import WorkspacesList from './WorkspacesList/WorkspacesList'
import Login from './Login/Login'
import Register from './Register/Register'
import ProjectForm from './ProjectForm/ProjectForm'
import ActionForm from './ActionForm/ActionForm'
import PipelinesPanel from './PipelinesPanel/PipelinesPanel';
import ProjectsPanel from './ProjectsPanel/ProjectsPanel'
import ActionsPanel from './ActionsPanel/ActionsPanel';
import ExecutionsPanel from './ExecutionsPanel/ExecutionsPanel';
import PipelineForm from './PipelineForm/PipelineForm';
import providerStore from '../Stores/ProviderStore';
import actionFormStore from '../Stores/ActionFormStore';


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

  if(!user.loggedIn && 
    routeStore.pathname !== '/login' && 
    routeStore.pathname !== '/register' && 
    routeStore.pathname !== '/github/oauth/callback' &&
    routeStore.pathname !== '/ora/oauth/callback')
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
        <Route path="/project/create" component={ProjectForm}/>
        <Route path="/pipeline/create" component={PipelineForm}/>
        <Route path="/actions/create" component={ActionForm}/>
        <Route path="/project/:project_name/pipelines/:pipeline_name" component={ActionsPanel}/>
        <Route path="/project/:project_name/pipelines/:pipeline_name/executions" component={ExecutionsPanel}/>
        <Route path="/project/:project_name/pipelines" component={PipelinesPanel}/>
        <Route path="/github/oauth/callback" component={GithubAuthCallback}/>
        <Route path="/ora/oauth/callback" component={OraAuthCallback}/>
      </Switch>
    </div>

  );
  
}

export default withRouter(observer(App));
