import React, { Component } from 'react';
import user from '../../Stores/UserStore'

class ProjectForm extends Component{
    constructor(props){
        super(props);
        this.state = {
            repos:[],
            hosting_provider:'GITHUB'
        }

    }

    async componentDidMount(){
        try{
            const result = await fetch('https://localhost:5000/github/repos',{
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + user.token
                }
            })
            if(result.status === 200){
                const data = await result.json()
                this.setState({repos: data.projects})
            }
        }catch(err){
            console.log(err)
        }

    }

    
    createProject = async (repo) => {
        const result = await fetch('http://localhost:5000/projects/create',{
            method:'POST',
            headers:{
                "Content-type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body:{
                name: repo.full_name,
                
            }
        })

        if(!(result.status < 200 || result.status >= 300)){

        }
       
    }

    render(){
        return(
            <div>
                {this.state.repos.map(repo => <p onClick={this.createProject(repo)}>{repo.name}</p>)}
            </div>
        )
    }
}

export default ProjectForm
