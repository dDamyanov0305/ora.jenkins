const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Integration = require('../models/Integration')
const User = require('../models/User')
const integrationTypes = require('../constants').integrationTypes
const fetch = require('node-fetch')

router.get('/ora/oauth', auth, async (req, res) => {

    const integration = await Integration.findOne({ user_id: req.user._id, type: integrationTypes.ORA })

    if(integration)
        return res.status(200).json({integration})
    

    const { code } = req.query
    console.log(code,  process.env.ORA_OAUTH_CLIENT_ID, process.env.ORA_OAUTH_CLIENT_SECRET )

    if(!code)
        res.status(403).send()    
    
    try{
        const result = await fetch(`https://api.ora.pm/oauth/token`,
        {
            method:'POST',
            headers:{'Content-Type': 'application/json'},
            body:JSON.stringify({
                client_id: process.env.ORA_OAUTH_CLIENT_ID,
                client_secret: process.env.ORA_OAUTH_CLIENT_SECRET,
                code,
                grant_type:'authorization_code',
                redirect_uri:'http://localhost:3000/ora/oauth/callback'
            })
        })
        const data = await result.json()
        console.log(data)
        if(result.status < 200 || result.status >= 300){
            res.status(result.status).send()        
        }
        else{
            const integration = await Integration.create({ user_id: req.user._id, type:integrationTypes.ORA, token:data.access_token })
            res.status(201).json({integration})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})
//QKx1TDcT4UbDBrmXStxjmQR2zUd1MakKOVxfqdXOsOlxuVyYJHIyKu7Ax594K5Q8g7UnBljypsbohS

router.get('/ora/projects', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

    if(!integration){
        res.status(400).send()
    }

    const result = await fetch('https://api.ora.pm/projects',{
        headers:{"Authorization": "Bearer " + integration.token}
    })

    if(result.status < 200 || result.status >= 300){
        res.status(result.status).send()
    }else{
        const data = await result.json()
        res.json({projects:data.data})
    }
})

router.post('/ora/tasks_and_lists', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

    if(!integration){
        res.status(400).send()
    }

    const { project_id } = req.body

    const tasksRes = await fetch(`https://api.ora.pm/projects/${project_id}/tasks`,{
        headers:{"Authorization": "Bearer " + integration.token}
    })

    const listsRes = await fetch(`https://api.ora.pm/projects/${project_id}/lists`,{
        headers:{"Authorization": "Bearer " + integration.token}
    })

    if(tasksRes.status < 200 || tasksRes.status >= 300 || listsRes.status < 200 || listsRes.status >= 300)
    {
        res.status(tasksRes.status).send()
    }
    else
    {
        const {data: tasks} = await tasksRes.json()
        const {data: lists} = await listsRes.json()
        res.status(200).json({tasks, lists})
    }
})
//task 2885761
//list 820557

// router.get('/ora/lists', auth, async (req, res) => {

//     const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

//     if(!integration){
//         res.status(400).send()
//     }

//     const { project_id } = req.body

//     const result = await fetch(`https://api.ora.pm/projects/${project_id}/lists`,{
//         headers:{"Authorization": "Bearer " + integration.token}
//     })

//     if(result.status < 200 || result.status >= 300){
//         res.status(result.status).send()
//     }else{
//         const data = await result.json()
//         res.json({tasks:data.data})
//     }
// })

// router.get('/ora/linkAction', auth, async (req, res) => {

//     const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

//     if(!integration){
//         res.status(400).send()
//     }

//     const { ora_project_id, ora_task_id, ora_list_id_on_failure, ora_list_id_on_success, action_id } = req.body

//     const action = await Action.findOne({_id:action_id})

//     action.ora_task_id = ora_task_id
//     action.ora_project_id = ora_project_id
//     action.ora_list_id_on_success = ora_list_id_on_success
//     action.ora_list_id_on_failure = ora_list_id_on_failure

//     action.save()
//     res.json({action})
// })



module.exports = router