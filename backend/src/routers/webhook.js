const express = require('express')
const router = express.Router()
const Pipeline = require('../models/Pipeline')
const Workspace = require('../models/Workspace')
const Project = require('../models/Project')
const Action = require('../models/Action')
const checkPermission = require('../middleware/checkPermission')
const triggerModes  = require('../constants').triggerModes



router.post('/:workspace_name/:repository/pipelines/pipeline/:pipeline_id/webhook-trigger', async(req, res) => {

    const { workspace_name, repository, pipeline_id } = req.params
    const { payload } = req.body

    const workspace = await Workspace.findOne({ name: workspace_name, })
    const project = await Project.findOne({ repository, workspace_id: workspace._id })
    const pipeline = await Pipeline.findOne({ pipeline_id, project_id: project._id })

    if(!workspace || !project || !pipeline)
        res.sendStatus(400)

    const action = await Action.findOne({ pipeline_id: pipeline._id, prev_action_id: null })

    action.build(triggerModes.PUSH, payload.commits[0].message, payload.sender.email, payload.commits[0].sha)

    res.sendStatus(202)
})






module.exports = router