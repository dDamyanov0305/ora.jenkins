import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import routeStore from '../../Stores/RouteStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';
import Modal from '../../Shared/Modal/Modal'
import runPipelineStore from '../../Stores/RunPipelineStore';

const PipelinesPanel = observer(() => 
    <div>
        {pipelineStore.pipelines.map(pipeline => <PipelineCard key={pipeline._id} pipeline={pipeline}/>)}
        <NewPipelineButton/>
        <RunPipelineModal/>
    </div>
)

const PipelineCard = observer(({pipeline}) => (
    <div>
        <button onClick={() => pipelineStore.selectPipeline(pipeline)}>{pipeline.name}</button>
        <button onClick={() => runPipelineStore.setPipeline(pipeline)}>run pipeline</button>
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

const RunPipelineModal = observer(() => 
    <Modal show={runPipelineStore.showModal}>
        <input type="text" name="comment" value={runPipelineStore.data.comment} onChange={runPipelineStore.handleChange}/>
        <label>
            revision
            <select name="revision" value={runPipelineStore.data.revision} onChange={runPipelineStore.handleChange}>
                {runPipelineStore.commits.map(commit => <option value={commit.sha}>{`${commit.sha.substring(0,7)}/${commit.message}`}</option>)}
            </select>
        </label>
        <button onClick={runPipelineStore.run}>run</button>
        <button onClick={runPipelineStore.closeModal}>close</button>
    </Modal>
)

export default PipelinesPanel