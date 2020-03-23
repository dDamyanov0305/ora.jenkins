const express = require('express')
const User = require('../models/User')
const Integration = require('../models/Integration')
const auth = require('../middleware/auth')
const router = express.Router()
const Workspace = require('../models/Workspace')
const bcrypt = require('bcryptjs')

router.post('/users/create', async (req, res) => {

    const {name, email, password, confirmedPassword } = req.body

    try {

        if(password.lenght < 5)
            throw new Error("Your password must be at least 5 characters long.")
        

        if(password !== confirmedPassword)
            throw new Error("Your passwords don't match.")
    
        let user = await User.findOne({ email })

        if(user)
            throw new Error('This email is taken.')

        user = await User.create({name, email, password})
        await user.save()
        const token = await user.generateAuthToken()

        await Workspace.create({
            name: name, 
            owner_id: user._id, 
            members:[user._id]
        })

        res.status(201).json({user, token})
    } 
    catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.post('/users/login', async(req, res) => {
    const { email, password } = req.body  
    
    try {
        const user = await User.findByCredentials(email, password)

        const token = await user.generateAuthToken()

        const integrations = await Integration.find({ user_id: user._id })

        res.json({user, token, integrations})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.get('/users/me', auth, async(req, res) => {
    const integrations = await Integration.find({ user_id: req.user._id })
    console.log(integrations)
    res.json({user:req.user, token: req.token, integrations})
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
    res.status(200).json({users})
})

router.delete('/users/all', async (req, res) => {

    try{
        const users = await User.find({})
        users.forEach(user => user.delete())
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.delete('/users', async (req, res) => {

    const { user_id } = req.body

    try{
        const user = await User.findById(user_id)
        user.delete()
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

module.exports = router