const lifecycleViolations = require('../services/lifecycleViolation.service')
const logger = require('../lib/logger')

async function create(req, res, next) {
    try {
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
            );
        await lifecycleViolations.create(req.body)
        res.status(201).send('Success')
    } catch (err) {
        next(err)
    }

}

module.exports = { create }
