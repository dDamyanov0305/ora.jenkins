import { observable, action } from 'mobx';
import user from '../Stores/UserStore'
import routeStore from './RouteStore'

class LoginRegisterStore {

    @observable data = {}
    @observable showPassword = false
    @observable errorText = ''


    @action handleChange = (e) => {
        this.data[e.target.name] = e.target.value
    }

    @action togglePassword = () => {
        this.showPassword = !this.showPassword
    }

    changeForm = () => {
        if(routeStore.pathname === "/login"){
            routeStore.push("/register")
        }
        else if(routeStore.pathname === "/register"){
            routeStore.push("/login")
        }
    }

    submit = async (e) => {
       
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
