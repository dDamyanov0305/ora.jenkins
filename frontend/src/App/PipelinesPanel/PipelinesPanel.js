import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import routeStore from '../../Stores/RouteStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';
import Modal from '../../Shared/Modal/Modal'
import runPipelineStore from '../../Stores/RunPipelineStore';
import moment from 'moment';
import StatusBadge from '../../Shared/StatusBadge/StatusBadge'
import TriggerMode from '../../Shared/TriggerMode/TriggerMode'
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
					<th>trigger</th>
                    <th>additions</th>
                    <th>started</th>
                    <th>run</th>
                </tr>
            </thead>
            <tbody>
                {pipelineStore.pipelines.map((pipeline,index) => <PipelineCard key={pipeline._id} index={index} pipeline={pipeline}/>)}
            </tbody>
            <RunPipelineModal/>
        </table>
    </div> 
)

const PipelineCard = observer(({pipeline, index}) => (
    <tr class="pipeline-row" onClick={() => pipelineStore.selectPipeline(pipeline)}>
        
		<td><b>#{pipelineStore.pipelines.length - index}</b></td>
        
		<td>{pipeline.name}</td>

        <td><StatusBadge status={pipeline.last_exec?.status.toLowerCase() || 'not executed'}/></td>

        <td><Branch branch={pipeline.branch}/></td>

        <td><TriggerMode mode={pipeline.trigger_mode}/></td>

		<td class="additions">
		    <i class="fas fa-cogs"></i>
			{pipeline.hasActions && <i class="fas fa-vial"></i>}
			{pipeline.push_image && <i class="fab fa-docker"></i>}
			{pipeline.emailing !== 'NEVER' && <i class="fas fa-envelope-open-text"></i>}
		</td>

        <td>{pipeline.last_exec?moment(pipeline.last_exec.date).fromNow() : "not executed"}</td>

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


const Branch = ({branch})  =>   
<div class="branch">
    <i class="fal fa-code-branch"></i>
    <span>{branch}</span>
</div>
    

export default PipelinesPanel