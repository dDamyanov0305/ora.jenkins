const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Integration = require('../models/Integration')
const User = require('../models/User')
const integrationTypes = require('../constants').integrationTypes
const fetch = require('node-fetch')

router.get('/ora/oauth', auth, async (req, res) => {

    const { code } = req.query

    if(!code){
        console.log('NO CODE')
        res.redirect('http://localhost:3000/dashboard')
    }
    
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
                redirect_uri:'http://localhost:5000/ora/oauth'
            })
        })
    
        if(result.status < 200 || result.status >= 300){
            console.log(result.status)
            res.redirect('http://localhost:3000/dashboard')
        }
        else{
            const data = await result.json()
            const integrtion = await Integration.create({ user_id: req.user._id, type:integrationTypes.ORA, token:data.access_token })
            if(!integrtion) 
                res.redirect('http://localhost:3000/dashboard')

            res.redirect('http://localhost:3000/successful')
        }

    }
    catch(err){
        console.log(err)
        res.sendStatus(500)
    }

})
//QKx1TDcT4UbDBrmXStxjmQR2zUd1MakKOVxfqdXOsOlxuVyYJHIyKu7Ax594K5Q8g7UnBljypsbohS

router.get('/ora/projects', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

    if(!integration){
        res.sendStatus(400)
    }

    const result = await fetch('https://api.ora.pm/projects',{
        headers:{"Authorization": "Bearer " + integration.token}
    })

    if(result.status < 200 || result.status >= 300){
        res.sendStatus(result.status)
    }else{
        const data = await result.json()
        res.json({projects:data.data})
    }
})

router.get('/ora/tasks', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

    if(!integration){
        res.sendStatus(400)
    }

    const { project_id } = req.body

    const result = await fetch(`https://api.ora.pm/projects/${project_id}/tasks`,{
        headers:{"Authorization": "Bearer " + integration.token}
    })

    if(result.status < 200 || result.status >= 300){
        res.sendStatus(result.status)
    }else{
        const data = await result.json()
        res.json({tasks:data.data})
    }
})


router.get('/ora/lists', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

    if(!integration){
        res.sendStatus(400)
    }

    const { project_id } = req.body

    const result = await fetch(`https://api.ora.pm/projects/${project_id}/lists`,{
        headers:{"Authorization": "Bearer " + integration.token}
    })

    if(result.status < 200 || result.status >= 300){
        res.sendStatus(result.status)
    }else{
        const data = await result.json()
        res.json({tasks:data.data})
    }
})

router.get('/ora/linkAction', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

    if(!integration){
        res.sendStatus(400)
    }

    const { ora_project_id, ora_task_id, ora_list_id_on_failure, ora_list_id_on_success, action_id } = req.body

    const action = await Action.findOne({_id:action_id})

    action.ora_task_id = ora_task_id
    action.ora_project_id = ora_project_id
    action.ora_list_id_on_success = ora_list_id_on_success
    action.ora_list_id_on_failure = ora_list_id_on_failure

    action.save()
    res.json({action})
})



module.exports = router