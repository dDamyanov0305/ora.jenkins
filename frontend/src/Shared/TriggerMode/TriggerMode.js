import React from 'react'
import {observer} from 'mobx-react'

const TriggerMode = observer(({mode}) => {
    let icon;
    switch(mode){
       case 'MANUAL' : icon = 'fa-hand-pointer'; break;
       case 'PUSH' : icon = 'fa-laptop-code'; break;
       case 'RECURRENT' : icon = 'fa-repeat-alt'; break;
    }

    let text = mode ==='RECURRENT'?'CRON':mode
    return( 
    <div class='radio-option'>
        <i class={`fal ${icon}`}></i>
        <span>{text}</span>
    </div>)}
)

export default TriggerMode