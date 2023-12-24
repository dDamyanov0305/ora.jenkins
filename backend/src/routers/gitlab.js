const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Integration = require('../models/Integration')
const Project = require('../models/Project')
const integrationTypes = require('../constants').integrationTypes
const fetch = require('node-fetch')

router.get('/gitlab/oauth', auth, async (req, res) => {

    const integration = await Integration.findOne({ user_id: req.user._id, type: integrationTypes.GITLAB })

    if(integration)
        return res.status(200).json({integration})


    const { code } = req.query

    if(!code)
        res.status(403).send()
    
    try{
        const result = await fetch(`https://gitlab.com/oauth/token?client_id=${process.env.GITLAB_OAUTH_CLIENT_ID}&client_secret=${process.env.GITLAB_OAUTH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.CLIENT_ADDRESS}/${process.env.GITLAB_OAUTH_REDIRECT_ENDPOINT}`,
        {
            method:'POST',
            headers:{'Accept':'application/json'},
        })
    
        if(result.status < 200 || result.status >= 300){
            res.status(result.status).send()
        }
        else{
            const { access_token: token, refresh_token, expires_in } = await result.json()

            const getNameResult = await fetch('https://gitlab.com/api/v4/user',{headers:{"Authorization":`Bearer ${token}`}})

            const { username } = await getNameResult.json()

            const integration = await Integration.create({ 
                user_id: req.user._id, 
                type:integrationTypes.GITLAB, 
                token,
                username, 
                refresh_token, 
                expires_in 
            })
            res.status(201).json({integration})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({error})
    }

})

router.get('/gitlab/repos', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITLAB})

    if(!integration){
        res.status(400).json({error:'Not integrated with selectet hosting provider.'})
    }

    const result = await fetch('https://gitlab.com/api/v4/projects',{
        headers:{
            "Content-type": "application/json",
            "Authorization": "PRIVATE-TOKEN: " + integration.token
        }
    })

    if(result.status < 200 || result.status >= 300){
        res.status(result.status).json({error:'Not integrated with selectet hosting provider.'})
    }
    else{
        const _repos = await result.json()

        personal_repos = _repos.map(repo => ({...repo, full_name:repo.path_with_namespace}))
        res.status(200).json({personal_repos})
    }
})

router.post('/gitlab/repo/branches', auth, async (req, res) => {

    const { project_id } = req.body
    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITLAB})
    const project = await Project.findById(project_id)

    if(!integration){
        res.status(400).json({error:'Not integrated with selectet hosting provider.'})
    }

    const result = await fetch(`https://gitlab.com/api/v4/projects${project.repo_id}/repository/branches`,{
        headers:{
            "Content-type": "application/json",
            "Authorization": "PRIVATE-TOKEN: " + integration.token
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

router.post('/gitlab/repo/commits', auth, async (req, res) => {

    const { project_id, branch } = req.body
    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITLAB})
    const project = await Project.findById(project_id)

    if(!integration){
        res.status(400).json({error:'Not integrated with selectet hosting provider.'})
    }

    const result = await fetch(`https://gitlab.com/api/v4/projects${project.repo_id}/repository/commits?ref_name=${branch}`,{
        headers:{
            "Content-type": "application/json",
            "Authorization": "PRIVATE-TOKEN: " + integration.token
        }
    })

    if(result.status < 200 || result.status >= 300){
        res.status(result.status).json({error:'Error occured when fetching branches.'})
    }
    else{
        const data = await result.json()
        const commits = data.map(commit => ({sha:commit.id, message:commit.message}))
        console.log(commits)
        res.status(200).json({commits})
    }
})

module.exports = router