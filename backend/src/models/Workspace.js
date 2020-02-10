const mongoose = require('mongoose')

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
    create_date: Date 
})

const Workspace = mongoose.model('Workspace', workspaceSchema)

module.exports = Workspace