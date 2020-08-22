const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const check_permission = require('../middleware/check_permission')
const Workspace = require('../models/Workspace')

router.use(auth)

router.get('/workspaces/all', async (req, res) => {

    const workspaces = await Workspace.find({ members: req.user._id })

    res.json({ workspaces })

})

router.post('/workspaces/create', async (req, res) => {

    const { name } = req.body

    const new_workspace = await Workspace.create({ name, members: [req.user._id], owner_id: req.user._id })
    const workspaces = await Workspace.find({ members: req.user._id })

    res.status(201).json({ new_workspace, workspaces })

})

router.use(check_permission)

router.post('/workspaces/get', async (req, res) => {

    res.status(200).json({ workspace:req.workspace })

})

router.delete('/workspaces', async (req, res) => {

    const { workspace_id } = req.params

    const workspace = await Workspace.findById(workspace_id)

    let del = workspace.delete()

    res.status(200).send(del)

})


module.exports = router