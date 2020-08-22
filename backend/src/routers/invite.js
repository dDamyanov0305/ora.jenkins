const express = require('express')
const router = express.Router()
const Invite = require('../models/Invite')
const { inviteStatus } = require('../constants')
const auth = require('../middleware/auth')
const check_permission = require('../middleware/check_permission')

router.use([auth, check_permission])

router.get('/invites', async (req, res) => {

    let invites = await Invite.find({ email: req.user.email })

    res.status(200).json({ invites })

})

router.post('/invites/create', async (req, res) => {

    const { email, workspace_id, sender_id } = req.body

    const workspace = await Workspace.findById(workspace_id)

    const users_in_workspace = workspace.assigned_team.map(async(id)=> await User.findById(id))

    const emails = users_in_workspace.map(user => user.email)

    if(!emails.includes(email)) {

        await transporter.sendMail({
            from: req.user.email,
            to: email,
            subject: `Invite to Ora.CI workspace ${workspace.name}`, 
            html:`<a href="http://localhost:3000/invites"`
        })

        let invite = await Invite.create({ email, workspace_id, sender_id, status: inviteStatus.PENDING })
        
        
    }
    
    res.status(200).end()

})

router.post('/invites/resolve', async (req, res) => {

    const { invite_id, resolved_status } = req.body
    
    const invite = await Invite.findById(invite_id)

    if(resolved_status === inviteStatus.ACCEPTED) {

        const workspace = await Workspace.findById(invite.workspace_id)

        workspace.assigned_team = [...workspace.assigned_team, req.user._id]

        invite.status = resolved_status

        await invite.save()

        await workspace.save()

    } else if(resolved_status === inviteStatus.REJECTED) {

        invite.status = resolved_status

        await invite.save()

    }

    res.status(200).end()
       
})