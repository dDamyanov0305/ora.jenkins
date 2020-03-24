import React from 'react'
import { observer } from 'mobx-react'
import routeStore from '../../Stores/RouteStore'
import projectStore from '../../Stores/ProjectStore'
import pipelineStore from '../../Stores/PipelineStore'
import ActionsPanel from '../ActionsPanel/ActionsPanel'
import ExecutionsPanel from '../ExecutionsPanel/ExecutionsPanel'
import { Route, Switch } from 'react-router'

const PipelinePage = observer(() => 
    <div>
        <button onClick={()=>routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/actions`)}>Actions</button>
        <button onClick={()=>routeStore.push(`/project/${projectStore.currentProject.name}/pipelines/${pipelineStore.currentPipeline.name}/executions`)}>Executions</button>
        <Switch>
            <Route path="/project/:project_name/pipelines/:pipeline_name/actions" component={ActionsPanel}/>
            <Route path="/project/:project_name/pipelines/:pipeline_name/executions" component={ExecutionsPanel}/>
        </Switch>
    </div>

)

export default PipelinePage