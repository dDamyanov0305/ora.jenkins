const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Pipeline = require('../models/Pipeline')
const Execution = require('../models/Execution')
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
            res.status(404).send('Couldn\'t find execution with that id and name.')
            
        res.status(200).json(execution)
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