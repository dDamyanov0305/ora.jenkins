const mongoose = require('mongoose')
const { executionStatus } = require('../constants')
const ActionExecutionController = require('../controllers/ActionExecutionController')

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
    log_id: String
})

actionExecutionSchema.methods.getlog = ActionExecutionController.getlog
actionExecutionSchema.methods.delete = ActionExecutionController.delete

const ActionExecution = mongoose.model('ActionExecution', actionExecutionSchema)
module.exports = ActionExecution