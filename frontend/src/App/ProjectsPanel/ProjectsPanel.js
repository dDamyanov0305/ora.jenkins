import React from 'react';
import routeStore from '../../Stores/RouteStore';
import { observer } from 'mobx-react';
import projectStore from '../../Stores/ProjectStore';

const ProjectsPanel = observer(() => 
    <div>
        { projectStore.projects.map(project => <ProjectCard key={project._id} project={project}/>) }
        <NewProjectCard/>
    </div>
)

const ProjectCard = observer(({project}) => (
    <div>
        <button onClick={() => projectStore.selectProject(project)}>{project.name}</button> 
        <button onClick={() => projectStore.delete(project)}>delete</button> 
    </div>
))

const NewProjectCard = () => (
    <button onClick={()=>routeStore.push("/project/create")}>create new project</button>
)


export default ProjectsPanel