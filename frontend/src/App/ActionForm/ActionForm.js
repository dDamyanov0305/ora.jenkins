import React from 'react';
import { observer } from 'mobx-react';
import actionFormStore from '../../Stores/ActionFormStore'
import Modal from '../../Shared/Modal/Modal'
import './ActionForm.css'
import { observable } from 'mobx';
import Input from '../../Shared/Input/Input'
import pipelineFormStore from '../../Stores/PipelineFormStore';
import pipelineStore from '../../Stores/PipelineStore';

const ActionForm = observer(() => 
<div class="action-form-container">

    <form onSubmit={actionFormStore.submit}>
        <h2>Action for "{pipelineStore.currentPipeline?.name}"</h2>
        <p>{actionFormStore.errorText}</p>
        <Input label="name"  value={actionFormStore.data.name} onChange={actionFormStore.handleChange}/>
        <ShellScriptInput/>        
        <VariablesInput/>
        <label>
            <input type="checkbox" name="task_linkage" checked={actionFormStore.data.task_linkage} onChange={actionFormStore.checkTaskLinkage}/>
            link action to ora task
        </label>
        {actionFormStore.data.task_linkage && 
        <span onClick={actionFormStore.openModal}>edit</span>
        }
        <TaskLinkageModal/>
        <input class="btn" type="submit" value="Create"/>     
    </form>
</div>
)

const ShellScriptInput = observer(() => 
    <>
        <label>
            <input type="checkbox" name="shell_script" checked={actionFormStore.data.shell_script} onChange={actionFormStore.handleChange}/>
            execute commands from shell script
        </label>

        <label>
        {actionFormStore.data.shell_script ? 
            <>
                <div>execute script</div>
                <input type="file" name="execute_script" onChange={actionFormStore.handleFile} accept=".sh"/>
            </>
            :
            <>
                <div>execute commands</div>
                <textarea placeholder="Enter commands to trigger tests" name="execute_commands" value={actionFormStore.data.execute_commands} onChange={actionFormStore.handleChange}/>
            </>
        }
        </label>

    </>
)
const VariablesInput = observer(() => 
    <div>
        {actionFormStore.data.variables.map((v, index)=>
            <div class="variables-container">
                <div>
                <Input force value={actionFormStore.data.variables[index].key} onChange={(e)=>actionFormStore.updateKey(e,index)}/>
                <Input force value={actionFormStore.data.variables[index].value} onChange={(e)=>actionFormStore.updateVal(e,index)}/>
                </div>
            </div>
        )}

            <div class="variables-container">
                <div>
                    <Input label="var_key"  value={actionFormStore.data.var_key} onChange={actionFormStore.handleChange}/>
                    <Input label="var_val"  value={actionFormStore.data.var_val} onChange={actionFormStore.handleChange}/>
                </div>
                <div class="add-btn" onClick={actionFormStore.addVariable}>add variable</div>
            </div>
    </div>
)

const computeClassName = (value) =>  {
	if(actionFormStore.modalError === value) {return "error"}
	else{
        switch(value){
			case 1: return actionFormStore.data.ora_project_id && "ok"
			case 2: return actionFormStore.data.ora_task_id && "ok"
			case 3: return actionFormStore.data.ora_list_id_on_success && "ok"
			case 4: return actionFormStore.data.ora_list_id_on_failure && "ok"
		}
	}
}

const TaskLinkageModal = observer(() => 
    <Modal show={actionFormStore.showModal}>
        <div class="action-form-modal">

        <div class="lists">
            <div>
				<div class={`title ${computeClassName(1)}`}>
                    <h4>select project</h4>
				</div>
				<div class="content">

                {actionFormStore.projects.map(project => 
                    <div className={project.id === actionFormStore.data.ora_project_id && "selected"} onClick={() => actionFormStore.selectProject(project)}>{project.title}</div>)
                }
				</div>
            </div>
            <div>
			    <div  class={`title ${computeClassName(2)}`}>
                    <h4>select task</h4>
				</div>
				<div class="content">

                {actionFormStore.tasks.map(task => 
                    <div className={task.id === actionFormStore.data.ora_task_id && "selected"} onClick={() => actionFormStore.selectTask(task)}>{task.title}</div>)
                }
				</div>
            </div>
            <div>
			    <div  class={`title ${computeClassName(3)}`}>
                    <h4>select list on success</h4>
				</div>
				<div class="content">

                {actionFormStore.lists.map(list => 
                    <div className={list.id === actionFormStore.data.ora_list_id_on_success && "selected"} onClick={() => actionFormStore.selectOnSuccessList(list)}>{list.title}</div>)
                }
				</div>
            </div>
            <div>
			    <div  class={`title ${computeClassName(4)}`}>
                    <h4>select list on failure</h4>
				</div>
				<div class="content">
                {actionFormStore.lists.map(list => 
                    <div className={list.id === actionFormStore.data.ora_list_id_on_failure && "selected"} onClick={() => actionFormStore.selectOnFailureList(list)}>{list.title}</div>)
                }
				</div>
            </div>
        </div>
        <div class="modal-actions">
            <button class="close btn"onClick={actionFormStore.closeModal}>close</button>
        </div>
        </div>
    </Modal>
)

export default ActionForm