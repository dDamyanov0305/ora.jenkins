const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Pipeline = require('../models/Pipeline')
const Action = require('../models/Action')
const Project = require('../models/Project')
const User = require('../models/User')
const PipelineExecution = require('../models/PipelineExecution')
const PipelineController = require('../controllers/PipelineController')
const { triggerModes } = require('../constants')
const check_permission = require('../middleware/check_permission')

router.post('/executions/all', [auth, check_permission], async(req, res) => {

    
    try{
        const projects = await Project.find({assigned_team: req.user.id})
        const pipelines = await Promise.all(projects.map(async(project) => await Pipeline.find({project_id: project._id})))
        const pipeline_executions = await Promise.all(pipelines.map(async(pipeline) => await PipelineExecution.find({pipeline_id:pipeline._id})))
        const sorted = pipeline_executions.sort((a, b) => b.date.getTime() - a.date.getTime())
        console.log(pipelines)
        res.status(200).json({pipeline_executions: sorted})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

module.exports = router