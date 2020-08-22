const express = require('express')
const app = express()
const cors = require('cors');
const fileUpload = require('express-fileupload')
const port = process.env.PORT
import './middleware/error'

app.use(error)
app.use(cors())
app.use(express.json())
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles : false,
  }));

app.use(require('./routers/user'))
app.use(require('./routers/integration'))
app.use(require('./routers/github'))
app.use(require('./routers/gitlab'))
app.use(require('./routers/action'))
app.use(require('./routers/pipeline'))
app.use(require('./routers/project'))
app.use(require('./routers/workspace'))
app.use(require('./routers/executions'))
app.use(require('./routers/ora'))

const server = require('http').createServer(app);
const io = require('socket.io')(server, {});

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
