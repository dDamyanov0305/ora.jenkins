const express = require('express')
const cors = require('cors');
const port = process.env.PORT

require('./db/db')

const app = express()

app.use(cors())
app.use(express.json())

app.use(require('./routers/user'))
app.use(require('./routers/integration'))
app.use(require('./routers/github'))
app.use(require('./routers/action'))
app.use(require('./routers/execution'))
app.use(require('./routers/pipeline'))
app.use(require('./routers/project'))
app.use(require('./routers/webhook'))
app.use(require('./routers/workspace'))
app.use(require('./routers/ora'))


app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
