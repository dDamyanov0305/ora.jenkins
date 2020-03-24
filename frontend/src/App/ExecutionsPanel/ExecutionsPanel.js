import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import routeStore from '../../Stores/RouteStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore';
import moment from 'moment'
import projectStore from '../../Stores/ProjectStore';

const ExecutionsPanel = observer(() => 
    <div>
        {pipelineExecutionStore.executions.map(execution => <ExecutionCard key={execution._id} execution={execution}/>)}

    </div>
)

const ExecutionCard = observer(({execution}) => {

    const {pipeline_execution, action_executions} = execution
    const {executor, date, comment, status} = pipeline_execution

    return (
        <div onClick={()=> pipelineExecutionStore.selectExecution(execution)}>
            <p>{executor}</p>
            <p>{moment(date).format("DD MMM h:mm A")}</p>
            <p>{comment}</p>
            <p>{status}</p>
        </div>
    )
})


export default ExecutionsPanel