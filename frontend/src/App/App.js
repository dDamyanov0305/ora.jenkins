import React, { Component, Suspense } from 'react';
import { observer } from 'mobx-react';
import { Switch, Route, withRouter, useParams, useHistory, Redirect, useLocation } from 'react-router-dom';
import routeStore from '../Stores/RouteStore';
import user from '../Stores/UserStore';
import Dashboard from './Dashboard/Dashboard'
import Login from './Login/Login'
import Register from './Register/Register'
import ProjectForm from './ProjectForm/ProjectForm'


class App extends Component{
  constructor(props){
    super(props)
    //this.loginCheck();
    console.log(user)
    const { history, location } = this.props;
    routeStore.update(history, location);
    window.authDone = this.authDone
  }


  componentWillReceiveProps({ history, location }) {
		routeStore.update(history, location);
  }

  
  loginCheck() {
		if (user.loggedIn) this.props.history.push('/dashboard');
		else if (!user.loggedIn && this.props.location.pathname !== '/login') this.props.history.push('/login');
  }

  authDone = async (code, state) => {
    console.log(user.token)
    if(code){
      console.log('OOP')
      const result = await fetch(`http://localhost:5000/github/oauth?code=${code}`,{
        headers: {
          'Content-Type':'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTJmMWQzZDllNDVhODY4ZjgzNTFhZjIiLCJpYXQiOjE1ODAxNDU5ODF9._9axXOb7NOY4Nvg991eWRcK_oOrzpaARaI5CTcUzI9U`
        }
      })
      console.log(result)
      if(result.status >= 200 && result.status < 300){
        routeStore.push('/create-project')
      }
    }
    
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
          <Route path="/github/oauth/callback" component={AuthCallback}/>
        </Switch>
      </div>
  
    );
  }
}

class OauthCallback extends Component{
  constructor(props){
    super(props)
  }

  componentDidMount(){
    
  }
}



const AuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  alert(urlParams.get('code'),urlParams.get('state'))
  if(window.opener){
    window.opener.authDone(urlParams.get('code'),urlParams.get('state'))
  }
  window.close()
  return null
}




export default withRouter(observer(App));
