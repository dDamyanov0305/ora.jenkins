const mongoose = require('mongoose')
const { triggerModes, emailConditions, integrationTypes} = require('../constants')
const PipelineController = require('../controllers/PipelineController')
const Action = require("./Action")
const PipelineExecution = require("./PipelineExecution")
const Integration = require("./Integration")
const docker = require('../docker/Docker')
const fetch = require('node-fetch')

const pipelineSchema = mongoose.Schema({
    project_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Project',
        require: true
    },
    creator_id:{
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
    },
    workdir:{
        type:String,
        default:'/'
    }
})

pipelineSchema.methods.run = PipelineController.run
pipelineSchema.methods.delete = async function(project, user) {

    const pipeline = this

    console.log('deleting pipeline ', pipeline._id)

    const actions = await Action.find({ pipeline_id: pipeline._id })
    const pipeline_executions = await PipelineExecution.find({ pipeline_id: pipeline._id })

    if(pipeline.cron_container_id){
        try{

            const container = docker.getContainer(pipeline.cron_container_id)
            await container.stop()
            const res = container.remove()
            console.log(res)
        }catch(err){
            console.log(err)
        }
    }

    let action_deletes = actions.map(async(action) => await Action.deleteOne({_id:action._id}))
    let pipeline_ex_deletes = pipeline_executions.map(async(pipeline_execution) => await pipeline_execution.delete())

    return new Promise((resolve,reject) => {

        Promise.all([...action_deletes, ...pipeline_ex_deletes])
        .then(async() => {
            console.log("finished deleting subresources")
            const integration = await Integration.findOne({user_id: user._id, type: integrationTypes.GITHUB})
            if(pipeline.trigger_mode === triggerModes.PUSH){
                console.log("deleting github webhook start")
                let res = await fetch(`https://api.github.com/repos/${project.repository}/hooks/${this.hook_id}`,{
                    method:'DELETE',
                    headers:{
                        "Content-type": "application/json",
                        "Authorization": "token " + integration.token
                    }
                })

                console.log("deleting github webhook ",res)

            }

            Pipeline.deleteOne({_id:pipeline._id})
                .then((val) => resolve(val))
                .catch((error) => reject(error))
        
        })
       
    })

}

const Pipeline = mongoose.model('Pipeline', pipelineSchema)
module.exports = Pipeline