const logger = require('../lib/logger')
const jiraClient = require('./client/jira.client')
const threatLevelMapper = require('../utils/threatlevel.mapper')
const jiraTemplateMapper = require('../utils/jiraTemplate.mapper')

//Loop through all threat levels and components that have violations and create Jira ticket per occurrence
async function create(reqBody) {
    let jiraTicketCounter = 0

    reqBody.policyAlerts.forEach(function (policyAlert) {
        const threatLevelMap = threatLevelMapper.map(policyAlert.threatLevel)
        if (threatLevelMap != null) {
            for (const threatLevelMapKey of threatLevelMap.keys()) {
                if (policyAlert.policyName.includes(threatLevelMapKey)) {
                    policyAlert.componentFacts.forEach(function (
                        componentFact
                    ) {
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
                        if (jiraClient.createJiraTicket(data)) {
                            logger.info(
                                `Jira ticket #${++jiraTicketCounter}: ${data}`
                            )
                        }
                    })
                    // break
                }
            }
            logger.debug(
                `Created ${jiraTicketCounter} Jira tickets for threat level: ${policyAlert.threatLevel}`
            )
        } else {
            logger.error('Set MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS')
        }
    })
    logger.info(`Created ${jiraTicketCounter} Jira tickets`)
    return true
}

module.exports = { create }
