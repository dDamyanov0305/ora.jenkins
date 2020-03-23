import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import routeStore from '../../Stores/RouteStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';

const PipelinesPanel = observer(() => 
    <div>
        {pipelineStore.pipelines.map(pipeline => <PipelineCard key={pipeline._id} pipeline={pipeline}/>)}
        <NewPipelineButton/>
    </div>
)

const PipelineCard = observer(({pipeline}) => (
    <div>
        <button onClick={() => pipelineStore.selectPipeline(pipeline)}>{pipeline.name}</button>
        <button onClick={() => pipelineStore.preRun(pipeline)}>run pipeline</button>
        <button onClick={() => pipelineStore.delete(pipeline)}>delete</button>    
    </div>
))

const NewPipelineButton = () => (
    <button onClick={()=>{
        routeStore.push("/pipeline/create")
        pipelineFormStore.getBranches()
    }}>
        create new pipeline
    </button>
)

export default PipelinesPanel