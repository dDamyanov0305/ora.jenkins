const mongoose = require('mongoose')
const { executionStatus } = require('../constants')

const actionExecutionSchema = mongoose.Schema({
    action_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pipeline',
        require: true
    },
    execution_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'PipelineExecution',
        require: true
    },
    status:{
        type: String,
        enum: Object.values(executionStatus),
        require: true
    },
    date:{
        type: Date,
        default: Date.now()
    },
})


const ActionExecution = mongoose.model('ActionExecution', actionExecutionSchema)
module.exports = ActionExecution