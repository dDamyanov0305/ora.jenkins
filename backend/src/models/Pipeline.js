const mongoose = require('mongoose')

const triggerModes = {
    MANUAL:'1',
    PUSH:'2',
    RECCURENTLY:'3'
}

const pipelineSchema = mongoose.Schema({
    project_id:{
        type:Number,
        require: true
    },
    name:{
        type:String,
        require: true
    },
    trigger_mode:{
        type:Number,
        require: true
    },
    branch: String,
})

const Pipeline = mongoose.model('Pipeline', pipelineSchema)

module.exports = { Pipeline, triggerModes }