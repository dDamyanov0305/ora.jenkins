import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Switch, Route, withRouter } from 'react-router-dom';
import routeStore from '../Stores/RouteStore';
import user from '../Stores/UserStore';
import Dashboard from './Dashboard/Dashboard'
import Login from './Login/Login'
import Register from './Register/Register'
import ProjectForm from './ProjectForm/ProjectForm'

class App extends Component{
  constructor(props){
    super(props)
    this.loginCheck();
    const { history, location } = this.props;
    routeStore.update(history, location);
  }

  componentWillReceiveProps({ history, location }) {
		routeStore.update(history, location);
  }
  
  loginCheck() {
		if (user.loggedIn) this.props.history.push('/dashboard');
		else if (!user.loggedIn && this.props.location.pathname !== '/login') this.props.history.push('/login');
  }
  
  componentWillUnmount(){
    routeStore.push('/');
  }

  render(){
    return (
      <div>
        <Switch>
          <Route path="/dashboard" component={Dashboard}/>
          <Route path="/login" component={Login}/>
          <Route path="/sign-up" component={Register}/>
          <Route path="/create-project" component={ProjectForm}/>
        </Switch>
      </div>
  
    );
  }
}


export default withRouter(observer(App));
