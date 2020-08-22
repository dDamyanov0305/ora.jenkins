const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const Pipeline = require('../models/Pipeline')
const Action = require('../models/Action')
const Project = require('../models/Project')
const User = require('../models/User')
const PipelineExecution = require('../models/PipelineExecution')
const Integration = require('../models/Integration')
const PipelineController = require('../controllers/PipelineController')
const { triggerModes, integrationTypes } = require('../constants')
const auth = require('../middleware/auth')
const check_permission = require('../middleware/check_permission')

router.post('/pipelines/:pipeline_id/webhook-trigger', async(req, res) => {

    if(req.header("X-GitHub-Event") === 'push'){

        const { pipeline_id } = req.params 

        const { head_commit, commits, ref} = req.body

        const { id, message, author } = head_commit

        const committers = commits.map(commit => commit.committer.email)

        const refs = ref.split('/')
        
        const pipeline = await Pipeline.findOne({ _id: pipeline_id, branch: refs[refs.length-1] })

        const project = await Project.findById(pipeline.project_id)

        const user = await User.findById(pipeline.creator_id)

        const email_recipients = project.assigned_team.map(async(id) => (await User.findById(id).email))

        committers.forEach(email => {

            if(!email_recipients.includes(email))
                email_recipients.push(email)
            
        })

        pipeline.run({ 
            trigger_mode: triggerModes.PUSH, 
            comment: message, 
            revision: { sha: id, message }, 
            executor: author.email,
            email_recipients,
            project,
            user_id: user._id
        })    

        res.sendStatus(200).end()

    } else{

        res.sendStatus(400).end()

    }

})

router.post('/pipelines/:pipeline_id/cron-trigger', async(req, res) => {

    const { pipeline_id } = req.params

    const pipeline = await Pipeline.findById(pipeline_id)

    const project = await Project.findById(pipeline.project_id)

    const executor = await User.findById(pipeline.creator_id)

    const email_recipients = await Promise.all(project.assigned_team.map(async(id) => (await User.findById(id)).email))

    const integration = await Integration.findOne({ user_id: pipeline.creator_id, type: integrationTypes.GITHUB })

    if(!integration)
        res.status(403).json({ error:'Not integrated with selectet hosting provider.' })

    const result = await fetch(`https://api.github.com/repos/${project.repository}/commits?sha=${pipeline.branch}`, {
        headers: {
            "Content-type": "application/json",
            "Authorization": "token " + integration.token
        }
    })

    if(result.status < 200 || result.status >= 300) {

        res.status(result.status).json({error:"github server error"})

    } else {

        const commits = await result.json()

        pipeline.run({ 
            trigger_mode: triggerModes.RECCURENTLY, 
            comment: `Scheduled run for pipeline ${pipeline.name}`, 
            revision: { sha:commits[0].sha, message:commits[0].commit.message }, 
            executor: executor.email, 
            email_recipients,
            project,
            user_id: executor._id  
        })    

        res.status(202).end()

    }

})

router.use([auth, check_permission])

router.post('/pipelines/all', async(req, res) => {

    const { project_id } = req.body

    let pipelines = await Pipeline.find({ project_id }, {}, { sort: { create_date : -1 }})

    pipelines = pipelines.map(async (pipeline) => {

        const hasActions = await Action.exists({ pipeline_id:pipeline._id })

        const lastExecution = await PipelineExecution.findOne({ pipeline_id:pipeline._id },{},{ sort: { date : -1 }})

        return { ...pipeline.toObject(), hasActions, lastExecution: lastExecution ? lastExecution.toObject() : null }

    })

    pipelines = await Promise.all(pipelines)

    res.status(200).json({ pipelines })


})

router.post('/pipelines/get', async(req, res) => {

    const { pipeline_id } = req.body

    const pipeline = await Pipeline.findById(pipeline_id)

    let actions = []    

    if(pipeline) 
        actions = await Action.find({pipeline_id:pipeline._id})

    res.status(200).json({ pipeline, actions })
    
})


router.post('/pipelines/run', async(req, res) => {

    const { pipeline_id, comment, revision } = req.body

    const pipeline = await Pipeline.findById(pipeline_id)

    if(!pipeline)
        throw new Error('couldn\'t find pipeline')

    const project = await Project.findById(pipeline.project_id)

    const email_recipients = await Promise.all(project.assigned_team.map(async(id) => (await User.findById(id)).email))

    const pipeline_execution = await pipeline.run({ 
        user_id: req.user._id, 
        trigger_mode: triggerModes.MANUAL, 
        comment,
        executor: req.user.email, 
        revision,
        project, 
        email_recipients
    })

    res.status(200).json({ pipeline_execution })     

})

router.post('/pipelines/create', async(req, res) => {

    const { 
        name, 
        branch, 
        trigger_mode, 
        project_id,
        cron_date,
        emailing,
        email_time,
        push_image,
        docker_user,
        docker_password,
        docker_image_tag,
        docker_repository,
        workdir,
    } = req.body

    const pipeline = new Pipeline({ 
        name, 
        branch, 
        trigger_mode, 
        project_id,
        creator_id: req.user._id,
        push_image,
        docker_user,
        docker_password,
        docker_image_tag,
        docker_repository, 
        workdir
    })

    const project = await Project.findById(project_id)
    
    if(!pipeline || !project){
        throw new Error('Couldn\'t create pipeline.')
    }
    
    if(emailing){
        pipeline.emailing = email_time
    }

    if(trigger_mode === triggerModes.PUSH){
        await PipelineController.create_hook({ project, pipeline, user_id: req.user._id })
    }
    else if(trigger_mode === triggerModes.RECCURENTLY){
        await PipelineController.create_cron_job({ pipeline, token: req.token, cron_date })
    }

    await pipeline.save()

    res.status(201).json({ pipeline })
        
})

router.post('/pipelines/execution_details', async(req, res) => {

    const { pipeline_execution_id, pipeline_id } = req.body
 
    const action_executions = await PipelineController.getActionExecutions(pipeline_id, pipeline_execution_id)

    res.status(200).json({ action_executions })
    
})

router.post('/pipelines/executions', async(req, res) => {

    const { pipeline_id } = req.body

    const pipeline_executions = await PipelineExecution.find({pipeline_id}, {}, {sort:{date:-1}})

    res.status(200).json({ pipeline_executions })

})

router.delete('/pipelines/all', async(req, res) => {

    const { project_id } = req.body

    const project = await Project.findById(pipeline.project_id)

    const pipelines = await Pipeline.find({project_id})

    pipelines.forEach(pipeline => pipeline.delete(project, req.user))

    res.status(200).end()

})

router.delete('/pipelines', async(req, res) => {

    const { pipeline_id } = req.body

    const pipeline =  await Pipeline.findById(pipeline_id )

    const project = await Project.findById(pipeline.project_id)

    let del = await pipeline.delete(project, req.user)

    res.status(200).json({ result: del })

})

module.exports = router