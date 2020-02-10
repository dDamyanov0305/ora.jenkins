const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Integration = require('../models/Integration')
const User = require('../models/User')
const integrationTypes = require('../constants').integrationTypes
const fetch = require('node-fetch')

router.get('/github/oauth', auth, async (req, res) => {

    const { code } = req.query

    if(!code)
        res.sendStatus(403)
    
    try{
        const result = await fetch(`https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}&client_secret=${process.env.GITHUB_OAUTH_CLIENT_SECRET}&code=${code}`,
        {
            method:'POST',
            headers:{'Accept':'application/json'},
        })
    
        if(result.status < 200 || result.status >= 300){
            res.sendStatus(result.status)
        }
        else{
            const data = await result.json()
            const integration = await Integration.create({ user_id: req.user._id, type:integrationTypes.GITHUB, token:data.access_token })
            res.sendStatus(201).json({integration})
        }

    }
    catch(err){
        console.log(err)
        res.sendStatus(500)
    }

})

router.get('/github/repos', auth, async (req, res) => {

    const integration = await Integration.findOne({user_id: req.user._id, type: integrationTypes.GITHUB})

    if(!integration){
        res.sendStatus(400)
    }

    const result = await fetch('https://api.github.com/user/repos',{
        headers:{
            "Content-type": "application/json",
            "Authorization": "token " + integration.token
        }
    })

    if(result.status < 200 || result.status >= 300){
        res.sendStatus(result.status)
    }
    else{
        const projects = await res.json()
        res.status(200).json({projects})
    }
})


module.exports = router