import React from 'react';
import { observer } from 'mobx-react';
import actionFormStore from '../../Stores/ActionFormStore'
import Modal from '../../Shared/Modal/Modal'
import './ActionForm.css'
import { observable } from 'mobx';

const ActionForm = observer(() => 
    <form onSubmit={actionFormStore.submit}>

        <p>{actionFormStore.errorText}</p>

        <label>
            <div>name</div>
            <input type="text" name="name" value={actionFormStore.data.name} onChange={actionFormStore.handleChange}/>  
        </label>
        
        <br/>

       <ShellScriptInput/>

        <label>
            <div>image</div>
            <input type="text" name="docker_image_name" value={actionFormStore.data.docker_image_name} onChange={actionFormStore.handleChange}/>
        </label>

        <label>
            <div>version</div>
            <input type="text" name="docker_image_tag" value={actionFormStore.data.docker_image_tag} onChange={actionFormStore.handleChange}/>
        </label>
        
        <br/>
       <VariablesInput/>
       <br/>

        <label>
            <input type="checkbox" name="task_linkage" checked={actionFormStore.data.task_linkage} onChange={actionFormStore.checkTaskLinkage}/>
            link action to ora task
        </label>

        {actionFormStore.data.task_linkage && 
            <button onClick={actionFormStore.openModal}>edit task linkage</button>
        }
        
        <br/>

        <TaskLInkageModal/>

        <input type="submit" value="create action"/>       
    </form>
)

const ShellScriptInput = observer(() => 
    <>
        <label>
            <input type="checkbox" name="shell_script" checked={actionFormStore.data.shell_script} onChange={actionFormStore.handleChange}/>
            execute commands from shell script
        </label>

        <br/>

        <div>
        {actionFormStore.data.shell_script ? 
            (<label>
                <div>execute script</div>
                <input type="file" name="execute_script" onChange={actionFormStore.handleFile} accept=".sh"/>
            </label>)
            :
            (<label>
                <div>execute commands</div>
                <textarea name="execute_commands" value={actionFormStore.data.execute_commands} onChange={actionFormStore.handleChange}/>
            </label>)
        }
        </div>
    </>
)
const VariablesInput = observer(() => 
    <div>
        {actionFormStore.data.variables.map(({key, value})=>
            <p onClick={()=>actionFormStore.editVariable(key, value)}>{key}: {value}</p>)
        }

        <label>
            <div>key</div>
            <input type="text" name="var_key" value={actionFormStore.data.var_key} onChange={actionFormStore.handleChange}/>
        </label>

        <label>
            <div>value</div>
            <input type="text" name="var_val" value={actionFormStore.data.var_val} onChange={actionFormStore.handleChange}/>
        </label>

        <button onClick={actionFormStore.addVariable}>add variable</button>
    </div>
)

const TaskLInkageModal = observer(() => 
    <Modal show={actionFormStore.showModal}>
        <div>
            <div className={`section ${actionFormStore.modalError === 1 && "border-glow"}`}>
                <h4>select project</h4>
                {actionFormStore.projects.map(project => 
                    <p className={project.id === actionFormStore.data.ora_project_id && "selected"} onClick={() => actionFormStore.selectProject(project)}>{project.title}</p>)
                }
            </div>
            <div className={`section ${actionFormStore.modalError === 2 && "border-glow"}`}>
                <h4>select task</h4>
                {actionFormStore.tasks.map(task => 
                    <p className={task.id === actionFormStore.data.ora_task_id && "selected"} onClick={() => actionFormStore.selectTask(task)}>{task.title}</p>)
                }
            </div>
            <div className={`section ${actionFormStore.modalError === 3 && "border-glow"}`}>
                <h4>select list on success</h4>
                {actionFormStore.lists.map(list => 
                    <p className={list.id === actionFormStore.data.ora_list_id_on_success && "selected"} onClick={() => actionFormStore.selectOnSuccessList(list)}>{list.title}</p>)
                }
            </div>
            <div className={`section ${actionFormStore.modalError === 4 && "border-glow"}`}>
                <h4>select list on failure</h4>
                {actionFormStore.lists.map(list => 
                    <p className={list.id === actionFormStore.data.ora_list_id_on_failure && "selected"} onClick={() => actionFormStore.selectOnFailureList(list)}>{list.title}</p>)
                }
            </div>
        </div>
        <div>
            <button onClick={actionFormStore.applyTaskLinkage}>apply</button>
            <button onClick={actionFormStore.dismissTaskLinkage}>close</button>
        </div>
    </Modal>
)

export default ActionForm