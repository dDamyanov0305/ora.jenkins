module.exports = {
    triggerModes: {
        MANUAL:'MANUAL',
        PUSH:'PUSH',
        RECCURENTLY:'RECURRENT'
    },
    integrationTypes: {
        GITHUB: 'GITHUB',
        ORA: 'ORA'
    },
    actionTypes: {
        BUILD:'BUILD',
        EMAILING:'EMAILING',
        NEXT_PIPE:'NEXT_PIPE',
        EXECUTE:'EXECUTE'
    },
    triggerTimes: {
        ON_EVERY_EXECUTION: 'ON_EVERY_EXECUTION',
        ON_SUCCESS: 'ON_SUCCESS',
        ON_FAILURE: 'ON_FAILURE'
    },
    executionStatus:{
        SUCCESSFUL: 'SUCCESSFUL',
        ENQUED: 'ENQUED',
        TERMINATED: 'TERMINATED',
        FAILED: 'FAILED',
        NOT_EXECUTED: 'NOT_EXECUTED',
        SKIPPED: 'SKIPPED',
        INPROGRESS: 'INPROGRESS'
    },
    hostingProviders:{
        GITHUB: 'GITHUB'
    },
    emailConditions: {
        ON_EVERY_EXECUTION: 'ON_EVERY_EXECUTION',
        ON_SUCCESS: 'ON_SUCCESS',
        ON_FAILURE: 'ON_FAILURE',
        NEVER:'NEVER'
    },
}

