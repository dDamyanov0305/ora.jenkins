import React from 'react';
import providerStore from '../../Stores/ProviderStore';
import { observer } from 'mobx-react';

const ProvidersPanel = observer(() => 
    <ul>{providerStore.providers.map(provider => <ProviderCard provider={provider}/>)}</ul>
)

const ProviderCard = observer(({provider}) => 
    <li key={provider.name} onClick={()=>providerStore.selectProvider(provider)}>{provider.name}</li>
)

const ProjectForm = observer(() => 
    <div>
        {providerStore.errorText}
        <ProvidersPanel/>
        {providerStore.step === 2 && providerStore.repos.map(repo => <button key={repo.name} onClick={()=>providerStore.selectRepo(repo)}>{repo.name}</button>)}
    </div>
)

export default ProjectForm
