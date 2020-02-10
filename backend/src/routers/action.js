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
        const action =  await Action.create({ name, execute_commands, trigger_time, pipeline_id, prev_action_id, variables, docker_iamge_name, docker_iamge_tag })

        if(!action)
            res.sendStatus()

        res.status(201).json(action)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.post('/actions/execute', [auth, checkPermission], async (req, res) => {

    const { piepline_id, action_id, comment, revision } = req.body

    try{
        const action = await Action.findOne({ piepline_id, _id: action_id })

        if(!action)
            res.status(404).send('Couldn\'t find action with that id and name.')

        action.build(triggerModes.MANUAL, comment, req.user.name, revision)
       
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

    container = await docker.getContainer("cb301e5b7ce1ee6443ef4d0360b401388beead097a2fce6830a994d7a50233e")
    let ins = await container.inspect()

    if(!ins.State.Running){
        await container.start()
    }



    const outputStream = new Stream.Writable()
    const errorStream = new Stream.Writable()

    outputStream._write = (chunk, encoding, next) => {
        console.log(chunk.toString())
        next()
    }
    errorStream._write = (chunk, encoding, next) => {
        console.log(chunk.toString())
        next()
    }      

    // const clone_command = `git clone https://github.com/${project.repository}.git`

    // const cron_format = '* * * * *'

    // //for recurent tasks
    // const setup_commands1 = [
    //     'apt-get update && apt-get -y install cron',
    //     'touch /var/log/cron.log && touch /etc/cron.d/cron-job'
    //     `echo -e  "${cron_format} (${exec_commands}) > /var/log/cron.log\n" > /etc/cron.d/cron-job`,
    //     'chmod 0644 /etc/cron.d/cron-job',
    //     'crontab /etc/cron.d/cron-job'
    // ]

    // //for normal tasks
    // const setup_commands2 = [
    //     'mkdir /var/log/ora.jenkins'
    //     `(${exec_commands}) > /var/log/ora.jenkins/log#${1}.log`,
    // ]

    
    const exec = await container.exec({Cmd:['/bin/bash', '-c', `(echo fufck && ls) > /var/log/ora.jenkins/log${1}.log && cat /var/log/ora.jenkins/log${1}.log`], AttachStdin: true, AttachStdout: true, AttachStderr: true })
    const stream = await exec.start({hijack:true})
    const status = await exec.inspect()
    const logs = await container.logs({stdout:true, stderr:true})
    container.copy()

    docker.modem.demuxStream(stream, outputStream, errorStream)
    res.json({container, exec})
})



module.exports = router