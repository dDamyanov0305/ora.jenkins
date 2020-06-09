const mongoose = require('mongoose')
const integrationTypes = require('../constants').integrationTypes

const integrationSchema = mongoose.Schema({
    user_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        require: true
    },
    username:String,
    type: {
        type: String,
        enum: Object.values(integrationTypes),
        required: true
    },
    token: {
        type: String,
        required: true
    },
    refresh_token: String,
    expires_in: Number,
    create_date:{
        type: Date,
        default: Date.now()
    }    
})

const Integration = mongoose.model('Integration', integrationSchema)

module.exports = Integration