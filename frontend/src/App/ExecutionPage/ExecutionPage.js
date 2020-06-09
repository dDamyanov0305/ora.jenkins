import React from 'react'
import { observer } from 'mobx-react'
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore'
import actionStore from '../../Stores/ActionStore'

const ExecutionPage = observer(() => 
    <div>
        {pipelineExecutionStore.action_executions.map(action_execution=>
            <div>
                <p onClick={() => actionStore.selectAction(action_execution.action)}>
                    {action_execution.action.name}
                </p>
                <p>{action_execution.status}</p>
                <p>{action_execution.log}</p>
            </div>
        )}
    </div>

)

export default ExecutionPage