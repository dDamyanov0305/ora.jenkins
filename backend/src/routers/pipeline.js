const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Pipeline = require('../models/Pipeline')
const Action = require('../models/Action')
const Project = require('../models/Project')
const ActionExecution = require('../models/ActionExecution')
const PipelineExecution = require('../models/PipelineExecution')
const Integration = require('../models/Integration')
const {triggerModes, integrationTypes} = require('../constants')
const checkPermission = require('../middleware/checkPermission')
const fetch = require('node-fetch')
const docker = require('../docker/Docker')

router.post('/pipelines/all', [auth, checkPermission], async(req, res) => {

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


router.post('/pipelines/get', [auth, checkPermission], async(req, res) => {

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

    try
    {
        const { pipeline_id } = req.params
        const { head_commit, commits} = req.body
        const { id, message, author } = head_commit
        const committers = commits.map(commit => commit.committer.email)

        console.log(committers)
    
        const pipeline = await Pipeline.findById(pipeline_id)

        const project = await Project.findById(pipeline.project_id)

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
            project
        })    
        res.status(202).send()
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send({error:error.message})
    }

})

router.post('/pipelines/:pipeline_id/cron-trigger', async(req, res) => {

    const { pipeline_id } = req.params
    const pipeline = await Pipeline.findOne({ pipeline_id })
    const executor = await User.findById(pipeline.creator)
    
    const project = await Project.findById(pipeline.project_id)
    
    const email_recipients = project.assigned_team.map(async(id) => (await User.findById(id).email))

    pipeline.run({ 
        triggerMode:triggerModes.RECCURENTLY, 
        comment:`Scheduled run for pipeline ${pipeline.name}`, 
        revision:null, 
        executor: executor.email, 
        email_recipients,
        project  
    })    
    res.status(202).send()

})

router.post('/pipelines/run', [auth, checkPermission], async(req, res) => {

    console.log(req.body)
    const { pipeline_id, comment, revision, triggerMode } = req.body

    try{
        const pipeline = await Pipeline.findById(pipeline_id)

        if(!pipeline)
            throw new Error('couldn\'t find pipeline')

        const project = await Project.findById(pipeline.project_id)

        const email_recipients = project.assigned_team.map(async(id) => (await User.findById(id).email))

       
        pipeline.run({triggerMode, comment, executor:req.user.email, revision, project, email_recipients})
        res.status(200).send()
        

    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
    
})


router.post('/pipelines/create', [auth, checkPermission], async(req, res) => {

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
    } = req.body

    console.log(req.body)

    try{
        const pipeline = new Pipeline({ 
            name, 
            branch, 
            trigger_mode, 
            project_id,
            creator: req.user._id,
            push_image,
            docker_user,
            docker_password,
            docker_image_tag,
            docker_repository, 
        })

        if(emailing)
            pipeline.emailing = email_time

        const project = await Project.findById(project_id)

        
        if(!pipeline || !project)
            throw new Error('Couldn\'t create pipeline.')

        if(trigger_mode === triggerModes.PUSH)
        {

            const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITHUB})
     
            const result = await fetch(`https://api.github.com/repos/${project.repository}/hooks`,{
                method:'POST',
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "token " + integration.token
                },
                body:JSON.stringify({
                    "name": "web",
                    "active": true,
                    "events": [
                        "push",
                    ],
                    "config": {
                        "url": `${process.env.SERVER_ADDRESS}/pipelines/${pipeline._id}/webhook-trigger`,
                        "content_type": "json",
                        "insecure_ssl": "0"
                    }
                })
            })
        
            if(result.status < 200 || result.status >= 300){
                console.log(result.status)
                return res.sendStatus(result.status)
            }
            else{
                const { id: hook_id } = await result.json()
                pipeline.hook_id = hook_id
                pipeline.save()
                res.status(201).json({pipeline})
            }

        }
        else if(trigger_mode === triggerModes.RECCURENTLY){

            pipeline.cron_date = cron_date

            const setup_commands = [
                'apt-get update && apt-get install -y cron && apt-get install -y curl',
                'touch /etc/cron.d/cron-job && touch /var/log/cron.log',
                `echo -e "${cron_date} curl -X POST ${process.env.SERVER_ADDRESS}/pipelines/${pipeline._id}/cron-trigger\n" > /etc/cron.d/cron-job`,
                'chmod 0644 /etc/cron.d/cron-job',
                'crontab /etc/cron.d/cron-job',
                'cron'
            ].join(' && ')

            console.log(setup_commands)

            const container = await docker.createContainer({
                AttachStdin: false,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Image: 'ubuntu',
                Env: [`AUTH=${req.token}`]
            })

            
            if(!container)
                throw new Error("Unable to create container for cron pipeline.")

            await container.start()

            pipeline.cron_container_id = container.id

            const exec = await container.exec({
                AttachStdin: false,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: ['/bin/bash', '-c', `${setup_commands}`]
            })

            
            const stream = await exec.start({Tty: true})


            stream.on('data',(data)=>{
                console.log(data.toString())
            })

            stream.on('error',()=>{
                res.status(201).json({error:'Couldn\'t setup cron task for pipeline.'})
            })

            stream.on('end',()=>{
                console.log('end')
                pipeline.save()
                res.status(201).json({pipeline})
            })

        }
        else{
            console.log(pipeline)
            pipeline.save()
            res.status(201).json({pipeline})
        }
        
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.post('/pipelines/executions', [auth, checkPermission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const executions = await Pipeline.getExecutions(pipeline_id)
        res.status(200).json({executions})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.delete('/pipelines/all', [auth, checkPermission], async(req, res) => {

    const { project_id } = req.body

    try{
        const pipelines = await Pipeline.find({project_id})
        pipelines.forEach(pipeline => pipeline.delete())
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.delete('/pipelines', [auth, checkPermission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const pipeline =  await Pipeline.findById(pipeline_id )
        const project = await Project.findById(pipeline.project_id)
        pipeline.delete(project, req.user)
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})



module.exports = router