const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkPermission = require('../middleware/checkPermission')
const Project = require('../models/Project')

router.post('/projects/all', [auth, checkPermission], async(req, res) => {

    try{
        const projects = await Project.find({ workspace_id: req.workspace._id })
        res.status(200).json(projects)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }

})

router.post('/projects/get', [auth, checkPermission], async(req, res) => {

    const { project_id } = req.body

    try{
        const projects = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })

        if(!projects)
            res.status(404).send('Couldn\'t find project with that id and name.')

        res.status(200).json(projects)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
    
})


router.post('/projects/create', [auth, checkPermission], async(req, res) => {

    const { name, repository, hosting_provider } = req.body

    try{
        const project = await Project.create({ name, repository, hosting_provider, workspace_id: req.workspace._id, assigned_team: [req.user._id], create_date: Date.now() })
        res.status(201).json(project)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.post('/projects/assign', [auth, checkPermission], async(req, res) => {

    const { project_id, assignee_id } = req.body

    try{
        const project = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })
        const assignee = await User.findOne({ _id: assignee_id })

        if(!project || !assignee)
            res.status(404).send("Couldn\'t find project with that id and name.")

        project.assigned_team.push(assignee_id)
        project.save()

        res.status(200).json(project)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.post('/projects/unassign', [auth, checkPermission], async(req, res) => {

   const { project_id, assignee_id } = req.body

    try{
        const project = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })
        const assignee = await User.findOne({ _id: assignee_id })

        if(!project || !assignee)
            res.status(404).send("Couldn\'t find project with that id and name.")

        project.assigned_team = project.assigned_team.filter(id => id != assignee_id)
        project.save()
        res.status(200).json(project)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.delete('/projects/all', [auth, checkPermission], async(req, res) => {

    try{
        await Project.deleteMany({ workspace_id: req.workspace._id })
        res.sendStatus(200)
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})


module.exports = router