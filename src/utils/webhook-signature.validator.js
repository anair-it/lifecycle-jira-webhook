const crypto = require('crypto')

async function validate(req, res, next) {
    const body = req.body
    const signature = req.headers['x-nexus-webhook-signature']

    if (signature != null) {
        const secretKey = process.env.LIFECYCLE_SECRET_KEY
        if (secretKey == null) {
            const err = new Error('LIFECYCLE_SECRET_KEY is required. Get the secret from Lifecycle Webhook UI and set it as an env variable');
            err.type = 'auth'
            return next(err)
        } else {
            const jsonBody = JSON.stringify(body)
            const hmacDigest = crypto
                .createHmac('sha1', secretKey)
                .update(jsonBody)
                .digest('hex')

            if(signature !== hmacDigest){
                const err = new Error('Webhook signature does not match. Either the secret key is incorrect or the endpoint is illegally invoked outside of Lifecycle');
                err.type = 'auth'
                return next(err)
            }
        }
    }
    next();
}

module.exports = { validate }
