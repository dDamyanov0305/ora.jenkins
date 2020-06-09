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

router.post('/pipelines/all', [auth, check_permission], async(req, res) => {

    const { project_id } = req.body

    try{
        const pipelines = await Pipeline.find({ project_id })
        res.status(200).json({pipelines})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.post('/pipelines/get', [auth, check_permission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const pipeline = await Pipeline.findById(pipeline_id)
        if(!pipeline){
            res.status(404)
        }else{
            const actions = await Action.find({pipeline_id:pipeline._id})
            res.status(201).json({pipeline, actions})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
    
})

router.post('/pipelines/:pipeline_id/webhook-trigger', async(req, res) => {

    if(req.header("X-GitHub-Event") === 'push'){

        console.log(req.params)

        try{
            const { pipeline_id } = req.params
            const { head_commit, commits, ref} = req.body
            const { id, message, author } = head_commit
            const committers = commits.map(commit => commit.committer.email)
            const refs = ref.split('/')
            
            const pipeline = await Pipeline.findOne({_id: pipeline_id, branch: refs[refs.length-1]})
            const project = await Project.findById(pipeline.project_id)
            const user = await User.findById(pipeline.creator_id)

            console.log(pipeline.name, pipeline.project_id, project)
    
            const email_recipients = project.assigned_team.map(async(id) => (await User.findById(id).email))
    
            committers.forEach(email => {
                if(!email_recipients.includes(email)){
                    email_recipients.push(email)
                }
            })
    
            pipeline.run({ 
                triggerMode:triggerModes.PUSH, 
                comment:message, 
                revision:id, 
                executor: author.email,
                email_recipients,
                project,
                user_id:user._id
            })    
            res.sendStatus(200)
        }
        catch(error)
        {
            console.log(error)
            res.sendStatus(500)
        }
    }else{
        res.sendStatus(200)
    }

})

router.post('/pipelines/:pipeline_id/cron-trigger', async(req, res) => {

    const { pipeline_id } = req.params

    const pipeline = await Pipeline.findById(pipeline_id)
    const project = await Project.findById(pipeline.project_id)
    const executor = await User.findById(pipeline.creator_id)
    const email_recipients = await Promise.all(project.assigned_team.map(async(id) => (await User.findById(id)).email))

    console.log(email_recipients)

    pipeline.run({ 
        triggerMode:triggerModes.RECCURENTLY, 
        comment:`Scheduled run for pipeline ${pipeline.name}`, 
        revision: pipeline.branch, 
        executor: executor.email, 
        email_recipients,
        project,
        user_id:executor._id  
    })    
    res.status(202).send()

})

router.post('/pipelines/run', [auth, check_permission], async(req, res) => {

    const { pipeline_id, comment, revision } = req.body
    console.log(req.body)

    try{
        const pipeline = await Pipeline.findById(pipeline_id)

        if(!pipeline)
            throw new Error('couldn\'t find pipeline')

        const project = await Project.findById(pipeline.project_id)
        const email_recipients = await Promise.all(project.assigned_team.map(async(id) => (await User.findById(id)).email))
        console.log("emails",email_recipients)
        pipeline.run({ 
            user_id: req.user._id, 
            triggerMode: triggerModes.MANUAL, 
            comment,
            executor: req.user.email, 
            revision,
            project, 
            email_recipients
        })

        res.status(200).send()     
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.post('/pipelines/create', [auth, check_permission], async(req, res) => {

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

    console.log(req.body)

    try{
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
            PipelineController.create_hook({project, pipeline, user_id: req.user._id})
        }
        else if(trigger_mode === triggerModes.RECCURENTLY){
            PipelineController.create_cron_job({pipeline, token: req.token, cron_date})
        }

        console.log(pipeline)
        await pipeline.save()
        res.status(201).json({pipeline})
        
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.post('/pipelines/execution_details', [auth, check_permission], async(req, res) => {

    const { pipeline_execution_id, pipeline_id } = req.body

    try{
        const action_executions = await PipelineController.getActionExecutions(pipeline_id, pipeline_execution_id)
        res.status(200).json({action_executions})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.post('/pipelines/executions', [auth, check_permission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const pipeline_executions = await PipelineExecution.find({pipeline_id})
        res.status(200).json({pipeline_executions})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.delete('/pipelines/all', [auth, check_permission], async(req, res) => {

    const { project_id } = req.body

    try{
        const project = await Project.findById(pipeline.project_id)
        const pipelines = await Pipeline.find({project_id})
        pipelines.forEach(pipeline => pipeline.delete(project, req.user))
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.delete('/pipelines', [auth, check_permission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const pipeline =  await Pipeline.findById(pipeline_id )
        const project = await Project.findById(pipeline.project_id)
        let del = await pipeline.delete(project, req.user)
        res.status(200).send(del)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})



module.exports = router