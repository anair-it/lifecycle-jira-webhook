const express = require('express')
const lifecycleViolationRouter = require('./src/routes/lifecycleViolation.route')
const logger = require('./src/lib/logger')
const httpLogger = require('./src/lib/httpLogger')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(httpLogger)

//Router
app.use('/lifecycle/violation', lifecycleViolationRouter)

// Error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    logger.error(err.message, err.stack)
    res.status(statusCode).send(err.message)
    next()
})


//Service ping endpoint
app.get('/ping', (req, res) => {
    res.send('pong')
})

const port = process.env.PORT || 3000
app.listen(port, () => logger.info(`Listening on ${port}`))

module.exports = app // For testing purpose only
