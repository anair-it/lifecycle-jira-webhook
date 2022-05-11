const lifecycleViolations = require('../services/lifecycleViolation.service')
const logger = require('../lib/logger')
const payloadValidator = require('../utils/webhook-signature-validator')

async function create(req, res, next) {
    try {
        if (!payloadValidator.validate(req, process.env.LIFECYCLE_SECRET_KEY)) {
            res.status(401).send('Not authorized')
            return
        }
        logger.debug('Lifecycle violation event received')
        logger.info(
            `X-Nexus-Webhook-ID: ${req.header(
                'X-Nexus-Webhook-ID'
            )} | X-Nexus-Webhook-Delivery: ${req.header(
                'X-Nexus-Webhook-Delivery'
            )}`
        )
        if (logger.isVerboseEnabled())
            logger.verbose(
                `Lifecycle violation event: ${JSON.stringify(req.body)}`
            )
        ;(await lifecycleViolations.create(req.body))
            ? res.status(201).send('Success')
            : res.status(500).send('Error')
    } catch (err) {
        logger.error(`Error while creating jira tickets`, err.message)
        next(err)
    }
}

module.exports = { create }
