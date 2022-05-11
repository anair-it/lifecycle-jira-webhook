const crypto = require('crypto')
const logger = require('../lib/logger')

function validate(request, secretKey) {
    const body = request.body
    const signature = request.headers['x-nexus-webhook-signature']

    if (signature != null) {
        if (secretKey == null) {
            logger.error('Set LIFECYCLE_SECRET_KEY')
            return false
        } else {
            const jsonBody = JSON.stringify(body)
            const hmacDigest = crypto
                .createHmac('sha1', secretKey)
                .update(jsonBody)
                .digest('hex')
            return signature === hmacDigest
        }
    }
    return true
}

module.exports = { validate }
