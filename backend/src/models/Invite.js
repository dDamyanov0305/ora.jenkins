const mongoose = require('mongoose')
const { inviteStatus } = require('../constants')

const invitesSchema = mongoose.Schema({
    email:{
        type:String,
        require: true
    },
    sender_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        require: true
    },
    workspace_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Workspace',
        require: true
    },
    status:{
        type: String,
        enum: Object.values(inviteStatus),
        default: inviteStatus.PENDING
    } 
})

const Invite = mongoose.model('Invite', invitesSchema)
module.exports = Invite