const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const check_permission = require('../middleware/check_permission')
const PipelineController = require('../controllers/PipelineController')
const ActionController = require('../controllers/ActionController')
const Action = require('../models/Action')

router.post('/actions/all', [auth, check_permission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const actions = await PipelineController.getActionsForPipeline(pipeline_id)
        res.status(200).json({actions})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.post('/actions/get', [auth, check_permission], async(req, res) => {

    const { pipeline_id, action_id } = req.body

    try{
        const action = await Action.findOne({ pipeline_id, _id: action_id })
        if(!action)
            res.status(404).json({error:'Couldn\'t find action with that id and name.'})
        res.status(200).json(action)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
    
})

router.post('/actions/create', [auth, check_permission], async(req, res) => {

    const { 
        name, 
        execute_commands, 
        pipeline_id, 
        prev_action_id, 
        next,
        variables, 
        shell_script,
        task_linkage,
        ora_task_id,
        ora_project_id,
        ora_list_id_on_success,
        ora_list_id_on_failure
    } = req.body

    const action = new Action({ 
        name, 
        execute_commands: JSON.parse(execute_commands), 
        pipeline_id, 
        prev_action_id: prev_action_id || null, 
        variables: JSON.parse(variables), 
        task_linkage: JSON.parse(task_linkage),
        shell_script: JSON.parse(shell_script),
        ora_task_id: JSON.parse(ora_task_id),
        ora_project_id: JSON.parse(ora_project_id),
        ora_list_id_on_success: JSON.parse(ora_list_id_on_success),
        ora_list_id_on_failure: JSON.parse(ora_list_id_on_failure) 
    })

    if(next){
        var next_action = await Action.findById(next)
        next_action.prev_action_id = action._id
        await next_action.save()
    }

    if(JSON.parse(shell_script)){
        await ActionController.save_shell_script(req.files.execute_script.data)
    }

    await action.save()
    res.status(201).json({action})

})


router.delete('/actions/all', [auth, check_permission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const actions = await Action.find({ pipeline_id })
        actions.forEach(action => action.delete())
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.delete('/actions', [auth, check_permission], async(req, res) => {

    const { action_id } = req.body

    console.log(action_id)

    try{
        const action = await Action.findById(action_id)
        let result = await action.delete()
        res.status(200).send(result)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

module.exports = router