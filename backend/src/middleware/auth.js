const jwt = require('jsonwebtoken')
const User = require('../models/User')


const auth = async(req, res, next) => {

    const tokens = req.header('Authorization')
    let token = null

    try {

        if(!tokens || !tokens.includes('Bearer ') || !(token = tokens.replace('Bearer ', ''))){
            res.status(401).json({ error:'No authentication token present in headers.' })
        }

        const data = jwt.verify(token, process.env.JWT_KEY)

        const user = await User.findOne({ _id: data._id, 'tokens.token': token })

        if (!user) 
            res.status(401).json({ error:'Invalid token.' })
        
        req.user = user
        req.token = token
        
        next()
    } catch (error) {
        res.status(401).json({error: 'Not authorized to access this resource.'})
    }

}

module.exports = auth
