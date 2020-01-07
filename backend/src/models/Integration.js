const mongoose = require('mongoose')

const IntegrationTypes = {
    GITHUB: 'github'
}

const integrationSchema = mongoose.Schema({
    user_id:{
        type:Number,
        require: true
    },
    type: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
})

const Integration = mongoose.model('Integration', integrationSchema)

module.exports = {Integration, IntegrationTypes}