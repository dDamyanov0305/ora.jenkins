const mongoose = require('mongoose')

const projectSchema = mongoose.Schema({
    owner_id:{
        type:Number,
        require: true
    },
    repo_name:{
        type:String,
        require: true
    }
})

const Project = mongoose.model('Project', projectSchema)

module.exports = Project