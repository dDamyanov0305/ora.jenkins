const express = require('express')
const router = express.Router()
const Pipeline = require('../models/Pipeline')
const Workspace = require('../models/Workspace')
const Project = require('../models/Project')
const Action = require('../models/Action')
const checkPermission = require('../middleware/checkPermission')
const triggerModes  = require('../constants').triggerModes

router.post('/pipelines/:pipeline_id/webhook-trigger', async(req, res) => {

    const { pipeline_id } = req.params
    const { payload } = req.body

    const pipeline = await Pipeline.findOne({ pipeline_id, project_id: project._id })

    
    const action = await Action.findOne({ pipeline_id: pipeline._id, prev_action_id: null })
    
    action.build(triggerModes.PUSH, payload.commits[0].message, payload.sender.email, payload.commits[0].sha)
    
    res.status(202).send()
    


})

module.exports = router