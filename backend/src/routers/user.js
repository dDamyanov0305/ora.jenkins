const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Integration = require('../models/Integration')
const Workspace = require('../models/Workspace')
const auth = require('../middleware/auth')
import socketServer from '../socket'


router.post('/users/create', async (req, res) => {

    const {name, email, password, confirmedPassword } = req.body

    if(!name || !email){
        throw new Error("fill all fields")
    }

    if(!password || password.lenght < 5)
        throw new Error("Your password must be at least 5 characters long.")


    if(password !== confirmedPassword)
        throw new Error("Your passwords don't match.")

    let user = await User.findOne({ email })

    if(user)
        throw new Error('This email is taken.')

    user = await User.create({name, email, password})

    const token = await user.generateAuthToken()

    await Workspace.create({
        name: name, 
        owner_id: user._id, 
        members:[user._id]
    })

    const integrations = await Integration.find({ user_id: user._id })

    socketServer.add(user, token)


    res.status(201).json({ user, token, integrations })

})

router.post('/users/login', async (req, res) => {

    const { email, password } = req.body  
    
    const user = await User.findByCredentials(email, password)

    const token = await user.generateAuthToken()

    const integrations = await Integration.find({ user_id: user._id })

    res.status(200).json({ user, token, integrations })


})

router.use(auth)

router.get('/users/me', async (req, res) => {

    const integrations = await Integration.find({ user_id: req.user._id })

    res.status(200).json({ user:req.user, token: req.token, integrations })

})

router.post('/users/me/logout', async (req, res) => {

    req.user.tokens = req.user.tokens.filter(token => token.token != req.token)

    await req.user.save()

    res.end()

})

router.post('/users/me/logoutall', async (req, res) => {
  
    req.user.tokens.splice(0, req.user.tokens.length)

    await req.user.save()

    res.end()
   
})

router.delete('/users', async (req, res) => {

    const { user_id } = req.body

    const user = await User.findById(user_id)

    let del = user.delete()

    res.status(200).json({ result:del })

})

module.exports = router