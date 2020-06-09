const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const check_permission = require('../middleware/check_permission')
const Workspace = require('../models/Workspace')


router.get('/workspaces/all', auth, async(req, res) => {

    try{
        const workspaces = await Workspace.find({ members: req.user._id })

        if(!workspaces) 
            res.status(404).send('authenticated user doesn\'t have any workspaces')
        res.json({workspaces})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
      
})

router.post('/workspaces/get', [auth, check_permission], async(req, res) => {
    res.status(200).json({workspace:req.workspace})
})

router.post('/workspaces/create', auth, async (req, res) => {

    const { name } = req.body

    try{
        const workspace = await Workspace.create({ name, members: [req.user._id], owner_id: req.user._id })
        res.status(201).json({workspace})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})


router.delete('/workspaces', [auth, check_permission], async(req, res) => {

    const { workspace_id } = req.params

    try{
        const workspace = await Workspace.findById(workspace_id)
        let del = workspace.delete()
        res.status(200).send(del)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.delete('/workspaces/all', [auth, check_permission], async(req, res) => {

    try{
        const workspaces = await Workspace.find({})
        workspaces.forEach(workspace => workspace.delete())
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

module.exports = router