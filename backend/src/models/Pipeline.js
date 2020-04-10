const mongoose = require('mongoose')
const Project = require('./Project')
const PipelineExecution = require('./PipelineExecution')
const ActionExecution = require('./ActionExecution')
const Action = require('./Action')
const docker = require('../docker/Docker')
const transporter = require('../transporter')
const { triggerModes, executionStatus, emailConditions} = require('../constants')
const fetch = require('node-fetch')


const pipelineSchema = mongoose.Schema({
    project_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Project',
        require: true
    },
    creator:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        require: true
    },
    name:{
        type:String,
        require: true
    },
    trigger_mode:{
        type: String,
        enum: Object.values(triggerModes),
        require: true
    },
    hook_id: Number,
    branch: {
        type: String,
        default: 'master'
    },
    create_date:{
        type: Date,
        default: Date.now()
    },
    emailing: {
        type: String,
        enum: Object.values(emailConditions),
        default: emailConditions.NEVER
    },
    push_image:{
        type: Boolean,
        default: false
    },
    docker_user:String,
    docker_password:String,
    docker_repository:String,
    docker_image_tag:String,
    cron_container_id: String,
    cron_date: String,
    run_parallel: {
        type:Boolean,
        default:false
    }
})

pipelineSchema.methods.delete = async function(project, user) {

    const pipeline = this

    const actions = await Action.find({ pipeline_id: pipeline._id })
    const pipeline_executions = await PipelineExecution.find({ pipeline_id: pipeline._id })


    actions.forEach(async(action) => await action.delete())
    pipeline_executions.forEach(async(pipeline_execution) => await pipeline_execution.delete())

    if(pipeline.cron_container_id){
        const res = await docker.getContainer(pipeline.cron_container_id).remove()
        console.log(res)
    }

    const integration = await Integration.findOne({user_id: user._id, type: integrationTypes.GITHUB})


    fetch(`https://api.github.com/repos/${project.repository}/hooks`,{
        method:'DELETE',
        headers:{
            "Content-type": "application/json",
            "Authorization": "token " + integration.token
        }
    })
    .then(res => console.log(res.status))

   const result = await Pipeline.deleteOne({_id:pipeline._id})
   return result

}

pipelineSchema.methods.run = async function({ triggerMode, comment, revision, executor, email_recipients, project }){

    const { 
        branch, 
        creator, 
        project_id, 
        _id,
        name, 
        emailing, 
        push_image, 
        run_parallel ,
        docker_user,
        docker_password,
        docker_repository,
        docker_image_tag,
        path

    } = this

    const {repository} = project

    const pipeline_execution = new PipelineExecution({ 
        pipeline_id: _id, 
        triggerMode, 
        comment, 
        revision, 
        executor, 
        status:executionStatus.INPROGRESS 
    })

    const ind = await PipelineExecution.find({pipeline_id:_id}).where('date').lte(pipeline_execution.date).countDocuments()
    console.log(ind)

    if(run_parallel)
    {
        const actions = await Action.find({pipeline_id: pipeline._id})

        const action_executions = actions.map(action => action.execute({ repository:repository.split("/")[1], branch, creator, revision, pipeline_execution, ind }))
        
        const statuses = await Promise.all(action_executions)

        statuses.forEach(status => 
        {
            if(status !== executionStatus.SUCCESSFUL)
            {
                pipeline_execution.status = executionStatus.FAILED
            }
        })
    }
    else
    {
        var prev_action = null
        let action = await Action.findOne({ pipeline_id: _id, prev_action_id: null })
    
        if(!action) 
            throw new Error("no actions to execute")

        while(action)
        {
            await action.execute({ repository:repository.split("/")[1], branch, creator, revision, pipeline_execution, ind })
            prev_action = action
            action = await Action.findOne({ pipeline_id: _id, prev_action_id: action._id })
        }
    }

    if(pipeline_execution.status == executionStatus.SUCCESSFUL && push_image)
    {
        prev_action.build_and_push({
            dir_name:repository.split("/")[1], 
            path, 
            docker_password, 
            docker_user, 
            docker_repository, 
            docker_image_tag
        })
    }
    

    if(emailing == emailConditions.ON_EVERY_EXECUTION || 
        (emailing == emailConditions.ON_SUCCESS && pipeline_execution.status == executionStatus.SUCCESSFUL) ||
        (emailing == emailConditions.ON_FAILURE && pipeline_execution.status == executionStatus.FAILED)
    ){
        let info = await transporter.sendMail({
            from: '"Ora.CI" <dimitar.damyanov0305@gmail.com>',
            to: email_recipients.join(','),
            subject: `Execution #${ind} for pipeline ${name}`, 
            text: `status: ${pipeline_execution.status}`,
            html: `<a href="http://localhost:3000/execution/${pipeline_execution._id}">for detailed information follow this link</a>`
        })
        console.log(info)
    }
}

pipelineSchema.statics.getActionsForPipeline = async (pipeline_id) => 
{
    const actions = await Action.find({ pipeline_id })
    
    const ordered = []

    let next = actions.find(action => action.prev_action_id == null)

    while(next)
    {
        console.log(next)
        ordered.push(next)
        next = actions.find(action => JSON.stringify(action.prev_action_id) == JSON.stringify(next._id))
    }

    return ordered
}

pipelineSchema.statics.getExecutions = async function(pipeline_id){

    const pipeline_executions = await PipelineExecution.find({ pipeline_id })

    const actions = await Pipeline.getActionsForPipeline(pipeline_id)

    let executions = pipeline_executions.map(async (pipeline_execution) => 
    {
        const ind = await PipelineExecution.find({pipeline_id}).where('date').lte(pipeline_execution.date).countDocuments()   


        let action_executions = actions.map(async(action) => 
        {
            let action_execution = await ActionExecution.findOne({execution_id: pipeline_execution._id, action_id:action._id})
            const log = await action.getLog(ind)
            console.log(action_execution, log)

            if(action_execution) 
                return { ...action_execution.toObject(), action, log }
            
        })

        action_executions = await Promise.all(action_executions)
        return { pipeline_execution, action_executions}
    })

    executions = await Promise.all(executions)
    return executions
}

const Pipeline = mongoose.model('Pipeline', pipelineSchema)
module.exports = Pipeline