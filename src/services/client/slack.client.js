const {IncomingWebhook} = require('@slack/client');

// Post a Slack message with violation data
async function postMessage(data) {

    if (process.env.ENABLE_SLACK_WEBHOOK === 'true') {
        if (process.env.SLACK_WEBHOOK_URL == null) {
            throw new Error('Slack webhook url is not defined. Set SLACK_WEBHOOK_URL')
        }
        if (data == null) {
            throw new Error( 'Slack post data is null. Validate jira data builder logic in src/utils/jiraTemplate.mapper.js')
        }
        try {
            const iqNotification = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
            iqNotification.send(data, (error) => {
                if (error) {
                    throw new Error(`Error posting to Slack: ${error}`)
                }
            });
        } catch (err) {
            throw new Error(`Slack webhook call failed. ${err.message}`)
        }
    } else {
        throw new Error('Slack webhook is disabled. Set ENABLE_SLACK_WEBHOOK=true')
    }
}

module.exports = { postMessage }
