const mongoose = require('mongoose')
const Project = require('./Project')

const workspaceSchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    members: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
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

    console.log("deletng workspace ", workspace.name)

    const projects = await Project.find({ workspace_id: workspace._id })

    let project_deletes =  projects.map(async(project) => await project.delete())

    return new Promise(async (resolve,reject) => {

        await Promise.all(project_deletes)

        try{

            let result = await Workspace.deleteOne({_id: workspace._id})

            resolve(result)


        } catch(error) {

            reject(error.message)

        }

    })
       

}

const Workspace = mongoose.model('Workspace', workspaceSchema)

module.exports = Workspace