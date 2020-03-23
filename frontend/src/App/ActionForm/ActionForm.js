import React from 'react';
import routeStore from '../../Stores/RouteStore';
import { observer } from 'mobx-react';
import actionStore from '../../Stores/ActionStore';
import actionFormStore from '../../Stores/ActionFormStore'

const ActionForm = observer(() => 
    <form onSubmit={actionFormStore.submit}>
        <p>{actionFormStore.errorText}</p>

        <label>
            <div>name</div>
            <input type="text" name="name" value={actionFormStore.data.name} onChange={actionFormStore.handleChange}/>  
        </label><br/>

        <label>
            <input type="checkbox" name="shell_script" checked={actionFormStore.data.shell_script} onChange={actionFormStore.handleChange}/>
            execute commands from shell script
        </label><br/>

        <div>
            {
                actionFormStore.data.shell_script ? 
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

        <label>
            <div>image</div>
            <input type="text" name="docker_image_name" value={actionFormStore.data.docker_image_name} onChange={actionFormStore.handleChange}/>
        </label>

        <label>
            <div>version</div>
            <input type="text" name="docker_image_tag" value={actionFormStore.data.docker_image_tag} onChange={actionFormStore.handleChange}/>
        </label><br/>

        {
            actionFormStore.data.variables.map(({key, value})=>
                <p onClick={()=>actionFormStore.editVariable(key, value)}>{key}: {value}</p>
            )
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
        <br/>

        <label>
            <input type="checkbox" name="task_linkage" checked={actionFormStore.data.task_linkage} onChange={actionFormStore.checkTaskLinkage}/>
            link action to ora task
        </label><br/>

        <div>
            {
                actionFormStore.data.task_linkage &&
                <>
                    <div>
                        <h3>select project</h3>
                        {actionFormStore.projects.map(project => 
                            <p onClick={() => actionFormStore.selectProject(project)}>{project.title}</p>)
                        }
                    </div>
                    <div>
                        <h3>select task</h3>
                        {actionFormStore.tasks.map(task => 
                            <p onClick={() => actionFormStore.selectTask(task)}>{task.title}</p>)
                        }
                    </div>
                    <div>
                        <h3>select list on success</h3>
                        {actionFormStore.lists.map(list => 
                            <p onClick={() => actionFormStore.selectOnSuccessList(list)}>{list.title}</p>)
                        }
                    </div>
                    <div>
                        <h3>select list on failure</h3>
                        {actionFormStore.lists.map(list => 
                            <p onClick={() => actionFormStore.selectOnFailureList(list)}>{list.title}</p>)
                        }
                    </div>
                </>
            }
        </div>

        <input type="submit" value="create action"/>       
    </form>
)

export default ActionForm