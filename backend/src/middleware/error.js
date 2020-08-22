export default function (req, res, next) {
    try{
        next()
    } catch (error) {
        console.error(`This error occured from ${req.url}`)
        console.error(error)
        res.status(500).json({ error:error.message })
    }
}