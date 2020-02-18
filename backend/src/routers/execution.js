const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const docker = require('../docker/Docker')
const Execution = require('../models/Execution')
const Action = require('../models/Action')
const checkPermission = require('../middleware/checkPermission')
const { triggerModes, executionStatus } = require('../constants')

router.post('/executions/all', [auth, checkPermission], async(req, res) => {

    const { action_id } = req.body

    try{
        const executions = await Execution.find({ action_id })
        res.status(200).json(executions)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }

})


router.post('/executions/get', [auth, checkPermission], async(req, res) => {

    const { execution_id, action_id } = req.body

    try{
        const execution = await Execution.findOne({ action_id, _id: execution_id })

        if(!execution)
            return res.status(404).send('Couldn\'t find execution with that id and name.')


        const action = await Action.findOne({_id:action_id})
        const container = docker.getContainer(action.docker_container_id)

        const info = await container.inspect()

        if(!info.State.Running) await container.start()

        const exec = await container.exec({
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['/bin/bash', '-c', `cat /var/log/ora.jenkins/log${execution.number}.log`]
        })
            
        const stream = await exec.start()
        let log = ''

        stream.on('data', chunk => {
            log += chunk.toString()
        })

        stream.on('end', chunk => {
            return res.status(200).json({...execution, log})
        })

            
        
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
    
})


router.post('/execution/create', [auth, checkPermission], async(req, res) => {

    const { action_id, comment, revision, trigger } = req.body

    try{
        const execution =  await Execution.create({ action_id, comment, revision, trigger, date: Date.now })
        if(!execution)
            throw Error('Couldn\'t create execution.')
        res.status(201).json(action)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})




module.exports = router