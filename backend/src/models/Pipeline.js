const mongoose = require('mongoose')
const triggerModes  = require('../constants').triggerModes

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
        type:String,
        enum: Object.values(triggerModes),
        require: true
    },
    branch: String,
    create_date: Date
})

const Pipeline = mongoose.model('Pipeline', pipelineSchema)

module.exports = Pipeline