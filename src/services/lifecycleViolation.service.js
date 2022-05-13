const logger = require('../lib/logger')
const jiraClient = require('./client/jira.client')
const threatLevelMapper = require('../utils/threatlevel.mapper')
const jiraTemplateMapper = require('../utils/jiraTemplate.mapper')

//Loop through all threat levels and components that have violations and create Jira ticket per occurrence
async function create(reqBody) {
    let jiraTicketCounter = 0
    let errMessage = ''

    if(reqBody.policyAlerts.length > 0) {
        for (const policyAlert of reqBody.policyAlerts) {
            const threatLevelMap = threatLevelMapper.map(policyAlert.threatLevel)
            if (threatLevelMap != null) {
                for (const threatLevelMapKey of threatLevelMap.keys()) {
                    if (policyAlert.policyName.includes(threatLevelMapKey)) {
                        for (const componentFact of policyAlert.componentFacts) {
                            let threatLevelMapVal = JSON.parse(
                                JSON.stringify(
                                    threatLevelMap.get(threatLevelMapKey)
                                )
                            )
                            const data = jiraTemplateMapper.map(
                                reqBody,
                                policyAlert,
                                componentFact,
                                threatLevelMapVal
                            )
                            try {
                                await jiraClientCall(data, jiraTicketCounter)
                                jiraTicketCounter++
                            } catch (err) {
                                errMessage += err.message + ' | '
                            }
                        }
                    }
                }
                logger.debug(
                    `Created Jira tickets for threat level: ${policyAlert.threatLevel}`
                )
            } else {
                throw new Error('Set MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS')
            }
        }
    }
    logger.info(`Created ${jiraTicketCounter} Jira tickets in total`)
    if(errMessage !== '') {
        throw new Error(errMessage)
    }
}

async function jiraClientCall(data){
    await jiraClient.createJiraTicket(data)
    logger.info(
        `Jira ticket request body: ${data}`
    )
}

module.exports = { create }
