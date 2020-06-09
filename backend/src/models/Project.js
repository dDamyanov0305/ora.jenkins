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
    url:String,
    repo_id: String,
    assigned_team: [ {type: mongoose.SchemaTypes.ObjectId, ref: 'User'} ],
    create_date:{
        type: Date,
        default: Date.now()
    }
})

projectSchema.methods.delete = async function(user){

    const project = this

    console.log('deleting project ', project.name)

    const pipelines = await Pipeline.find({ project_id: project._id })

    let pipeline_deletes = pipelines.map(async(pipeline) => await pipeline.delete(this, user))

    return new Promise((resolve,reject) => {

        Promise.all(pipeline_deletes)
        .then(() => {
            Project.deleteOne({_id:project._id})
            .then((val) => resolve(val))
            .catch((error) => reject(error))
        })
       
    })

}

const Project = mongoose.model('Project', projectSchema)
module.exports = Project