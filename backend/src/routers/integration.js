const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Integration = require('../models/Integration')


router.get('/integrations/all', auth, async(req, res) => {

    try{
        const integrations = await Integration.find({ user_id: req.user._id })
        res.status(200).json({integrations})
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }

})


router.delete('/integrations/all', auth, async(req, res) => {

    const { type } = req.body

    try{
        const integrations = await Integration.deleteMany({ user_id: req.user._id, type })
        res.status(200).json({integrations})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})


router.post('/integration/get', auth, async(req, res) => {

    const { _id } = req.body

    try{
        const integration = await Integration.findOne({ user_id: req.user_id, _id })
        res.status(200).json(integration)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
    
})



module.exports = router