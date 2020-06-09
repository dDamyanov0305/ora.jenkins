import React from 'react';
import { observer } from 'mobx-react';
import actionStore from '../../Stores/ActionStore';
import actionFormStore from '../../Stores/ActionFormStore';
import routeStore from '../../Stores/RouteStore';
import './style.css'
import { Link } from 'react-router-dom';
import pipelineStore from '../../Stores/PipelineStore';


const ActionsPanel = observer(() =>{

    let view = []

    for(let i = 0; i <= actionStore.actions.length; i++){
        let action = actionStore.actions[i] || null
        let prev = actionStore.actions[i-1]?._id || null
        let next = action?._id || null
        view.push(
            <>
                <ActionLink prev={prev} next={next}/>
                {
                    action &&
                    <div class="actions-sequence"> 

                        <ActionLink prev={prev} next={next}/>

                        <div class="action" onClick={() =>  actionStore.selectAction(action)}>
                            test:{action.name}
                            <i class="fas fa-vial"></i>
                        </div>

                        <ActionLink prev={prev} next={next}/>

                    </div>
                    
                }
                {/* <button onClick={() =>  actionStore.delete(action)}>delete</button> */}
            </>
        )
    }

    return (
    <div class="action-container-column">
        <div class="action">
            build
            <i class="fas fa-cogs"></i>
        </div>
        {view}
        {pipelineStore.currentPipeline.push_image &&
        <div class="action">
            docker Hub
            <i class="fab fa-docker"></i>
        </div>}
        {pipelineStore.currentPipeline.emailing &&
        <div class="action">
            emailing
            <i class="fas fa-envelope-open-text"></i>
        </div>}
    </div>
    )

})

const ActionLink = ({prev, next}) =>
    <div class="action-link" onClick={()=>{
        actionFormStore.setPos(prev,next)
        routeStore.push("/actions/create")
    }}>
        <i class="far fa-plus-hexagon fa-2x"></i>
    </div>

export default ActionsPanel