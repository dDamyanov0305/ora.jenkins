const express = require('express')
const cors = require('cors');
const fileUpload = require('express-fileupload')
const morgan = require("morgan");
const port = process.env.PORT

const app = express()

console.log(process.env.EMAIL_PASSWORD)

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
