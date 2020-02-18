const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Pipeline = require('../models/Pipeline')
const triggerModes = require('../constants').triggerModes
const checkPermission = require('../middleware/checkPermission')
const fetch = require('node-fetch')

router.post('/pipelines/all', [auth, checkPermission], async(req, res) => {

    const { project_id } = req.body

    try{
        const pipelines = await Pipeline.find({ project_id })
        res.status(200).json(pipelines)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }

})


router.post('/pipelines/get', [auth, checkPermission], async(req, res) => {

    const { project_id, pipeline_id: _id, pipeline_name: name } = req.body

    try{
        const pipeline = await Pipeline.findOne({ project_id, _id, name })
        if(!pipeline)
            res.status(404).send('Couldn\'t find pipeline with that id and name.')

        res.status(201).json(pipeline)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
    
})


router.post('/pipelines/create', [auth, checkPermission], async(req, res) => {

    const { piepline_name: name, branch, trigger_mode, project_id, repository } = req.body

    try{
        const pipeline = new Pipeline({ name, branch, trigger_mode, project_id, creator: req.user._id, create_date: Date.now() })
        
        if(!pipeline)
            throw Error('Couldn\'t create pipeline.')

        if(trigger_mode == triggerModes.PUSH){

            const result = await fetch(`https://api.github.com/repos/${repository}/hooks`,{
                method:'POST',
                headers:{
                    "Content-type": "application/json",
                    "Authorization": req.user.github_token
                },
                body:{
                    "name": "web",
                    "active": true,
                    "events": [
                        "push",
                    ],
                    "config": {
                        "url": `https://localhost:5000/${req.workspace.name}/${repository}/pipeline/${pipeline._id}/webhook-trigger`,
                        "content_type": "json",
                        "insecure_ssl": "0"
                    }
                }
            })
        
            if(result.status < 200 || result.status >= 300)
                res.status(403).send('You are not authorized to create hooks.')

            pipeline.save()
        }
       

        res.status(201).json(pipeline)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.delete('/pipelines/all', [auth, checkPermission], async(req, res) => {

    const { project_id } = req.body

    try{
        await Pipeline.deleteMany({ project_id })
        res.sendStatus(200)
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
        res.sendStatus(200)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})



module.exports = router