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
    console.log(user)
    //this.loginCheck()
    const { history, location } = this.props;
    routeStore.update(history, location);
    window.authDone = this.authDone
  }

  // componentDidUpdate(){
  //   this.loginCheck()
  // }


  componentWillReceiveProps({ history, location }) {
		routeStore.update(history, location);
  }

  
  loginCheck() {
    console.log(user.loggedIn, user.loggedIn===true)
    if(user.loggedIn && routeStore.pathname === '/login'){
      this.props.history.push('/dashboard');
    }
    else if(!user.loggedIn && routeStore.pathname !== '/login'){
      this.props.history.push('/login');
    }
  }

  authDone = async (code) => {

    if(code){
      
      const result = await fetch(`http://localhost:5000/github/oauth?code=${code}`,{
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTRlOTIyNDQyNWY2MTRlYWYwMjAzZjciLCJpYXQiOjE1ODIyMDgxMDZ9.kOZrCRoyVRgFTOmavs6XqCzOfrAtP8KuB8CCx0VxQhU`
        }
      })
   
      if(result.status >= 200 && result.status < 300){
        routeStore.push('/create-project')
      }
    }
    
  }

  render(){
    return (
      <div>
        {user.email}
        <Switch>
          <Route path="/dashboard" component={Dashboard}/>
          <Route path="/login" component={Login}/>
          <Route path="/register" component={Register}/>
          <Route path="/project/create" component={ProjectForm}/>
          <Route path="/github/oauth/callback" component={AuthCallback}/>
        </Switch>
      </div>
  
    );
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
