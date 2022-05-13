const https = require('https')
const logger = require('../../lib/logger')

const jiraOptions = {
    hostname: process.env.JIRA_WEBHOOK_HOST,
    port: 443,
    path: process.env.JIRA_WEBHOOK_PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
}

// Submit a POST request to a Jira webhook that creates a ticket. Throw an exception for any failure
async function createJiraTicket(data) {

    if (process.env.ENABLE_JIRA_WEBHOOK === 'true') {
        if (process.env.JIRA_WEBHOOK_HOST == null || process.env.JIRA_WEBHOOK_PATH == null
        ) {
            throw new Error('Jira webhook url is not defined. Set JIRA_WEBHOOK_HOST and JIRA_WEBHOOK_PATH')
        }
        if (data == null) {
            throw new Error( 'Jira post data is null. Validate jira data builder logic in src/utils/jiraTemplate.mapper.js')
        }
        try {
            const jiraReq = https.request(jiraOptions, (jiraResponse) => {
                logger.debug(`Posted request with options: ${JSON.stringify(jiraOptions)} and returned statusCode: ${jiraResponse.statusCode}`)
            })

            jiraReq.on('error', (err) => {
                throw new Error(`Jira webhook call failed. ${err.message}`)
            })
            jiraReq.write(data)
            jiraReq.end()
        } catch (err) {
            throw new Error(`Jira webhook call failed. ${err.message}`)
        }
    } else {
        throw new Error('Jira webhook is disabled. Set ENABLE_JIRA_WEBHOOK=true')
    }
}

module.exports = { createJiraTicket }
