import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Switch, Route, withRouter } from 'react-router-dom';
import routeStore from '../Stores/RouteStore';
import user from './Stores/UserStore';

class App extends Component{
  constructor(props){
    super(props)
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
          <Route path="/sign-up" component={SignUpForm}/>
        </Switch>
      </div>
  
    );
  }
}


class Login extends Component{
  constructor(props){
    super(props)
    this.state={
      creds:{
        email:'',
        password:'',
      },
      showPass:false,
      error:''
    }
  }

  handleChange = e => {
    let {creds} = this.state
    creds[e.target.name] = e.target.value
    this.setState({creds})
  }

  showPassword = () => {
    this.setState({showPass:!this.state.showPass})
  }

  handleLogin = e => {
    e.preventDefault()

    fetch('http://localhost:5000/users/login',
      {
        method:'post',
        mode:'cors',
        headers:{"Content-type": "application/json"},
        body:this.state.creds
      }
    )
    .then(res=>{
      if(res.status == 200){
        routeStore.push("/dashboard")
        //get user from response
      }
      else{
        console.log(res)
        //this.setState({errors:res.})
      }
    })
    .catch(err=>{

    })
  }

  changeForm = () => {
    routeStore.push('/sign-up')
  }

  render(){
    return(
      <div>
        <form onSubmit={this.handleSignIn}>
          <label>
            e-mail
            <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
          </label>
          <label>
            password
            <input type={this.state.showPass?"text":"password"} name="password" value={this.state.password} onChange={this.handleChange}/>
          </label>
          <p onClick={this.showPassword}>{this.state.showPass?"hide":"show"} password</p>
          <input type="submit" value="Sign in"/>
        </form>
        <p onClick={this.changeForm}>Don't have an account yet? Sign up</p>
      </div>
    )
  }
}

class SignUpForm extends Component{
  constructor(props){
    super(props)
    this.state={
      creds:{
        email:'',
        password:'',
        confirmedPassword:'',
        name:'',
      },
      showPass:false,
      errors:[]
    }
  }

  handleChange = e => {
    let {creds} = this.state
    creds[e.target.name] = e.target.value
    this.setState({creds})
  }

  showPassword = () => {
    this.setState({showPass:!this.state.showPass})
  }

  handleSignIn = e => {
    e.preventDefault()

    let errors = []
    
    if(this.state.password.lenght < 5){
      errors.push("Your password must be at least 5 characters long")
    }

    else if(this.state.password !== this.state.confirmedPassword){
      errors.push("Your passwords don't match")
    }

    else{
      fetch('http://localhost:5000/users',
        {
          method:'post',
          mode:'cors',
          headers:{"Content-type": "application/json"},
          body:this.state.creds
        }
      )
      .then(res=>{
        if(res.status == 200){
          routeStore.push("/dashboard")
          //get user from response
        }
        else{
          console.log(res)
          
        }
      })
      .catch(err=>{

      })
    }

    this.setState({errors})
    
  }

  changeForm = () => {
    routeStore.push('/sign-in')
  }

  render(){
    return(
      <div>
        <form onSubmit={this.handleSignIn}>
        <label>
            name
            <input type="text" name="name" value={this.state.name} onChange={this.handleChange}/>
          </label>
          <label>
            e-mail
            <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
          </label>
          <label>
            password
            <input type={this.state.showPass?"text":"password"} name="password" value={this.state.password} onChange={this.handleChange}/>
          </label>
          <label>
            confirm password
            <input type={this.state.showPass?"text":"password"} name="confirmedPassword" value={this.state.confirmedPassword} onChange={this.handleChange}/>
          </label>
          <p onClick={this.showPassword}>{this.state.showPass?"hide":"show"} password</p>
          <input type="submit" value="Sign In"/>
        </form>
        <p onClick={this.changeForm}>Do you have account? Sign in</p>
      </div>
    )
  }
}

class Dashboard extends Component{
  constructor(props){
    super(props)

  }

  render(){
    return(
      <h1>welcome to the dashboard</h1>
    )
  }
}

export default withRouter(observer(App));
