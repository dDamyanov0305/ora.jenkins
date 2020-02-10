const mongoose = require('mongoose')
const hostingProviders = require('../constants').hostingProviders

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
    create_date: Date
})

const Project = mongoose.model('Project', projectSchema)

module.exports = Project