import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore';
import StatusBadge from '../../Shared/StatusBadge/StatusBadge'
import TriggerMode from '../../Shared/TriggerMode/TriggerMode'
import moment from 'moment'
import './style.css'

const ExecutionsPanel = observer(() =>
    <div className="pipelines-container">
        <table >
            <thead>
                <tr>
                    <th>execution</th>
                    <th>status</th>
                    <th>triggering</th>
                    <th>comment</th>
                    <th>commit</th>
                    <th>started</th>
                    <th>run</th>
                </tr>
            </thead>
            <tbody>
                {pipelineExecutionStore.pipeline_executions.map((execution,index) => <ExecutionCard index={index} key={execution._id} execution={execution}/>)}
            </tbody>
        </table>
    </div> 
)

const ExecutionCard = observer(({execution, index}) => (
    <tr class="pipeline-row" onClick={() => pipelineExecutionStore.selectExecution(execution)}>
        
        <td><b>{pipelineStore.currentPipeline.name}#{pipelineExecutionStore.pipeline_executions.length-index}</b></td>

        <td><StatusBadge status={execution.status.toLowerCase()}/></td>

        <td><TriggerMode mode={execution.trigger_mode}/></td>

        <td class="comment-td">
            <div class="comment">{execution.comment}</div>
        </td>

        <td>
            <div className="commit">
                <div>
                    <i class="fas fa-code-commit"></i>
                    <span>{execution.revision.sha.substring(0,7)}</span>
                </div>
                <span>{execution.revision.message}</span>
            </div>
        </td>

        <td>{moment(execution.date).fromNow()}</td>

        <td onClick={(e) =>{ e.stopPropagation(); pipelineExecutionStore.rerun(execution) }}>
            <i class="fal fa-play-circle fa-3x"></i>
            <i class="fas fa-play-circle hidden fa-3x"></i>
        </td>
    </tr>
))

  


export default ExecutionsPanel