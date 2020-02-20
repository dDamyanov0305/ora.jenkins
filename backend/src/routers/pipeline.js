const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Pipeline = require('../models/Pipeline')
const Project = require('../models/Project')
const Integration = require('../models/Integration')
const {triggerModes, integrationTypes} = require('../constants')
const checkPermission = require('../middleware/checkPermission')
const fetch = require('node-fetch')

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
            res.status(201).json({pipeline})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
    
})

router.post('/pipelines/run', [auth, checkPermission], async(req, res) => {

    const { pipeline_id, comment, revision, triggerMode } = req.body

    try{
        const pipeline = await Pipeline.findById(pipeline_id)
        if(!pipeline){
            res.status(404).send()
        }else{
            pipeline.run(triggerMode, comment, req.user.email, revision)
            res.status(200).send()
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
    
})


router.post('/pipelines/create', [auth, checkPermission], async(req, res) => {

    const { 
        piepline_name: name, 
        branch, 
        trigger_mode, 
        project_id, 
    } = req.body

    try{
        const pipeline = new Pipeline({ 
            name, 
            branch, 
            trigger_mode, 
            project_id, 
            creator: req.user._id, 
            create_date: Date.now() 
        })

        const project = await Project.findById(project_id)
        console.log(project)
        
        if(!pipeline || !project)
            throw Error('Couldn\'t create pipeline.')

        if(trigger_mode == triggerModes.PUSH){

            const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITHUB})
            console.log(integration)
            const result = await fetch(`https://api.github.com/repos/${project.repository}/hooks`,{
                method:'POST',
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "token " + integration.token
                },
                body:{
                    "name": "web",
                    "active": true,
                    "events": [
                        "push",
                    ],
                    "config": {
                        "url": `https://localhost:5000/pipelines/${pipeline._id}/webhook-trigger`,
                        "content_type": "json",
                        "insecure_ssl": "0"
                    }
                }
            })
        
            if(result.status < 200 || result.status >= 300){
                console.log(result.status)
                return res.status(403).json({error:'You are not authorized to create hooks.'})
            }

        }
        pipeline.save()
        res.status(201).json({pipeline})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.delete('/pipelines/all', [auth, checkPermission], async(req, res) => {

    const { project_id } = req.body

    try{
        await Pipeline.deleteMany({ project_id })
        res.status(200)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.delete('/pipelines/delete', [auth, checkPermission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        await Pipeline.deleteOne({ _id: pipeline_id })
        res.status(200)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})



module.exports = router