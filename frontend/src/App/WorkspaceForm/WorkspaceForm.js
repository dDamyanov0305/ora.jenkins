import React from 'react'
import { observer } from 'mobx-react'
import workspaceFormStore from '../../Stores/WorkspaceFormStore'
import { observable } from 'mobx'
import Modal from '../../Shared/Modal/Modal'

const WorkspaceForm = observer(()=>(
    <div>
        {workspaceFormStore.errorText}
        {workspaceFormStore.step === 1 ? <WorkspaceNameForm/> : <EamilInvites/>}
    </div>
))

const WorkspaceNameForm = observer(()=>(
    <form onSubmit={workspaceFormStore.handleSubmit}>
        <input type="text" name="name" value={workspaceFormStore.name} onchange={workspaceFormStore.handleChange}/>
        <input type="submit" value="create"/>
    </form>
))

const EamilInvites = observer(()=>(
    <div>
        <input type="text" name="email" value={workspaceFormStore.email} onchange={workspaceFormStore.handleChange}/>    
        <button onClick={workspaceFormStore.sendInvite}>send invite</button>

        <button onClick={workspaceFormStore.getOrganizationMembers}>invite from ora</button>

        <Modal show={workspaceFormStore.showModal}>
            <Organizations/>
            <Members/>
            <button onClick={workspaceFormStore.sendInvites }>send invites</button>
            <button onClick={workspaceFormStore.closeModal}>close</button>
        </Modal>

        {workspaceFormStore.invited.map(email => <p key={email}>{email}</p>)}
    </div>
))

const Members = observer(()=>
    <>
        <div className="section">
            {workspaceFormStore.members.map(member => <Member member={member}/>)}
        </div>
        {workspaceFormStore.members.length!==0 && <button onClick={workspaceFormStore.selectAll}>select all</button>}
    </>
)

const Organizations = observer(()=>
    <div className="section">
        {workspaceFormStore.organizations.map(org => <Organization organization={org}/>)}
    </div>
)

const Organization = observer(({organization})=>{
    const className = workspaceFormStore.organization_id === organization.id ? "selected" : ""
    return(
        <div 
            className={className}
            key={organization.id} 
            onClick={()=>workspaceFormStore.selectOrganization(organization.id)}
        >
            {organization.name}
        </div>
    )
})


const Member = observer(({member})=>{
    const className = workspaceFormStore.toInvite.includes(member.email) ? "selected" : ""
    return(
        <div 
            className={className}
            key={member.id} 
            onClick={()=>workspaceFormStore.addToInvite(member.email)}
        >
            {member.full_name}
        </div>
    )
})



export default WorkspaceForm