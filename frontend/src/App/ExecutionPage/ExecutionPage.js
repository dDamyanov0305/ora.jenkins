import React from 'react'
import { observer } from 'mobx-react'
import routeStore from '../../Stores/RouteStore'
import projectStore from '../../Stores/ProjectStore'
import pipelineStore from '../../Stores/PipelineStore'
import ActionsPanel from '../ActionsPanel/ActionsPanel'
import ExecutionsPanel from '../ExecutionsPanel/ExecutionsPanel'
import { Route, Switch } from 'react-router'
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore'
import actionStore from '../../Stores/ActionStore'

const ExecutionPage = observer(() => 
    <div>
        {pipelineExecutionStore.execution.action_executions.map(action_execution=>
            <div>
                <p onClick={actionStore.selectAction(action_execution.action)}>
                    {action_execution.action.name}
                </p>
                <p>{action_execution.status}</p>
                <p>{action_execution.log}</p>
            </div>
        )}
    </div>

)

export default ExecutionPage