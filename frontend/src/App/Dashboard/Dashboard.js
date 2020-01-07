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

    componentDidMount(){
        fetch('http://localhost:5000/projects',
            {
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + user.token
                }
            }
        )
        .then(res=>res.json())
        .then(data=>{this.setState({projects:data.projects})})
        .catch(err=>console.log(err))
    }

    openProject = ({id, name}) => {
        routeStore.push(`/project/${name}/pipelines`)
    }
    
    render(){
        return(
            <div>
                {this.state.projects.map(p=><p onClick={this.openProject(p)}>{p.name}</p>)}
                <NewProjectLink/>
            </div>
        )
    }
}

const NewProjectLink = () => {

    const openLink = () => {
        if(!user.githubToken){
            window.open(`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID}?scope=repo write:repo_hook user workflow`,'_self')
        }
        else{
            routeStore.push('/create-project')
        }    
    }

    return <p onClick={openLink}>create new project</p>
}



export default Dashboard