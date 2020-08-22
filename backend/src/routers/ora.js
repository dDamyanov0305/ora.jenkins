const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const Integration = require('../models/Integration')
const integrationTypes = require('../constants').integrationTypes
const auth = require('../middleware/auth')

router.use(auth)

router.get('/ora/oauth', async (req, res) => {

    const integration = await Integration.findOne({ user_id: req.user._id, type: integrationTypes.ORA })

    if(integration)
        res.status(200).json({ integration })
    

    const { code } = req.query

    if(!code)
        res.status(400).end()    
    

    const result = await fetch(`https://api.ora.pm/oauth/token`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            client_id: process.env.ORA_OAUTH_CLIENT_ID,
            client_secret: process.env.ORA_OAUTH_CLIENT_SECRET,
            code,
            grant_type:'authorization_code',
            redirect_uri:'http://localhost:3000/ora/oauth/callback'
        })
    })

    const data = await result.json()

    if(result.status < 200 || result.status >= 300) {

        res.status(result.status).json({ error: data })        

    } else{

        const integration = await Integration.create({ user_id: req.user._id, type:integrationTypes.ORA, token:data.access_token })

        res.status(201).json({ integration })

    }

})

router.get('/ora/projects', async (req, res) => {

    const integration = await Integration.findOne({ user_id: req.user._id, type: integrationTypes.ORA })

    if(!integration)
        res.status(400).end()
    

    const result = await fetch('https://api.ora.pm/projects', {
        headers: { "Authorization": "Bearer " + integration.token }
    })

    
    if(result.status < 200 || result.status >= 300) {

        let response = await result.text()

        res.json({ projects: [], error: response, status: result.status })

    } else {

        const data = await result.json()

        res.status(200).json({ projects: data.data })

    }
})

router.post('/ora/tasks_and_lists', async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.ORA})

    if(!integration)
        res.status(400).end()

    const { project_id } = req.body

    const headers = { "Authorization": "Bearer " + integration.token }

    const tasksRes = await fetch(`https://api.ora.pm/projects/${project_id}/tasks`, { headers })

    const listsRes = await fetch(`https://api.ora.pm/projects/${project_id}/lists`, { headers })

    if(tasksRes.status < 200 || tasksRes.status >= 300 || listsRes.status < 200 || listsRes.status >= 300) {

        res.status(tasksRes.status).send()

    } else {

        const { data: tasks } = await tasksRes.json()

        const { data: lists } = await listsRes.json()

        res.status(200).json({ tasks, lists })

    }

})

router.post('/ora/organizations', auth, async (req, res) => {

    const integration = await Integration.findOne({ user_id: req.user._id, type: integrationTypes.ORA })

    if(!integration)
        res.status(400).end()

    const result = await fetch(`https://api.ora.pm/organizations`, {
        headers: { "Authorization": "Bearer " + integration.token }
    })


    if(result.status < 200 || result.status >= 300) {

        res.status(result.status).end()

    } else {

        const data = await result.json()

        res.status(200).json({ organizations:data.data })

    }

})

router.post('/ora/organization_members', auth, async (req, res) => {


    const integration = await Integration.findOne({ user_id: req.user._id, type: integrationTypes.ORA })

    if(!integration)
        res.status(400).end()
    

    const { organization_id } = req.body

    const result = await fetch(`https://api.ora.pm/organizations/${organization_id}/members`, {
        headers: { "Authorization": "Bearer " + integration.token }
    })


    if(result.status < 200 || result.status >= 300) {

        res.status(result.status).send()
    
    } else {

        const data = await result.json()

        console.log(data)

        res.status(200).json({members:data.data})

    }

})

module.exports = router