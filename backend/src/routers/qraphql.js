const express = require('express')
const router = express.Router()
const graphqlHTTP = require('express-graphql')
const schema = require('../schema/Schema')

router.use('/graphql', graphqlHTTP({
    schema,
    graphiql:true
}))

module.exports = router