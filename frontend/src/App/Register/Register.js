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
  
    handleSignUp = async (e) => {
      e.preventDefault()
  
      let errors = []
      
      if(this.state.creds.password.lenght < 5){
        errors.push("Your password must be at least 5 characters long")
      }
  
      else if(this.state.creds.password !== this.state.creds.confirmedPassword){
        errors.push("Your passwords don't match")
      }
  
      else{
        const res = await fetch('http://localhost:5000/users/create',{
            method:'POST',
            mode:'cors',
            headers:{"Content-type": "application/json"},
            body: JSON.stringify(this.state.creds)
          })
       
         const data = await res.json()
         console.log(data)

         if(res.status < 200 || res.status >= 300)
            errors.push(data.error)       
         else{
            user.setAccount(data)
            routeStore.push("/dashboard")
         }
              
      }
  
      this.setState({errors})
      
    }
  
    changeForm = () => {
      routeStore.push('/login')
    }
  
    render(){
      return(
        <div>
          {this.state.errors.map(err => <p>{err}</p>)}
          <form onSubmit={this.handleSignUp}>
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