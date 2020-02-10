const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Workspace = require('../models/Workspace')
const checkPermission = require('../middleware/checkPermission')

router.post('/workspaces/all', auth, async(req, res) => {

    try{
        const workspaces = await Workspace.find({ members: req.user._id })

        if(!workspaces) 
            res.status(404).send('authenticated user doesn\'t have any workspaces')

        res.json(workspaces)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
      
})

router.post('/workspaces/get', [auth, checkPermission], async(req, res) => {
    res.send(200).json(req.workspace)
})

router.post('/workspaces/create', auth, async (req, res) => {

    const { name } = req.body

    try{
        const workspace = await Workspace.create({ name, members: [req.user._id], owner_id: req.user._id, create_date: Date.now() })
        res.status(201).json(workspace)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.post('/workspaces/add_member/request', auth, async(req, res) => {

    const { email } = req.body

    try{
       
        //send email
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }

})

router.post('/workspaces/:workspace_id/add-member/confirm', auth, (req, res) => {

    //callback endpoint for email confirmation

})

router.delete('/workspaces/delete', auth, async(req, res) => {

    const { workspace_id } = req.params

    try{
        await Workspace.deleteOne({ _id: workspace_id })
        res.sendStatus(200)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})



module.exports = router