import React from 'react'
import { observer } from "mobx-react"
import routeStore from '../../Stores/RouteStore'
import { ReactComponent as AngleDouble} from './angle-double.svg'
import { CSSTransition } from 'react-transition-group';
import Modal from '../../Shared/Modal/Modal'
import sidebarStore from '../../Stores/SidebarStore'
import projectStore from '../../Stores/ProjectStore'
import pipelineFormStore from '../../Stores/PipelineFormStore'
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore';
import './style.css'    

const NavItem = observer(({overrideClass, addClass, children, onClick}) => 
    <li className={overrideClass || "nav-item"} onClick={onClick}>
        <a className={`nav-link ${addClass}`} >
            {children}
        </a>
    </li>
)

const SideBar = observer(({children})=>
    <nav 
        className="navbar" 
        ref={sidebarStore.navRef} 
        onMouseEnter={sidebarStore.sidebarMouseEnter}  
        onMouseLeave={sidebarStore.sidebarMouseLeve}
    >
        <ul className="navbar-nav">
            {children}
        </ul>
    </nav>
)

const ProjectsMenu = observer(({parentMenu})=>
    <CSSTransition 
    in={sidebarStore.activeMenu === 'projects'}
    timeout={500}
    unmountOnExit
    classNames="menu-secondary"
    >
        <div class="menu-wrapper">
            <NavItem onClick={(е) => sidebarStore.setMenu(е,parentMenu)}>
                <i class="fad fa-angle-right fa-w-16 fa-2x rotate-180"/>
                <span className="link-text ">Projects</span>
            </NavItem>
            {
                projectStore.projects.map(project =>
                    <NavItem 
                        addClass={projectStore.currentProject?.name === project.name && "hasHover"} 
                        onClick={() => projectStore.selectProject(project)}
                    >
                        <span className="link-text ">{project.name}</span>
                        <i class={`fab fa-${project.hosting_provider.toLowerCase()} fa-w-16 fa-2x project-type-icon`}></i>
                    </NavItem> 
                )
            }
        </div>
    </CSSTransition> 
)

const MainMenu = observer(()=>
    <CSSTransition 
        in={sidebarStore.activeMenu === 'main'}
        timeout={500}
        unmountOnExit
        classNames="menu-primary"
    >
        <div class="menu-wrapper">

            <NavItem>
                <i class="fad fa-users fa-w-16 fa-2x"></i>
                <span className="link-text ">Workspaces</span>
            </NavItem>

            <NavItem onClick={(e) => sidebarStore.setMenu(e,"projects")}>
                <i class="fad fa-folder-tree fa-w-16 fa-2x"></i>
                <span className="link-text ">Projects</span>
                <i class="fad fa-angle-right fa-w-16 fa-2x rotate arrow"/>
            </NavItem>


            <NavItem onClick={pipelineFormStore.openModal}>
                <i class="fad fa-layer-plus fa-w-16 fa-2x"></i>
                <span className="link-text">New Pipeline</span>
            </NavItem>

            <NavItem onClick={pipelineExecutionStore.getLatestExecutions}>
                <i class="fad fa-server fa-w-16 fa-2x"></i>
                <span className="link-text ">Builds</span>
            </NavItem>
        </div>
    </CSSTransition>
)

const MySideBar = observer(()=> 
    <SideBar >
        <NavItem overrideClass="logo" onClick={()=>routeStore.push('/projects')}>
            <span className="link-text  logo-text">ora.ci</span>
            <AngleDouble/>
        </NavItem>
        <MainMenu/>
        <ProjectsMenu parentMenu="main"/>
        <NavItem>
            <i class="fad fa-cog fa-w-16 fa-2x"></i>
            <i class="fad fa-door-open fa-w-16 fa-2x"></i>
            <i class="fad fa-palette fa-w-16 fa-2x"></i>
        </NavItem>
    </SideBar>
)

const TopNavBar = observer(({children})=>
    <nav 
        class="top-navbar" 
        ref={sidebarStore.topNavRef} 
        onMouseEnter={sidebarStore.topMouseEnter} 
        onMouseLeave={sidebarStore.topMouseLeave}
    >
        <ul class="top-navbar-nav">
            
        </ul>
        {children}
    </nav>
)

const Layout = observer(({children})=>
    routeStore.pathname !== '/login' && routeStore.pathname!=='/register' ?
        <>
            <NewPipelineProjectSelect/>
            <TopNavBar/>
            <MySideBar/>
            <main className="root" ref={sidebarStore.mainRef}>
                <div>
                    {children}
                </div>
            </main>
        </> : 
        children       
)

const NewPipelineProjectSelect = observer(()=>
<Modal show={pipelineFormStore.showModal}>
                <div class="new-pipeline-modal">
                    <div>

                        <h1>slelect project</h1>
                        <div class="new-pipeline-column-grid" >
                            {projectStore.projects.map(project =>
                                <div class={project._id === pipelineFormStore.project?._id && "green-higlight"} onClick={() => pipelineFormStore.setProject(project)}>
                                    <span>{project.name}</span>
                                    <i class={`fab fa-${project.hosting_provider.toLowerCase()} fa-w-16 fa-2x`}></i>
                                </div> 
                            )}
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="close btn"onClick={pipelineFormStore.closeModal}>close</button>
                        <button class="run btn" onClick={pipelineFormStore.go}>go</button>
                    </div>
                </div>
            </Modal>
)

export default Layout