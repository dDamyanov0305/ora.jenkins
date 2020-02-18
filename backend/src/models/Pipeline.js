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
    branch: {
        type: String,
        default: 'master'
    },
    create_date: Date,
    emailing: {
        type: Boolean,
        default: false
    },
    run_in_parallel: {
        type: Boolean,
        default: false
    }
})

const Pipeline = mongoose.model('Pipeline', pipelineSchema)

module.exports = Pipeline