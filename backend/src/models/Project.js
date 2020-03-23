const mongoose = require('mongoose')
const hostingProviders = require('../constants').hostingProviders
const Pipeline = require('./Pipeline')

const projectSchema = mongoose.Schema({
    workspace_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Workspace',
        require: true
    }, 
    name:{
        type: String,
        require: true
    },
    hosting_provider:{
        type: String,
        enum: Object.values(hostingProviders),
        require: true,
    },
    repository:{
        type: String,
        require: true
    },
    assigned_team: [ {type: mongoose.SchemaTypes.ObjectId, ref: 'User'} ],
    create_date:{
        type: Date,
        default: Date.now()
    }
})


projectSchema.methods.delete = async function(){

    const project = this

    const pipelines = await Pipeline.find({ project_id: project._id })

    pipelines.forEach(async(pipeline) => await pipeline.delete())

    const result = await Project.deleteOne({_id:project._id})

    return result

}

const Project = mongoose.model('Project', projectSchema)

module.exports = Project