const morgan = require('morgan')
const json = require('morgan-json')
const format = json({
    method: ':method',
    url: ':url',
    status: ':status',
    responseTime: ':response-time',
})

const logger = require('./logger')
const httpLogger = morgan(format, {
    stream: {
        write: (message) => {
            const { method, url, status, responseTime } = JSON.parse(message)

            logger.info('HTTP access log', {
                timestamp: new Date().toString(),
                method,
                url,
                status: Number(status),
                responseTime: Number(responseTime),
            })
        },
    },
})

module.exports = httpLogger
