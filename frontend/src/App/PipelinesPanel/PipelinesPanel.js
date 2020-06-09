import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import routeStore from '../../Stores/RouteStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';
import Modal from '../../Shared/Modal/Modal'
import runPipelineStore from '../../Stores/RunPipelineStore';
import './style.css'

const PipelinesPanel = observer(() =>
    <div className="pipelines-container">
        <table >
            <thead>
                <tr>
                    <th>pipeline</th>
                    <th>name</th>
                    <th>status</th>
                    <th>branch</th>
                    <th>comment</th>
                    <th>commit</th>
                    <th>started</th>
                    <th>run</th>
                </tr>
            </thead>
            <tbody>
                {pipelineStore.pipelines.map(pipeline => <PipelineCard key={pipeline._id} pipeline={pipeline}/>)}
            </tbody>
            <RunPipelineModal/>
        </table>
    </div> 
)

const PipelineCard = observer(({pipeline}) => (
    <tr class="pipeline-row" onClick={() => pipelineStore.selectPipeline(pipeline)}>
        <td><b>#1234</b></td>
        <td>{pipeline.name}</td>
        <td><StatusBadge status={pipeline.last_exec?.status || 'success'}/></td>

        <td>
            <Branch branch={pipeline.branch}/>
        </td>

        <td class="comment-td">
            <div class="comment">
                {pipeline.last_exec?.comment || "препаре фор ежацуатион имедиатели"}
            </div>
        </td>

        <td>
            <div className="commit">
                <div>
                    <i class="fas fa-code-commit"></i>
                    <span>{pipeline.last_exec?.commit || "fa60b43"}</span>
                </div>
                <span>Update runtime dependancy</span>
            </div>
        </td>

        <td>{pipeline.last_exec?.date || "8 hours ago"}</td>

        <td onClick={(e) =>{ e.stopPropagation(); runPipelineStore.setPipeline(pipeline)}}>
            <i class="fal fa-play-circle fa-3x"></i>
            <i class="fas fa-play-circle hidden fa-3x"></i>
        </td>
        {/* <p onClick={() => pipelineStore.delete(pipeline)}>delete</p>     */}
    </tr>
))

const RunPipelineModal = observer(() => 
    <Modal show={runPipelineStore.showModal}>
        
        <div class="run-modal">
            <div>
                <h1>Run {runPipelineStore.pipeline?.name}</h1>
                <label class="select">
                    <div onClick={runPipelineStore.closeCommits} className="label">revision</div>
                    <div ref={runPipelineStore.revisionRef} className="revision" onClick={runPipelineStore.openCommits}>
                        <i class="far fa-code-commit"></i>
                        <span>#{runPipelineStore.data.revision.sha?.substring(0,7)}</span>
                        <span>/{runPipelineStore.data.revision.message}</span>
                    </div>
                    <div ref={runPipelineStore.commitsRef} class="options-container commit">
                        
                            {runPipelineStore.commits.map(commit => 
                            <div class="select-row commit" onClick={()=>runPipelineStore.selectCommit(commit)}>
                                <span>
                                    {runPipelineStore.data.revision.sha == commit.sha? <i class="fad fa-dot-circle"></i> : <i class="fal fa-circle"></i>}
                                </span>
                                <span class="commits-item">
                                    <div>#{commit.sha.substring(0,7)}</div>
                                    <div>{commit.message}</div>
                                </span>
                            </div>
                            )}
                        
                    </div>
                </label>
                <div className="label">comment</div>
                <textarea placeholder="Describe changes to this build..." name="comment" value={runPipelineStore.data.comment} onChange={runPipelineStore.handleChange}/>
            </div>

            <div class="modal-actions">
                <button class="close btn"onClick={runPipelineStore.closeModal}>close</button>
                <button class="run btn" onClick={runPipelineStore.run}>run</button>
            </div>
        </div>
    </Modal>
)

const StatusBadge = ({status}) => 
{
    switch(status){
        case 'success' : return <SuccessBagde status={status}/>
        case 'failed' : return <FailedBagde status={status}/>
        default : return <NeutralBagde status={status}/>
    }
}
 const SuccessBagde = ({status}) =>   
    <div class="badge green">
        <i class="fas fa-check-circle"></i>
        <span>{status}</span>
    </div>

const FailedBagde = ({status}) =>   
    <div class="badge red">
        <i class="fas fa-exclamation-circle"></i>
        <span>{status}</span>
    </div>

const NeutralBagde = ({status}) =>   
    <div class="badge dark">
        <i class="fas fa-minus-circle"></i>
        <span>{status}</span>
    </div>

const Branch = ({branch})  =>   
<div class="branch">
    <i class="fal fa-code-branch"></i>
    <span>{branch}</span>
</div>
    

export default PipelinesPanel