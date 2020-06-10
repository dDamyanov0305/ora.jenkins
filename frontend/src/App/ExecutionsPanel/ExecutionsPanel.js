import React from 'react';
import { observer } from 'mobx-react';
import pipelineStore from '../../Stores/PipelineStore';
import pipelineExecutionStore from '../../Stores/PipelineExecutionStore';
import StatusBadge from '../../Shared/StatusBadge/StatusBadge'
import TriggerMode from '../../Shared/TriggerMode/TriggerMode'
import moment from 'moment'
import './style.css'
import Modal from '../../Shared/Modal/Modal';

const ExecutionsPanel = observer(() =>
<>
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
                {pipelineExecutionStore.pipeline_executions?.map((execution,index) => <ExecutionCard index={index} key={execution._id} execution={execution}/>)}
            </tbody>
        </table>
    </div> 

    <Modal show={pipelineExecutionStore.showModal}>
        <div class="execution-modal">

          <div>
<h2>{pipelineStore.currentPipeline?.name}#{pipelineExecutionStore.pipeline_executions?.length-pipelineExecutionStore.selected_execution?.index}</h2>
          {
            pipelineExecutionStore.action_executions?.map(action_execution => <ActionExecution action_execution={action_execution}/>)
          }
          </div>
          <div class="modal-actions">
                <button class="close btn"onClick={pipelineExecutionStore.closeModal}>close</button>
            </div>
        </div>
    </Modal>
    </>
)

const ExecutionCard = observer(({execution, index}) => (
    <tr  onClick={() => pipelineExecutionStore.selectExecution({...execution,index})}>
        
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

const statusColor = (status) => {
    switch(status){
        case 'success': case 'successful': return 'green-border-left'
        case 'failed': return 'red-border-left'
        default: return 'black-border-left'
    }
}

const ActionExecution = observer(({action_execution})=>

    <div class={`action-execution ${statusColor(action_execution.status.toLowerCase())}`} onClick={(e)=> action_execution.status!=="NOT EXECUTED" && e.target.classList.toggle("show")}>
        <div>
            <p>{action_execution.action.name}</p>  
            {/* <p>{action_execution.duration && }</p> */}
        </div>
        <div class="log-container">
            {action_execution.log}
        </div>
    </div>
)

  


export default ExecutionsPanel