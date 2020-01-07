import user from '../Stores/RouteStore'

class API{
    constructor(){
        this.base_url = 'http://localhost:5000'
    }

    send = (path, data={}, method = 'get') => {
        return fetch(this.base_url+path,
            {
                method,
                headers:this._headers(),
                body:data
            }
        )
    }

    _headers = () => ({
        "Content-type": "application/json",
        "Authorization": "Bearer " + user.token
    })
}

const api = new API()
export default api