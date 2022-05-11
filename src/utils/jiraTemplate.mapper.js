const jiraTemplateReader = require('../configs/jiraTemplateReader')
const logger = require('../lib/logger')

function buildViolationUrl(reqBody, policyAlert) {
    return (
        process.env.LIFECYCLE_BASE_URL +
        process.env.LIFECYCLE_APP_REPORT_BASE_URL +
        reqBody.application.publicId +
        '/' +
        reqBody.applicationEvaluation.reportId +
        '/componentDetails/' +
        policyAlert.policyViolationId +
        '/violations'
    )
}

//Decorate Jira request with elements from lifecycle data
function map(reqBody, policyAlert, componentFact, threatLevelMapVal) {
    try {
        const MAPPING_STAGE_TO_BRANCH_TYPE = new Map(
            Object.entries(JSON.parse(process.env.MAPPING_STAGE_TO_BRANCH_TYPE))
        )
        const jiraDataTemplate = jiraTemplateReader.read()

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
            .join(buildViolationUrl(reqBody, policyAlert))
            .split('{policyName}')
            .join(policyAlert.policyName.replace(' ', '-'))
            .split('{policyViolationId}')
            .join(policyAlert.policyViolationId)
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
    } catch (err) {
        logger.error('Failed to build Jira data', err.message)
    }
    return null
}

module.exports = { map }
