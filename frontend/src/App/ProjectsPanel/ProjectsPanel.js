import React from 'react';
import routeStore from '../../Stores/RouteStore';
import { observer } from 'mobx-react';
import projectStore from '../../Stores/ProjectStore';
import providerStore from '../../Stores/ProviderStore';
import './style.css'

const ProjectsPanel = observer(() => 
    <div className="projects-container">
        <NewProjectCard/>
        { projectStore.projects.map(project => <ProjectCard key={project._id} project={project}/>) }
    </div>
)

const ProjectCard = observer(({project}) => (
    <div className="project-card" onClick={() => projectStore.selectProject(project)}>
        <i class={`fab fa-${project.hosting_provider.toLowerCase()} fa-w-16 fa-2x icon`}></i>
        <div>
            <p>{project.name}</p> 
            {/* <button onClick={() => projectStore.delete(project)}>delete</button>  */}
        </div>
        <p className="small">2 pipelines</p>
    </div>
))

const NewProjectCard = () => (
    <div className="project-card new" onClick={ ()=> {routeStore.push("/project/create"); providerStore.init()} }>
        <i class="fal fa-plus-circle fa-w-16 fa-2x"></i>
        <div>
            <p>New project</p>    
        </div>
        <p className="small">Automate another project</p>     
    </div>
)


export default ProjectsPanel