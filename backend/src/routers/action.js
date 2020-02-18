const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Pipeline = require('../models/Pipeline')
const Action = require('../models/Action')
const checkPermission = require('../middleware/checkPermission')
const triggerModes  = require('../constants').triggerModes
const docker = require('../docker/Docker')
const fs = require('fs')
const Stream = require('stream')

router.post('/actions/all', [auth, checkPermission], async(req, res) => {

    const { piepline_id } = req.body

    try{
        const actions = await Action.find({ piepline_id })
        res.status(200).json(actions)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }

})



router.post('/actions/get', [auth, checkPermission], async(req, res) => {

    const { piepline_id, action_id } = req.body

    try{
        const action = await Action.findOne({ piepline_id, _id: action_id })
        if(!action)
            res.status(404).send('Couldn\'t find action with that id and name.')
        res.status(200).json(action)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
    
})


router.post('/actions/create', [auth, checkPermission], async(req, res) => {

    const { action_name: name, execute_commands, trigger_time, pipeline_id, prev_action_id, variables, docker_iamge_name, docker_iamge_tag } = req.body

    try{
        const pipeline = await Pipeline.findOne({_id:pipeline_id})
        const project = await project.findOne({_id:pipeline.project_id})

        const container = await docker.createContainer({
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Image: docker_image_name,
            Env: variables.map(({key, value})=>`${key}=${value}`)
        })

        if(!container){
            res.sendStatus(500).end()
        }

        const action =  await Action.create({ name, execute_commands, trigger_time, pipeline_id, prev_action_id, variables, docker_iamge_name, docker_iamge_tag, docker_container_id: container.id })
        if(!action)
            res.sendStatus(500)
        else{

            const setup_commands = [
                `git clone https://github.com/${project.repository}.git`, 
                `mkdir /var/log/ora.jenkins`
            ]
    
            if(pipeline.triggerMode === triggerModes.RECCURENTLY){
                setup_commands.concat([
                    'apt-get update && apt-get -y install cron && sudo apt-get -y install curl',
                    'touch /var/log/cron.log && touch /etc/cron.d/cron-job',
                    `curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${req.token}" -d '{"triggerMode":"${triggerModes.RECCURENTLY}", "action_id":"${action_id}", "comment":"${req.body.comment}", "revision":"", "user_id":"${req.user._id}"}' ${process.env.SERVER_ADDRESS}/actions/execute`,
                    'chmod 0644 /etc/cron.d/cron-job',
                    'crontab /etc/cron.d/cron-job'
                ])
            }
    
            action.setup_commands = setup_commands
            action.save()
    
    
            res.status(201).json({action})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.post('/actions/execute', [auth, checkPermission], async (req, res) => {

    const { action_id, comment, revision, triggerMode } = req.body

    try{
        const action = await Action.findOne({ _id: action_id })

        if(!action)
            res.status(404).send('Couldn\'t find action with that id and name.')

        action.build(triggerMode, comment, req.user.name, revision)
       
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.delete('/actions', [auth, checkPermission], async(req, res) => {

    const { piepline_id } = req.body

    try{
        await Pipeline.deleteMany({piepline_id})
        res.status(200)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.delete('/action', [auth, checkPermission], async(req, res) => {

    const { piepline_id, action_id } = req.body

    try{
        await Pipeline.deleteOne({piepline_id, action_id})
        res.status(200)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.get('/action/test', async(req, res) => {

 //container = await docker.getContainer("09f6d8625948a9258d73451097acbbe5c3d1f98340feac8443b89b792d3416c1")

    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', `cd tp-app-2 && ls && git pull`]
    })

    const stream = await exec.start({Tty: true})
    stream.on('data', data => console.log(data.toString()))


   // build_image('tp-app-2')

})

const build_image = async (dir_name) => {
    container = await docker.getContainer("0cf59d1f17151aa19feb320a98ad24cb95964ddf697aed3def1281bc67beda67")

    let ins = await container.inspect()
    if(!ins.State.Running){
        await container.start()
    }

    const out = fs.createWriteStream('../../output.tar')
    const stream = await container.getArchive({id: container.id, path: dir_name})
    stream.pipe(out) 

    stream.on('end', async () => {
        const re = fs.createReadStream('../../output.tar')
        const resp = await docker.buildImage(re, {t: 'testimage', dockerfile: `./${dir_name}/Dockerfile`})
        resp.on('data',data => console.log(data.toString()))
        resp.on('error',() => console.log('err'))
        resp.on('end',() => {
            console.log('end')
        })
    })


}



module.exports = router