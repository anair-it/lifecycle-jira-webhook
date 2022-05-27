const { assert } = require('chai')
const templateReader = require('../../src/configs/templateReader')

describe('Validate Jira and Slack template file reader', () => {
    it('Valid Jira template file found', () => {
        const jiraTemplate = templateReader.readJiraTemplate()
        assert.isNotNull(jiraTemplate)
        assert.equal(
            jiraTemplate.summary,
            'Fix {policyName} vulnerability: {appName} - {component}'
        )
    })

    it('Valid Slack violation template file found', () => {
        const slackTemplate = templateReader.readSlackViolationTemplate()
        assert.isNotNull(slackTemplate)
        assert.equal(
            slackTemplate.text,
            'Violations found for: {appName}'
        )
    })

    it('Valid Slack security override template file found', () => {
        const slackTemplate = templateReader.readSlackSecurityOverrideTemplate()
        assert.isNotNull(slackTemplate)
        assert.equal(
            slackTemplate.text,
            'Security vulnerability override'
        )
    })

    it('Valid Slack license override template file found', () => {
        const slackTemplate = templateReader.readSlackLicenseOverrideTemplate()
        assert.isNotNull(slackTemplate)
        assert.equal(
            slackTemplate.text,
            'License override'
        )
    })
})
