
const PipelineExecution = require('./models/PipelineExecution')
const ActionExecution = require('./models/ActionExecution')
const Action = require('./models/Action')
const Pipeline = require('./models/Pipeline')


async function getExecutions(pipeline_id){

    const pipeline_executions = await PipelineExecution.find({ pipeline_id })

    const actions = await Pipeline.getActionsForPipeline(pipeline_id)

    let executions = pipeline_executions.map(async (pipeline_execution) => 
    {
        const ind = await PipelineExecution.find({pipeline_id}).where('date').lte(pipeline_execution.date).countDocuments()   


        let action_executions = actions.map(async(action) => 
        {
            const action_execution = await ActionExecution.findOne({execution_id: pipeline_execution._id, action_id:action._id})
            const log = await action.getLog(ind)
            console.log(action_execution, log)
            return { ...action_execution.toObject(), log }
            
        })

        action_executions = await Promise.all(action_executions)
        return { pipeline_execution, action_executions}
    })

    executions = await Promise.all(executions)
    return executions
}

module.exports = getExecutions