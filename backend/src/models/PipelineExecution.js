const mongoose = require('mongoose')
const { triggerModes, executionStatus} = require('../constants')
const ActionExecution = require('./ActionExecution')

const pipelineExecutionSchema = mongoose.Schema({
    user_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pipeline',
        require: true
    },
    pipeline_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pipeline',
        require: true
    },
    status:{
        type: String,
        enum: Object.values(executionStatus),
        require: true
    },
    comment:String,
    trigger_mode:{ 
        type:String,
        enum: Object.values(triggerModes)
    },
    executor:{
        type: String,
        require: true
    },
    revision: {
        sha:String,
        message:String
    },
    date:{
        type: Date,
        default: Date.now()
    },
})

pipelineExecutionSchema.methods.delete = async function(){

    const pipeline_execution = this

    console.log('deleting pipeline execution ', pipeline_execution._id)

    const action_executions = await ActionExecution.find({pipeline_execution_id: pipeline_execution._id})
    let action_ex_deletes = action_executions.map(async(action_execution) => await action_execution.delete())

    return new Promise((resolve,reject) => {

        Promise.all(action_ex_deletes)
        .then(() => {
            PipelineExecution.deleteOne({_id:pipeline_execution._id})
            .then((val) => resolve(val))
            .catch((error) => reject(error))
        })
       
    })

}


const PipelineExecution = mongoose.model('PipelineExecution', pipelineExecutionSchema)
module.exports = PipelineExecution