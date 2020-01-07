const mongoose = require('mongoose')

const buildStatus = {
    SUCCESSFUL: 'successfull',
    TERMINATED: 'terminated',
    FAILED: 'failed'
}

const buildSchema = mongoose.Schema({
    pipe_id:{
        type:Number,
        require:true
    },
    status:{
        type:String,
        require:true,
    },
    log:{
        type:String,
        require:true,
    },
})

const Build = mongoose.model('Build', buildSchema)

module.exports = { Build, buildStatus }