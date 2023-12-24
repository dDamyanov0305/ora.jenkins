import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import routeStore from './RouteStore'
import pipelineFormStore from './PipelineFormStore';
import { users } from '../Services/Server';


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
        if(routeStore.pathname === "/login") {
            routeStore.push("/register")
        }
        else if(routeStore.pathname === "/register") {
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
        const loginOrCreateUser = routeStore.pathname === "/login" ? users.login : users.create

        loginOrCreateUser(this.data)
        .then(data => user.setAccount(data))
        .catch(error => this.errorText = error.message)                                
    }

}

const loginRegisterStore = new LoginRegisterStore();
export default loginRegisterStore
