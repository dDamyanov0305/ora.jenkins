import React from 'react';
import { observer } from 'mobx-react';
import loginRegisterStore from '../../Stores/LoginRegisterStore';

// const Register = observer(() => 
//   <div>
//     {loginRegisterStore.errorText}  
//     <form onSubmit={loginRegisterStore.submit}>
//       <label>
//         name
//         <input type="text" name="name" value={loginRegisterStore.data.name || ''} onChange={loginRegisterStore.handleChange}/>
//       </label>
//       <label>
//         e-mail
//         <input type="email" name="email" value={loginRegisterStore.data.email || ''} onChange={loginRegisterStore.handleChange}/>
//       </label>
//       <label>
//         password
//         <input type={loginRegisterStore.showPassword ? "text" : "password"} name="password" value={loginRegisterStore.data.password || ''} onChange={loginRegisterStore.handleChange}/>
//       </label>
//       <label>
//         confirm password
//         <input type={loginRegisterStore.showPassword? " text" : "password"} name="confirmedPassword" value={loginRegisterStore.data.confirmedPassword || ''} onChange={loginRegisterStore.handleChange}/>
//       </label>
//       <p onClick={loginRegisterStore.togglePassword}>{loginRegisterStore.showPassword ? "hide":"show"} password</p>
//       <input type="submit" value="Sign In"/>
//     </form>
//     <p onClick={loginRegisterStore.changeForm}>Do you have account? Sign in</p>
//   </div>
// )

const Register = observer(()=>
  <div>
      <div class="container">
          <div class="login-content">
            <div>
              <form onSubmit={loginRegisterStore.submit}>
                  <h2 class="title">Welcome</h2>
                  <div class="input-div one">
                      <div class="i">
                          <i class="fas fa-user"></i>
                      </div>
                      <div class="div">
                          <h5>Username</h5>
                          <input 
                            type="text" 
                            class="input" 
                            name="name" 
                            value={loginRegisterStore.data.name || ''} 
                            onChange={loginRegisterStore.handleChange}
                            onFocus={loginRegisterStore.handleFocus}
                            onBlur={loginRegisterStore.handleBlur}
                          />
                      </div>
                  </div>
                  <div class="input-div one">
                      <div class="i">
                          <i class="fas fa-at"></i>
                      </div>
                      <div class="div">
                          <h5>Email</h5>
                          <input 
                            type="email" 
                            class="input" 
                            name="email" 
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
                            type="password" 
                            class="input" 
                            type={loginRegisterStore.showPassword ? "text" : "password"}
                            name="password" 
                            value={loginRegisterStore.data.password || ''} 
                            onChange={loginRegisterStore.handleChange}
                            onFocus={loginRegisterStore.handleFocus}
                            onBlur={loginRegisterStore.handleBlur}
                          />
                      </div>
                      <div class="i pointer" onClick={loginRegisterStore.togglePassword}> 
                          <i class="fas fa-eye"></i>
                      </div>
                  </div>
                  <div class="input-div pass">
                      <div class="i"> 
                          <i class="fas fa-lock"></i>
                      </div>
                      <div class="div">
                          <h5>Confirm Password</h5>
                          <input 
                            type="password" 
                            class="input" 
                            type={loginRegisterStore.showPassword? " text" : "password"} 
                            name="confirmedPassword" 
                            value={loginRegisterStore.data.confirmedPassword || ''} 
                            onChange={loginRegisterStore.handleChange}
                            onFocus={loginRegisterStore.handleFocus}
                            onBlur={loginRegisterStore.handleBlur}
                          />
                      </div>
                  </div>
                  <input type="submit" class="btn" value="Sign Up"/>
              </form>
              <div class="redirect">Already have account? <span onClick={loginRegisterStore.changeForm}>Login</span></div>
              </div>
          </div>
      </div>
  </div>
)

export default Register