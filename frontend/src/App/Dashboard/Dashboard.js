import React, { Component } from 'react';
import user from '../../Stores/UserStore';
import routeStore from '../../Stores/RouteStore';

class Dashboard extends Component{
    constructor(props){
        super(props);
        this.state = {
            projects:[]
        }
    }

    async componentDidMount(){
        const res = await fetch('http://localhost:5000/projects/all',
            {
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + user.token
                }
            }
        )
        const data = await res.json()
        if(res.status >=200 && res.status < 300)
            this.setState({ projects: data.projects })
        
    }

    openProject = ({id, name}) => {
        routeStore.push(`/project/${name}/pipelines`)
    }
    
    render(){
        return(
            <div>
                {this.state.projects.map(p => <p onClick={()=>this.openProject(p)}>{p.name}</p>)}
                <NewProjectLink/>
                <OraIntegration/>
            </div>
        )
    }
}

const NewProjectLink = () => {

    const openLink = () => {
 
        window.open(`https://github.com/login/oauth/authorize?client_id=4932c4d429e01a41781d&scope=repo user`,'_blank','height=570,width=520')
        
   
    }

    return <p onClick={openLink}>create new project</p>
}

const OraIntegration = () => {

    const openLink = () => {
        
        window.open(`https://ora.pm/authorize?client_id=95I9a8bgnpnHXTFCh3xpAJutKLwb1ruqOZzZLWURcipECxgZ&redirect_uri=http://localhost:5000/ora/oauth&response_type=code`,'_self')
        
    }

    return <p onClick={openLink}>ora</p>
}



export default Dashboard