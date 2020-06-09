import pipelineFormStore from "../../Stores/PipelineFormStore";
import loginRegisterStore from "../../Stores/LoginRegisterStore";
import React from 'react'
import { observer } from "mobx-react";
import './input.css'

const Input = observer(({value, label, password, onChange, force})=>
<div class="input-div one">
    <div>
        <p>{label}</p>
        <input 
            type={password? "password":"text"} 
            name={label} 
            class="input" 
            value={pipelineFormStore.allowValue[label] || force? value : ''} 
            onChange={onChange}
            onFocus={loginRegisterStore.handleFocus}
            onBlur={loginRegisterStore.handleBlur}
        />
    </div>
</div>
)

export default Input