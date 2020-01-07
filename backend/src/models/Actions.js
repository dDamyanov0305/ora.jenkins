const mongoose = require('mongoose')

const actionTypes = {
    DOCKER:'1',
    EMAILING:'2',
    NEXT_PIPE:'3',
    CUSTOM:'4'
}

const actionSchema = mongoose.Schema({
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

const Action = mongoose.model('Action', actionSchema)

module.exports = { Action, actionTypes }