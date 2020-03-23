const mongoose = require('mongoose')
const Project = require('./Project')

const workspaceSchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    members: [ {type: mongoose.SchemaTypes.ObjectId, ref: 'User'} ],
    owner_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        require: true
    },
    create_date:{
        type: Date,
        default: Date.now()
    }
})

workspaceSchema.methods.delete = async function() {

    const workspace = this

    const projects = await Project.find({ workspace_id: workspace._id })

    projects.forEach(async(project) => await project.delete())

    const result = await Workspace.deleteOne({_id:workspace._id})
    return result

}

const Workspace = mongoose.model('Workspace', workspaceSchema)

module.exports = Workspace