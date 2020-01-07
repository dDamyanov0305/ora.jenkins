import React, { Component } from 'react';

class ProjectForm extends Component{
    constructor(props){
        super(props);
        this.state = {
            repos:[]
        }

    }

    componentDidMount(){
        fetch('https://api.github.com/user/repos',
            {
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "token " + user.githubToken
                }
            }
        )
        .then(res=>res.json())
        .then(({repos})=>{this.setState({repos})})
        .catch(err=>console.log(err))
    }

    //create new project
    syncProject = ({full_name}) => {
        fetch('http://localhost:5000/github/new',
            {
                method:'POST',
                headers:{
                    "Content-type": "application/json",
                    "Authorization": `token ${user.githubToken}, Bearer ${user.token}`
                },
                body:{full_name}
            }
        )
        .then(res=>{
            if(!(res.status>=200 && res.status<300)){
                console.log("OMFG ERROR")
            }else{
                return res.json()
            }
        })
    }

    render(){
        return(
            <div>
                {this.state.repos.map(repo=><p onClick={this.syncProject(repo)}>{repo.name}</p>)}
            </div>
        )
    }
}

export default ProjectForm
