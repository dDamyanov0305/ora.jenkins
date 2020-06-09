import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import routeStore from './RouteStore'
import pipelineFormStore from './PipelineFormStore';

class LoginRegisterStore {

    @observable data = {}
    @observable showPassword = false
    @observable errorText = ''


    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.value
    }

    @action togglePassword = (event) => {
        event.target.classList.toggle('clicked')
        this.showPassword = !this.showPassword
    }

    @action changeForm = () => {
        if(routeStore.pathname === "/login"){
            routeStore.push("/register")
        }
        else if(routeStore.pathname === "/register"){
            routeStore.push("/login")
        }
        this.data = {}
    }

    handleFocus = event => {
        pipelineFormStore.allowValue[event.target.name] = true
        event.target.parentNode.parentNode.classList.add("focus");
    }

    handleBlur = event => {
        if(event.target.value == ""){
            pipelineFormStore.allowValue[event.target.name] = false
            event.target.parentNode.parentNode.classList.remove("focus");
        }
    }

    @action submit = async (e) => {
       
        e.preventDefault()
        const route = routeStore.pathname === "/login" ? "login" : "create"

        const result = await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/users/${route}`,{
            method:'POST',
            headers:{"Content-type": "application/json"},
            body: JSON.stringify(this.data)
        })
        
        const data = await result.json()

        if(result.status < 200 || result.status >= 300){
            this.errorText = data.error
        }
        else{
            user.setAccount(data)
        }
                                
    }

}

const loginRegisterStore = new LoginRegisterStore();
export default loginRegisterStore
