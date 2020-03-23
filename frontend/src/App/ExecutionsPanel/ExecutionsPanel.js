import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import routeStore from '../../Stores/RouteStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore';

const ExecutionsPanel = observer(() => 
    <div>
        {pipelineExecutionStore.executions.map(execution => <ExecutionCard key={execution._id} execution={execution}/>)}

    </div>
)

const ExecutionCard = observer(({execution}) => (
    <div>
        
    </div>
))


export default ExecutionsPanel