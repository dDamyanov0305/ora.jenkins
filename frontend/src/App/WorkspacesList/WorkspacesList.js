import React from 'react';
import workspaceStore from '../../Stores/WorkspaceStore';
import { observer } from 'mobx-react';
import routeStore from '../../Stores/RouteStore';


const WorksapcesList = observer(() =>
    <div>
        {workspaceStore.workspaces.map(ws => 
            <button 
                key={ws.name}
                onClick={()=>{workspaceStore.selectWorkspace(ws)}}
            >
                {ws.name}
            </button>)
        }
        <button onClick={()=>routeStore.push("/workspace/create")}>new workspace</button>
    </div>
) 

export default WorksapcesList