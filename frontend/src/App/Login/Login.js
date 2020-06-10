import React from 'react';
import { observer } from 'mobx-react';
import loginRegisterStore from '../../Stores/LoginRegisterStore';
import './style.css'

const Login = observer(()=>
    <div class="container">
        <div class="login-content">
            <div>
            <form onSubmit={loginRegisterStore.submit}>
                <h2>Welcome</h2>
                <p>{loginRegisterStore.errorText}</p>
                <div class="input-div one">
                    <div class="i">
                        <i class="fas fa-at"></i>
                    </div>
                    <div class="div">
                        <h5>Email</h5>
                        <input 
                            type="text" 
                            name="email" 
                            class="input" 
                            value={loginRegisterStore.data.email || ''} 
                            onChange={loginRegisterStore.handleChange}
                            onFocus={loginRegisterStore.handleFocus}
                            onBlur={loginRegisterStore.handleBlur}
                        />
                    </div>
                </div>
                <div class="input-div pass">
                    <div class="i"> 
                        <i class="fas fa-lock"></i>
                    </div>
                    <div class="div">
                        <h5>Password</h5>
                        <input 
                            class="input" 
                            type={loginRegisterStore.showPassword ? "text" : "password"} 
                            name="password" 
                            value={loginRegisterStore.data.password || ''} 
                            onChange={loginRegisterStore.handleChange}
                            onFocus={loginRegisterStore.handleFocus}
                            onBlur={loginRegisterStore.handleBlur}
                        />
                    </div>
                    <div className="i pointer" onClick={loginRegisterStore.togglePassword}> 
                        <i class="fas fa-eye"></i>
                    </div>
                </div>
                { <a href="#">Forgot Password?</a>}
                <input type="submit" class="btn" value="Login"/>
            </form>
            <div class="redirect">Don't have an account? <span onClick={loginRegisterStore.changeForm}>Sign Up</span></div>
            </div>
        </div>
    </div>
)

export default Login