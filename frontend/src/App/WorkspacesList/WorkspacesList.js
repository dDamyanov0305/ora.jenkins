import React from 'react';
import { observer } from 'mobx-react';
import workspaceStore from '../../Stores/WorkspaceStore';
import routeStore from '../../Stores/RouteStore';

const WorksapcesList = observer(() =>
    <div>
        {workspaceStore.workspaces.map(workspace => 
            <WorkspaceFolder workspace={workspace}/>)
        }
        <button onClick={()=>routeStore.push("/workspace/create")}>new workspace</button>
    </div>
) 

const WorkspaceFolder = ({workspace}) =>
    <button key={workspace.id} onClick={()=>{workspaceStore.selectWorkspace(workspace)}}>
        {workspace.name}
    </button>

export default WorksapcesList