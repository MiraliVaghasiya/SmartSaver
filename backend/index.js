const express = require('express')
const app = express()

const bodyparser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
require("./model/db")

const AuthRouter = require('./routes/AuthRouter')
const dashrouter = require('./routes/dashrouter')

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use('/auth', AuthRouter)
app.use('/dashboard', dashrouter )

app.get('/ping', (req, res) => {
    res.send('pong')
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))