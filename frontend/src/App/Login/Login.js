import React from 'react';
import { observer } from 'mobx-react';
import loginRegisterStore from '../../Stores/LoginRegisterStore';

const Login = observer(() => 
    <div>
        <p>{loginRegisterStore.errorText}</p>
        <form onSubmit={loginRegisterStore.submit}>
        <label for="email">
            e-mail
            <input type="text" name="email" id="email" value={loginRegisterStore.data.email || ''} onChange={loginRegisterStore.handleChange}/>
        </label>
        <label>
            password
            <input type={loginRegisterStore.showPassword ? "text" : "password"} name="password" value={loginRegisterStore.data.password || ''} onChange={loginRegisterStore.handleChange}/>
        </label>
        <p onClick={loginRegisterStore.togglePassword}>{loginRegisterStore.showPassword ? "hide":"show"} password</p>
        <input type="submit" value="Sign in"/>
        </form>
        <p onClick={loginRegisterStore.changeForm}>Don't have an account yet? Sign up</p>
    </div>
)

export default Login