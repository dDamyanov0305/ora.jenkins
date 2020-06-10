import React from 'react'

const StatusBadge = ({status}) => 
{
    switch(status){
        case 'success' : case 'successful' : return <SuccessBagde/>
        case 'failed' : return <FailedBagde/>
        default : return <NeutralBagde status={status}/>
    }
}
 const SuccessBagde = ({status}) =>   
    <div class="badge green">
        <i class="fas fa-check-circle"></i>
        <span>success</span>
    </div>

const FailedBagde = ({status}) =>   
    <div class="badge red">
        <i class="fas fa-exclamation-circle"></i>
        <span>failed</span>
    </div>

const NeutralBagde = ({status}) =>   
    <div class="badge dark">
        <i class="fas fa-minus-circle"></i>
        <span>{status}</span>
    </div>


export default StatusBadge