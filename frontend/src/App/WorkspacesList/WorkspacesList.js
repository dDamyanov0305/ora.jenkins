import React from 'react';
import workspaceStore from '../../Stores/WorkspaceStore';
import { observer } from 'mobx-react';


const WorksapcesList = observer(() =>
    <ul>
        {workspaceStore.workspaces.map(ws => 
            <li 
                key={ws.name}
                onClick={()=>{workspaceStore.selectWorkspace(ws)}}
            >
                {ws.name}
            </li>)
        }
    </ul>
) 


const OraIntegration = () => {

    function openLink() {      
        window.open(`https://ora.pm/authorize?client_id=${process.env.REACT_APP_ORA_OAUTH_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_SERVER_ADDRESS}/ora/oauth&response_type=code`,'_self')    
    }

    return <p onClick={openLink}>ora</p>
}

export default WorksapcesList