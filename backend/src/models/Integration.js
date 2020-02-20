const mongoose = require('mongoose')
const integrationTypes = require('../constants').integrationTypes

const integrationSchema = mongoose.Schema({
    user_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        require: true
    },
    type: {
        type: String,
        enum: Object.values(integrationTypes),
        required: true
    },
    token: {
        type: String,
        required: true
    }
    
})

const Integration = mongoose.model('Integration', integrationSchema)

module.exports = Integration