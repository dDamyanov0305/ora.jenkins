import React from 'react';
import { observer } from 'mobx-react';
import loginRegisterStore from '../../Stores/LoginRegisterStore';
import pipelineFormStore from '../../Stores/PipelineFormStore';
import Input from '../../Shared/Input/Input'
import './style.css'


const PipelineForm = observer(() => 
    <div class="pipeline-form-container">
        <div class="pipeline-form-center-col">
            <p>{pipelineFormStore.errorText}</p>
            <form onSubmit={pipelineFormStore.submit}>
                <Input onChange={pipelineFormStore.handleChange} value={pipelineFormStore.data.name} label="name"/>
                <TriggerModeRadio/>
                <BranchesSelect/>
                <Input onChange={pipelineFormStore.handleChange} value={pipelineFormStore.data.workdir} label="workdir" />
                <PushImageOption/>
                <EmailingOption/>
                <input class="btn" type="submit" value="Create"/>      
            </form>
        </div>
    </div>
)


const TriggerModeRadio = observer(() => 
<>
    <div class="radio-form">
        <div class={`radio-option ${pipelineFormStore.data.trigger_mode === "MANUAL" && "clicked"}`} onClick={()=>pipelineFormStore.selectTriggerMode("MANUAL")}>
            <i class="fal fa-hand-pointer fa-2x"></i>
            MANUAL
        </div>
        <div class={`radio-option ${pipelineFormStore.data.trigger_mode === "PUSH" && "clicked"}`} onClick={()=>pipelineFormStore.selectTriggerMode("PUSH")}>
            <i class="fal fa-laptop-code fa-2x"></i>
            PUSH
        </div>
        <div class={`radio-option ${pipelineFormStore.data.trigger_mode === "RECURRENT" && "clicked"}`} onClick={()=>pipelineFormStore.selectTriggerMode("RECURRENT")}>
            <i class="fal fa-repeat-alt fa-2x"></i>
            CRON
        </div>
    </div>
    {pipelineFormStore.data.trigger_mode === 'RECURRENT' &&
    <Input onChange={pipelineFormStore.handleChange} value={pipelineFormStore.data.cron_date} label="cron_date" />}
</>
)

const BranchesSelect = observer(() =>
    <div class="wrap" style={{marginBottom:'1.5rem'}}>
        <label >
            Select working branch
        </label>
        <div class="select">
            <div onClick={pipelineFormStore.showBranches}>
                {pipelineFormStore.data.branch}
                <i class="fas fa-sort-down "></i>
            </div>
            <div class="options-container" ref={pipelineFormStore.branchesContainerRef} >
                {pipelineFormStore.branches.map(branch => 
                    <div class="select-row" onClick={()=>pipelineFormStore.selectBranch(branch)}>{branch}</div>
                )}
            </div>
        </div>
    </div>
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
                <Input onChange={pipelineFormStore.handleChange} value={pipelineFormStore.data.docker_user} label="docker_user" />
                <Input onChange={pipelineFormStore.handleChange} value={pipelineFormStore.data.docker_password} label="docker_password" password/>
                <Input onChange={pipelineFormStore.handleChange} value={pipelineFormStore.data.docker_repository} label="docker_repository" />
                <Input onChange={pipelineFormStore.handleChange} value={pipelineFormStore.data.docker_image_tag} label="docker_image_tag" />
            </div>
    

        }
    </div>
)

const EmailingOption = observer(()=>
<div class="wrap">
    <label>
        
        <input type="checkbox" name="emailing" onChange={pipelineFormStore.handleChange}/>
        Send emails after execution
    </label>  
    {
        pipelineFormStore.data.emailing &&
        <div class="select">
            <div onClick={pipelineFormStore.showEmailTimes}>
                {pipelineFormStore.data.email_time.split('_').join(' ')}
                <i class="fas fa-sort-down"></i>
            </div>
            <div class="options-container" ref={pipelineFormStore.emailingRef}>
                <div class="select-row" onClick={()=>pipelineFormStore.selectEmailTime("ON_EVERY_EXECUTION")}>send notifications every time</div>
                <div class="select-row" onClick={()=>pipelineFormStore.selectEmailTime("ON_SUCCESS")}>send notifications if successful</div>
                <div class="select-row" onClick={()=>pipelineFormStore.selectEmailTime("ON_FAILURE")}>send notifications if failed</div>
            </div>
        </div>          
    }
</div>
)

export default PipelineForm