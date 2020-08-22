const express = require('express')
const router = express.Router()
const Project = require('../models/Project')
const Pipeline = require('../models/Pipeline')
const auth = require('../middleware/auth')
const check_permission = require('../middleware/check_permission')
import socketServer from '../socket'

router.use([auth, check_permission])

router.post('/projects/all', async(req, res) => {

    let projects = await Project.find({ workspace_id: req.workspace._id })

    projects = projects.map(async (project) => {

        const pipelinesCount = await Pipeline.countDocuments({ project_id:project._id })

        return { ...project.toObject(), pipelinesCount }

    })

    projects = await Promise.all(projects)

    res.status(200).json({ projects })

})

router.post('/projects/get', async(req, res) => {

    const { project_id } = req.body

    const projects = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })

    res.status(200).json({ projects })
    
})

router.post('/projects/create', async(req, res) => {

    const { name, repository, hosting_provider, id: repo_id } = req.body

    const project = await Project.create({ 
        name, 
        repository, 
        hosting_provider, 
        workspace_id: req.workspace._id, 
        assigned_team: [req.user._id], 
        repo_id 
    })

    socketServer.broadcast(req.workspace.members, { message:'new project', data: { project } })

    res.status(201).json({ project })

})

router.post('/projects/assign', async(req, res) => {

    const { project_id, assignee_id } = req.body
   
    const project = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })

    const assignee = await User.findOne({ _id: assignee_id })

    if(!project || !assignee)
        res.status(500).json({ error:"Couldn\'t find project with that id and name." })

    project.assigned_team.push(assignee_id)

    project.save()

    socketServer.broadcast(req.workspace.members, { message:'assigned user', data: { project } })

    res.status(200).json({ project })

})

router.post('/projects/unassign', async(req, res) => {

    const { project_id, assignee_id } = req.body

    const project = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })

    const assignee = await User.findOne({ _id: assignee_id })

    if(!project || !assignee)
        res.status(500).send({ error: "Couldn\'t find project with that id and name." })

    project.assigned_team = project.assigned_team.filter(id => id != assignee_id)

    project.save()

    socketServer.broadcast(req.workspace.members, { message:'unassigned user', data: { project } })

    res.status(200).json({ project })

})

router.delete('/projects/all', async(req, res) => {

    const projects = await Project.find({ workspace_id: req.workspace._id })

    projects.forEach(project => project.delete(req.user))

    res.status(200).end()

})

router.delete('/projects', async(req, res) => {

    const { project_id } = req.body

    const project = await Project.findById(project_id)

    let result = project.delete(req.user)

    socketServer.broadcast(req.workspace.members, { message:'deleted project', data: { project_id } })

    res.status(200).json({ result })
})

module.exports = router