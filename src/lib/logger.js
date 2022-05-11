const winston = require('winston')

const { createLogger, format } = require('winston')
const { combine, timestamp, printf } = format

const textFormat = printf(
    ({ level, message, timestamp, method, url, status, responseTime }) => {
        return url != null
            ? `${timestamp} ${level} ${method} | ${url} | ${status} | ${responseTime}ms: ${message}`
            : `${timestamp} ${level}: ${message}`
    }
)

const options = {
    console: {
        level: process.env.LOG_LEVEL || 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: { format: 'MM/DD/YYYY hh:mm:ss.SSS' },
    },
}

const logger = createLogger({
    format: combine(timestamp(), textFormat),
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console(options.console)],
    exitOnError: false,
})

module.exports = logger
