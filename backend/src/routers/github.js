const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Integration = require('../models/Integration')
const Project = require('../models/Project')
const integrationTypes = require('../constants').integrationTypes
const fetch = require('node-fetch')

router.get('/github/oauth', auth, async (req, res) => {

    const integration = await Integration.findOne({ user_id: req.user._id, type: integrationTypes.GITHUB })

    if(integration)
        return res.status(200).json({integration})


    const { code } = req.query

    if(!code)
        res.status(403).send()
    
    try{
        const result = await fetch(`https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}&client_secret=${process.env.GITHUB_OAUTH_CLIENT_SECRET}&code=${code}`,
        {
            method:'POST',
            headers:{'Accept':'application/json'},
        })
    
        if(result.status < 200 || result.status >= 300){
            res.status(result.status).send()
        }
        else{
            const { access_token: token } = await result.json()
            const getName = await fetch('https://api.github.com/user',{headers:{"Authorization":`token ${token}`}})
            const { login: username } = await getName.json()
            const integration = await Integration.create({ user_id: req.user._id, type:integrationTypes.GITHUB, token, username })
            res.status(201).json({integration})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({error})
    }

})

router.get('/github/repos', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITHUB})

    if(!integration){
        res.status(400).json({error:'Not integrated with selectet hosting provider.'})
    }

    const result = await fetch('https://api.github.com/user/repos',{
        headers:{
            "Content-type": "application/json",
            "Authorization": "token " + integration.token
        }
    })

    if(result.status < 200 || result.status >= 300){
        res.status(result.status).json({error:'Not integrated with selectet hosting provider.'})
    }
    else{
        const repos = await result.json()
        res.status(200).json({repos})
    }
})

router.post('/github/repo/branches', auth, async (req, res) => {

    const { project_id } = req.body
    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITHUB})
    const project = await Project.findById(project_id)

    if(!integration){
        res.status(400).json({error:'Not integrated with selectet hosting provider.'})
    }

    const result = await fetch(`https://api.github.com/repos/${project.repository}/branches`,{
        headers:{
            "Content-type": "application/json",
            "Authorization": "token " + integration.token
        }
    })

    if(result.status < 200 || result.status >= 300){
        res.status(result.status).json({error:'Error occured when fetching branches.'})
    }
    else{
        const data = await result.json()
        const branches = data.map(branch => branch.name)
        res.status(200).json({branches})
    }
})

router.post('/github/repo/commits', auth, async (req, res) => {

    const { project_id, branch } = req.body
    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITHUB})
    const project = await Project.findById(project_id)

    if(!integration){
        res.status(400).json({error:'Not integrated with selectet hosting provider.'})
    }

    const result = await fetch(`https://api.github.com/repos/${project.repository}/commits?sha=${branch}`,{
        headers:{
            "Content-type": "application/json",
            "Authorization": "token " + integration.token
        }
    })

    if(result.status < 200 || result.status >= 300){
        res.status(result.status).json({error:'Error occured when fetching branches.'})
    }
    else{
        const data = await result.json()
        const commits = data.map(commit => ({sha:commit.sha, message:commit.commit.message}))
        res.status(200).json({commits})
    }
})


module.exports = router