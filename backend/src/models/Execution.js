const mongoose = require('mongoose')

const executionSchema = mongoose.Schema({
    pipeline_id:{
        type:Number,
        require: true
    },
    comment:String,
    date:Date,
    executor:String,
    
})

const Execution = mongoose.model('Execution', executionSchema)

module.exports = Execution