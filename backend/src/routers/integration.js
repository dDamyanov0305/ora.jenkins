const express = require('express')
const router = express.Router()
const Integration = require('../models/Integration')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/integrations/all', async (req, res) => {
    
    const integrations = await Integration.find({ user_id: req.user._id })

    res.status(200).json({ integrations })
    
})

router.delete('/integrations/all', async (req, res) => {

    const { type } = req.body

    const integrations = await Integration.deleteMany({ user_id: req.user._id, type })

    res.status(200).json({ integrations })

})

router.post('/integration/get', async (req, res) => {

    const { _id } = req.body

    const integration = await Integration.findOne({ user_id: req.user_id, _id })

    res.status(200).json({ integration })

})

module.exports = router