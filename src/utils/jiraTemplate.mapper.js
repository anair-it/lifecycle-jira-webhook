const templateReader = require('../configs/templateReader')
const logger = require('../lib/logger')

function buildViolationUrl(reqBody, componentFact) {
    return (
        process.env.LIFECYCLE_BASE_URL +
        process.env.LIFECYCLE_APP_REPORT_BASE_URL +
        reqBody.application.publicId +
        '/' +
        reqBody.applicationEvaluation.reportId +
        '/componentDetails/' +
        componentFact.hash +
        '/violations'
    )
}

//Decorate Jira request with elements from lifecycle data
function map(reqBody, policyAlert, componentFact, threatLevelMapVal) {
    try {
        const MAPPING_STAGE_TO_BRANCH_TYPE = new Map(
            Object.entries(JSON.parse(process.env.MAPPING_STAGE_TO_BRANCH_TYPE))
        )
        let MAPPING_APPID_TO_SCRUM_TEAM = null;

        if(process.env.MAPPING_APPID_TO_SCRUM_TEAM != null)
            MAPPING_APPID_TO_SCRUM_TEAM = new Map(
            Object.entries(JSON.parse(process.env.MAPPING_APPID_TO_SCRUM_TEAM))
        )
        const jiraDataTemplate = templateReader.readJiraTemplate()
        const scrumTeam = MAPPING_APPID_TO_SCRUM_TEAM === null ? '':MAPPING_APPID_TO_SCRUM_TEAM.get(reqBody.application.publicId) === undefined?'':MAPPING_APPID_TO_SCRUM_TEAM.get(reqBody.application.publicId)

        return JSON.stringify(jiraDataTemplate)
            .split('{appName}')
            .join(reqBody.application.name)
            .split('{component}')
            .join(componentFact.displayName)
            .split('{evaluationDate}')
            .join(reqBody.applicationEvaluation.evaluationDate)
            .split('{stage}')
            .join(reqBody.applicationEvaluation.stage)
            .split('{branch}')
            .join(
                MAPPING_STAGE_TO_BRANCH_TYPE.get(
                    reqBody.applicationEvaluation.stage
                )
            )
            .split('{affectedComponentCount}')
            .join(reqBody.applicationEvaluation.affectedComponentCount)
            .split('{criticalComponentCount}')
            .join(reqBody.applicationEvaluation.criticalComponentCount)
            .split('{severeComponentCount}')
            .join(reqBody.applicationEvaluation.severeComponentCount)
            .split('{moderateComponentCount}')
            .join(reqBody.applicationEvaluation.moderateComponentCount)
            .split('{lifecycleViolationUrl}')
            .join(buildViolationUrl(reqBody, componentFact))
            .split('{policyName}')
            .join(policyAlert.policyName.replace(' ', '-'))
            .split('{policyViolationId}')
            .join(componentFact.hash)
            .split('{threatLevel}')
            .join(policyAlert.threatLevel)
            .split('{priority}')
            .join(threatLevelMapVal.priority)
            .split('{severity}')
            .join(threatLevelMapVal.severity)
            .split('{bugNature}')
            .join(threatLevelMapVal.bugNature)
            .split('{jiraWebhookAuthToken}')
            .join(process.env.JIRA_WEBHOOK_AUTH_TOKEN)
            .split('{appId}')
            .join(reqBody.application.publicId)
            .split('{scrumTeam}')
            .join(scrumTeam)
    } catch (err) {
        logger.error('Failed to build Jira data', err.message)
    }
    return null
}

module.exports = { map }
