import React from 'react'
import { observer } from 'mobx-react'
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore'
import actionStore from '../../Stores/ActionStore'
import "./style.css"

const ExecutionPage = observer(() => 
    <div class="execution-container">
        {pipelineExecutionStore.action_executions.map(action_execution=>
            <div>
                <p onClick={() => actionStore.selectAction(action_execution.action)}>
                    {action_execution.action.name}
                </p>
                <p>{action_execution.status}</p>
                <div>{action_execution.log}</div>
            </div>
        )}
    </div>

)

export default ExecutionPage