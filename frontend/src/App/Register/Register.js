import React, { Component } from 'react';
import routeStore from '../../Stores/RouteStore';
import user from '../../Stores/UserStore';


class Register extends Component{
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
        errorText:'',
        error:false
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
            method:'POST',
            mode:'cors',
            headers:{"Content-type": "application/json"},
            body:this.state.creds
          }
        )
        .then(res=>{
          this.setState({error:res.status!==200?true:false})
          return res.json()
        })
        .then(data=>{
            if(this.state.error){
                this.setState({errorText:data.error})        
            }else{
                user.setAccount(data)
                routeStore.push("/dashboard")
            }
        })
        .catch(err=>{console.log(err)})
      }
  
      this.setState({errors})
      
    }
  
    changeForm = () => {
      routeStore.push('/login')
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

  export default Register