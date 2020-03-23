import React from 'react';
import { observer } from 'mobx-react';
import actionStore from '../../Stores/ActionStore';
import actionFormStore from '../../Stores/ActionFormStore';
import routeStore from '../../Stores/RouteStore';



const ActionsPanel = observer(() =>{

    console.log(actionStore.actions)
    let view = []
    for(let i=0; i <= actionStore.actions.length; i++){
        let action = actionStore.actions[i] || null
        let prev = actionStore.actions[i-1]?._id || null
        let next = action?._id || null
        view.push(
            <div>
                <button onClick={()=>{
                    actionFormStore.setPos(prev,next)
                    routeStore.push("/actions/create")
                }}>
                    +
                </button><br/>
                {action && 
                <>
                    <button onClick={() =>  actionStore.selectAction(action)}>{action.name}</button>
                    <button onClick={() =>  actionStore.delete(action)}>delete</button>
                </>
                }

                
            </div>
        )
    }

    return view

})


export default ActionsPanel