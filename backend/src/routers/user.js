const express = require('express')
const User = require('../models/User')
const Integration = require('../models/Integration')
const auth = require('../middleware/auth')
const router = express.Router()
const Workspace = require('../models/Workspace')
const bcrypt = require('bcryptjs')

router.post('/users/create', async (req, res) => {

    console.log(req.body)
    try {
        const user = new User(req.body)
        await user.save()
        user.token = await user.generateAuthToken()
        await Workspace.create({name: req.body.name, create_date: Date.now(), owner_id: user._id, members:[user._id]})
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.post('/users/login', async(req, res) => {

    const { email, password } = req.body   
    
    try {

        const user = await User.findOne({ email })
        if (!user) 
            res.status(401).json({error: 'Login failed! Check authentication credentials'})

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch)
            res.status(401).json({error: 'Login failed! Check authentication credentials'})
            

        user.token = await user.generateAuthToken()
        user.integrations = await Integration.find({ user_id: user._id })

        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

})

router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token != req.token)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router