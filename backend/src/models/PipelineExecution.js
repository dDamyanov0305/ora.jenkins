const mongoose = require('mongoose')
const { triggerModes, executionStatus} = require('../constants')
const ActionExecution = require('./ActionExecution')


const pipelineExecutionSchema = mongoose.Schema({
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
    trigger:{ 
        type:String,
        enum: Object.values(triggerModes)
    },
    executor:{
        type: String,
        require: true
    },
    revision: String,
    date:{
        type: Date,
        default: Date.now()
    },
})

pipelineExecutionSchema.methods.delete = async function(){

    const pipeline_execution = this

    const action_executions = await ActionExecution.find({pipeline_execution_id: pipeline_execution._id})
    action_executions.forEach(async(action_execution) =>  ActionExecution.deleteOne({_id: action_execution._id}))

    const result = await PipelineExecution.deleteOne({_id:pipeline_execution._id})
    return result

}


const PipelineExecution = mongoose.model('PipelineExecution', pipelineExecutionSchema)
module.exports = PipelineExecution