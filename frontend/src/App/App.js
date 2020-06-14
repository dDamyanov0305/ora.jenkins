import React from 'react';
import { observer } from 'mobx-react';
import { Switch, Route, withRouter } from 'react-router-dom';
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
import { AuthCallback, auth_done } from './AuthCallback/AuthCallback';
import ActionsPanel from './ActionsPanel/ActionsPanel';
import ExecutionsPanel from './ExecutionsPanel/ExecutionsPanel';
import Layout from './Layout/Layout'
import storage from '../Services/perfectLocalStorage';
import './App.css'


const App = (props) => {
  
  const { history, location } = props
  routeStore.update(history, location)
  window.auth_done = auth_done
  


  if(!user.loggedIn && 
    routeStore.pathname !== '/login' && 
    routeStore.pathname !== '/register' && 
    !routeStore.pathname.includes("/oauth/callback") &&
    !storage.get('ora.ci_token')
    ){
    routeStore.push('/login');
  }
  
  return (
    <div>
      <Layout>
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/register" component={Register}/>
          <Route exact path="/projects" component={ProjectsPanel}/>
          <Route exact path="/:type/oauth/callback" component={AuthCallback}/>
          <Route exact path="/workspace/create" component={WorkspaceForm}/>
          <Route exact path="/project/create" component={ProjectForm}/>
          <Route exact path="/pipeline/create" component={PipelineForm}/>
          <Route exact path="/actions/create" component={ActionForm}/>
          <Route exact path="/executions/latest" component={ExecutionsPanel}/>
          <Route exact path="/project/:project_name/pipelines" component={PipelinesPanel}/>
          <Route exact path="/project/:project_name/pipelines/:pipeline_name" component={PipelinePage}/>
          <Route exact path="/project/:project_name/pipelines/:pipeline_name/actions" component={ActionsPanel}/>
          <Route exact path="/project/:project_name/pipelines/:pipeline_name/executions" component={ExecutionsPanel}/>
          <Route exact path="/project/:project_name/pipelines/:pipeline_name/executions/:execution_id" component={ExecutionPage}/>
        </Switch>
      </Layout>
    </div>

  );
  
}

export default withRouter(observer(App));
