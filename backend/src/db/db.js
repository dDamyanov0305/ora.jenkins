const mongoose = require('mongoose')
const Grid = require("gridfs-stream")

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
})

Grid.mongo = mongoose.mongo
const conn = mongoose.connection

const gfsPromise = new Promise((resolve, reject)=>
{
    try
    {
        conn.once('open', () => resolve(Grid(conn.db)))
    }
    catch(err)
    {
        reject(err)
    }
})


module.exports = gfsPromise


