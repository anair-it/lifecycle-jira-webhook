const express = require('express')
const lifecycleViolationRouter = require('./src/routes/lifecycleViolation.route')
const lifecycleOverrideRouter = require('./src/routes/lifecycleOverride.route')
const logger = require('./src/lib/logger')
const httpLogger = require('./src/lib/httpLogger')
const webhookSignatureValidator = require("./src/utils/webhook-signature.validator");


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(httpLogger)

app.use(webhookSignatureValidator.validate)
//Router
app.use('/lifecycle/violation', lifecycleViolationRouter)
app.use('/lifecycle/override', lifecycleOverrideRouter)


//Service ping endpoint
app.get('/ping', (req, res) => {
    res.send('pong')
})

// Log all errors
function errorLogger(err, req, res, next) {
    logger.error(err.message, err.stack)
    next(err)
}

// Send error response
function errorResponder(err, req, res, next) {
    if (err.type === 'auth')
        res.status(401).send(err.message)
    else if (err.type === 'invalid-input')
        res.status(400).send(err.message)
    else
        next(err)
}

// Fallback error handler if there is no specific error handler
function fallbackErrorHandler(err, req, res, next) {
    res.status(500).send(err.message)
}

app.use(errorLogger);
app.use(errorResponder);
app.use(fallbackErrorHandler);


const port = process.env.PORT || 3000
app.listen(port, () => logger.info(`Listening on ${port}`))

module.exports = app // For testing purpose only
