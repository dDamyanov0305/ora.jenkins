import React from 'react'
import { observer } from 'mobx-react'
import workspaceFormStore from '../../Stores/WorkspaceFormStore'

const WorkspaceForm = observer(()=>(
    <div>
        {workspaceFormStore.errorText}
        {workspaceFormStore.step === 1 ? 
            <form onSubmit={workspaceFormStore.handleSubmit}>
                <input type="text" name="name" value={workspaceFormStore.name} onchange={workspaceFormStore.handleNameChange}/>
                <input type="submit" value="create"/>
            </form>
            :
            <div>
                {workspaceFormStore.invited.map(email => 
                    <p key={email}>{email}</p>
                )}
                <input type="text" name="email" value={workspaceFormStore.email} onchange={workspaceFormStore.handleEmailChange}/>    
                <button onClick={workspaceFormStore.getOrganizationMembers}>invite from ora</button>
                {workspaceFormStore.organizationMembers.map(member => 
                    <div key={member.id} onClick={()=>workspaceFormStore.invite(member.email)}>{member.name}</div>
                )}
            </div>
        }
    </div>
))

export default WorkspaceForm