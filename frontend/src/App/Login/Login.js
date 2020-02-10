import React, { Component } from 'react';
import routeStore from '../../Stores/RouteStore';
import user from '../../Stores/UserStore';

function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}
  
function json(response) {
    return response.json()
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
            errorText:'',
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

    handleLogin = async (e) => {
        e.preventDefault()

        try{
            const res = await fetch('http://localhost:5000/users/login',{
                method:'POST',
                mode:'cors',
                headers:{"Content-type": "application/json"},
                body: JSON.stringify(this.state.creds)
            })
            
            const data = await res.json()
            console.log(data)
            
            if(res.status < 200 || res.status >= 300){
                this.setState({errorText: data.error})        
            }else{
                user.setAccount(data)
                routeStore.push("/dashboard")
            }

        }catch(err){
            console.log(err)
        }
        
    }

    changeForm = () => {
        routeStore.push('/sign-up')
    }

    render(){
        return(
        <div>
            <p>{this.state.errorText}</p>
            <form onSubmit={this.handleLogin}>
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

export default Login