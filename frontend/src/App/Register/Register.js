import React from 'react';
import { observer } from 'mobx-react';
import loginRegisterStore from '../../Stores/LoginRegisterStore';

const Register = observer(() => 
  <div>
    {loginRegisterStore.errorText}  
    <form onSubmit={loginRegisterStore.submit}>
      <label>
        name
        <input type="text" name="name" value={loginRegisterStore.data.name || ''} onChange={loginRegisterStore.handleChange}/>
      </label>
      <label>
        e-mail
        <input type="email" name="email" value={loginRegisterStore.data.email || ''} onChange={loginRegisterStore.handleChange}/>
      </label>
      <label>
        password
        <input type={loginRegisterStore.showPassword ? "text" : "password"} name="password" value={loginRegisterStore.data.password || ''} onChange={loginRegisterStore.handleChange}/>
      </label>
      <label>
        confirm password
        <input type={loginRegisterStore.showPassword? " text" : "password"} name="confirmedPassword" value={loginRegisterStore.data.confirmedPassword || ''} onChange={loginRegisterStore.handleChange}/>
      </label>
      <p onClick={loginRegisterStore.togglePassword}>{loginRegisterStore.showPassword ? "hide":"show"} password</p>
      <input type="submit" value="Sign In"/>
    </form>
    <p onClick={loginRegisterStore.changeForm}>Do you have account? Sign in</p>
  </div>
)

  export default Register