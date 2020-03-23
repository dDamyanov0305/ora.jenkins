import React from 'react';
import { observer } from 'mobx-react';
import loginRegisterStore from '../../Stores/LoginRegisterStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';

const PipelineForm = observer(() => 
    <div>
        <p>{pipelineFormStore.errorText}</p>
        <form onSubmit={pipelineFormStore.submit}>
            <input type="text" placeholder="name" name="name" value ={pipelineFormStore.data.name} onChange={pipelineFormStore.handleChange}/>
            <TriggerModeRadio/>
            <BranchesSelect/>
            <PushImageOption/>
            <EmailingOption/>
            <br/> 
            <input type="submit" value="Create"/>      
        </form>
    </div>
)

const TriggerModeRadio = observer(() => 
    <div>
        <label>
            <input type="radio" name="trigger_mode" value="MANUAL" onChange={pipelineFormStore.handleChange}/>
            MANUAL
        </label><br/>
        <label>
            <input type="radio" name="trigger_mode" value="PUSH" onChange={pipelineFormStore.handleChange}/>
            PUSH
        </label><br/>
        <label>
            <input type="radio" name="trigger_mode" value="RECURRENT" onChange={pipelineFormStore.handleChange}/>
            RECURRENT
        </label><br/>
        {
            pipelineFormStore.data.trigger_mode === 'RECURRENT' &&
    
            <label>
                Cron format
                <input type="text" name="cron_date" value={pipelineFormStore.data.cron_date} onChange={pipelineFormStore.handleChange}/>
            </label>
        }
    </div>
)

const BranchesSelect = observer(() =>
    <label>
        Select working branch
        <select name="branch" value={pipelineFormStore.data.branch} onChange={pipelineFormStore.handleChange}>
            {pipelineFormStore.branches.map(branch => <option value={branch}>{branch}</option>)}
        </select>
    </label>
)

const PushImageOption = observer(() => 
    <div>
        <label>
            <input type="checkbox" name="push_image" checked={pipelineFormStore.data.push_image} onChange={pipelineFormStore.handleChange}/>
            Build and push image after execution
        </label><br/>
        {
            pipelineFormStore.data.push_image &&
            <div>
                <label>
                    Username
                    <input type="text" name="docker_user" value={pipelineFormStore.data.docker_user} onChange={pipelineFormStore.handleChange}/>
                </label>

                <label>
                    Password
                    <input type="password" name="docker_password" value={pipelineFormStore.data.docker_password} onChange={pipelineFormStore.handleChange}/>
                </label>
                <br/>
                <label>
                    Dockerhub repository
                    <input type="text" name="docker_repository" value={pipelineFormStore.data.docker_repository} onChange={pipelineFormStore.handleChange}/>
                </label>

                <br/>

                <label>
                    Image tag
                    <input type="text" name="docker_image_tag" value={pipelineFormStore.data.docker_image_tag} onChange={pipelineFormStore.handleChange}/>
                </label>
            </div>
    

        }
    </div>
)

const EmailingOption = observer(()=>
    <label>
        <input type="checkbox" name="emailing" id="emailing" onChange={pipelineFormStore.handleChange}/>
        Send emails after execution
        {
            pipelineFormStore.data.emailing &&
            <select name="email_time" value={pipelineFormStore.data.email_time} onChange={pipelineFormStore.handleChange}>
                <option value="ON_EVERY_EXECUTION">send notifications every time</option>
                <option value="ON_SUCCESS">send notifications if successful</option>
                <option value="ON_FAILURE">send notifications if failed</option>
            </select>            
        }
    </label>  
)

export default PipelineForm