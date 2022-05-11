const https = require('https')
const logger = require('../../lib/logger')



// Submit a POST request to a Jira webhook that creates a ticket
async function createJiraTicket(data) {
    if (process.env.ENABLE_JIRA_WEBHOOK === 'true') {
        if (process.env.JIRA_WEBHOOK_HOST == null || process.env.JIRA_WEBHOOK_PATH == null
        ) {
            logger.error(
                'Jira webhook url is not defined. Set JIRA_WEBHOOK_HOST and JIRA_WEBHOOK_PATH'
            )
            return false
        }
        if (data == null) {
            logger.error(
                'Jira post data is null. Validate jira data builder logic in src/utils/jiraTemplate.mapper.js'
            )
            return false
        }
        try {
            const jiraOptions = {
                hostname: process.env.JIRA_WEBHOOK_HOST,
                port: 443,
                path: process.env.JIRA_WEBHOOK_PATH,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
            const jiraReq = https.request(jiraOptions, (jiraResponse) => {
                logger.debug(`Posted request with options: ${JSON.stringify(jiraOptions)} and returned statusCode: ${jiraResponse.statusCode}`)
            })

            jiraReq.on('error', (error) => {
                logger.error('Jira webhook call failed.', error.message)
                return false
            })
            jiraReq.write(data)
            jiraReq.end()
        } catch (err) {
            logger.error('Jira webhook call failed.', err.message)
            return false
        }
    } else {
        logger.warn('Jira webhook is disabled. Set ENABLE_JIRA_WEBHOOK=true')
        return false
    }

    return true
}

module.exports = { createJiraTicket }
