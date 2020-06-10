import React from 'react';
import providerStore from '../../Stores/ProviderStore';
import { observer } from 'mobx-react';
import './style.css'

const ProjectForm = observer(() =>
    <div class="project-form">
        {/* {providerStore.errorText} */}
        <label class="select">
        <h2>Create a new project</h2>
            <div className="label">providers</div>
                <div class="select-row noHover commit" onClick={providerStore.openOptions}>
                    <span>
                        <ProviderIcon/>
                    </span>
                    <span class="commits-item">
                        <div>{providerStore.currentProvider.name}</div>
                        <div>connect to {providerStore.currentProvider?.name?.toLowerCase()} repository</div>
                    </span>
                </div>
            <div class="options-container commit" ref={providerStore.providersRef}>
                {providerStore.providers.map(provider => 
                    <div class="select-row commit" onClick={()=>providerStore.selectProvider(provider)}>
                        <span>
                            <i class={`fab fa-${provider.name.toLowerCase()} fa-w-16 fa-2x`}></i>
                        </span>
                        <span class="commits-item">
                            <div>{provider.name}</div>
                            <div>connect to {provider.name.toLowerCase()} repository</div>
                        </span>
                    </div>
                    )}   
            </div>
        {providerStore.step === 2 && 
            <RepositoryList/>
        }
        </label>
    </div>
)

const ProviderIcon = observer(()=>{
    switch(providerStore.currentProvider.name){
        case 'GITHUB': return <i className='fab fa-github fa-w-16 fa-2x'></i>
        case 'GITLAB': return <i className='fab fa-gitlab fa-w-16 fa-2x'></i>
        case 'BITBUCKET': return <i className='fab fa-bitbucket fa-w-16 fa-2x'></i>
    }
})

const RepositoryList = observer(() => 
    <div class="repos">
        <div class="badge-full">Personal</div>
        {providerStore.personal_repos.map(repo => 
            <div key={repo.name} class="repo-row" onClick={()=>providerStore.selectRepo(repo)}>
                {repo.name}
            </div>
        )}
        {/* <div class="badge-full">Organization</div>
        {providerStore.organization_repos.map(repo => <button key={repo.name} onClick={()=>providerStore.selectRepo(repo)}>{repo.name}</button>)} */}

    </div>
)

export default ProjectForm
