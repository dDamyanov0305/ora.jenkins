const express = require('express')
const User = require('../models/User')
const Integration = require('../models/Integration')
const auth = require('../middleware/auth')
const router = express.Router()
const Workspace = require('../models/Workspace')
const bcrypt = require('bcryptjs')

router.post('/users/create', async (req, res) => {

    try {

        let user = await User.findOne({ email:req.body.email })

        if(user)
            throw new Error('This email is taken')

        user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()

        await Workspace.create({
            name: req.body.name, 
            create_date: Date.now(), 
            owner_id: user._id, 
            members:[user._id]
        })

        res.status(201).json({user, token})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.post('/users/login', async(req, res) => {
    const { email, password } = req.body  
    
    try {
        const user = await User.findByCredentials(email, password)

        if(!user){
            res.status(404).send()
        }

        const token = await user.generateAuthToken()

        res.json({user, token})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.get('/users/me', auth, async(req, res) => {
    res.json({user:req.user, token: req.token})
})

router.post('/users/me/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token != req.token)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.post('/users/me/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.get('/users/all', async (req, res) => {
    const users = await User.find({})
    res.json({users})
})

module.exports = router