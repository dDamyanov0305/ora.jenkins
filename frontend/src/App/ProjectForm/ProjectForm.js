import React from 'react';
import providerStore from '../../Stores/ProviderStore';
import { observer } from 'mobx-react';
import { integrationTypes } from '../../constants';
import providers from '../../Providers/Providers';
import './style.css'


const ProjectForm = observer(() =>
    <div class="project-form">

        { providerStore.errorText }

        <label class="select">

            <h2>
                Create a new project
            </h2>

            <div className="label">
                providers
            </div>

                <div class="select-row noHover commit" onClick={providerStore.openOptions}>
                    
                    <span>
                        <ProviderIcon/>
                    </span>

                    <span class="commits-item">

                        <div>
                            {providerStore.currentProvider.provider.name}
                        </div>

                        <div>
                            connect to {providerStore.currentProvider?.provider?.name?.toLowerCase()} repository
                        </div>

                    </span>

                </div>

            <div class="options-container commit" ref={providerStore.providersRef}>

                {Object.keys(providers).map(providerType => 
                
                <div class="select-row commit" onClick={()=>providerStore.selectProvider(providerType)}>
                    
                    <span>
                        <i class={`fab fa-${providerType.toLowerCase()} fa-w-16 fa-2x`}></i>
                    </span>
                    
                    <span class="commits-item">

                        <div>{providerType}</div>

                        <div>connect to {providerType.toLowerCase()} repository</div>
                    
                    </span>

                </div>

                )}   

            </div>

            {providerStore.step === 2 && <RepositoryList/>}
        
        </label>

    </div>
)


const ProviderIcon = observer(()=>{
    switch(providerStore.currentProvider.provider.name) {
        case integrationTypes.GITHUB: return <i className='fab fa-github fa-w-16 fa-2x'></i>
        case integrationTypes.GITLAB: return <i className='fab fa-gitlab fa-w-16 fa-2x'></i>
        case integrationTypes.BITBUCKET: return <i className='fab fa-bitbucket fa-w-16 fa-2x'></i>
    }
})


const RepositoryList = observer(() => 
    <div class="repos">

        <div class="badge-full">
            Personal
        </div>

        {providerStore.personal_repos.map(repo => 

        <div key={repo.name} class="repo-row" onClick={()=>providerStore.selectRepo(repo)}>
            {repo.name}
        </div>

        )}

        <div class="badge-full">
            Organization
        </div>

        {providerStore.organization_repos.map(repo => 

        <button key={repo.name} onClick={() => providerStore.selectRepo(repo)}>
            {repo.name}
        </button>

        )}

    </div>
)


export default ProjectForm
