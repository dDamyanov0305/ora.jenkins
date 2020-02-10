const mongoose = require('mongoose')
const { triggerModes, executionStatus} = require('../constants')

const executionSchema = mongoose.Schema({
    action_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Action',
        require: true
    },
    status:{
        type: String,
        enum: Object.values(executionStatus),
        require: true
    },
    comment:String,
    date:Date,
    trigger:{ 
        type:String,
        enum: Object.values(triggerModes)
    },
    executor:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    revision: String,
})

const Execution = mongoose.model('Execution', executionSchema)

module.exports = Execution