const { assert } = require('chai')
const jiraTemplateReader = require('../../src/configs/jiraTemplateReader')

describe('Validate Jira template file reader', () => {
    it('Valid Jira template file found', () => {
        const jiraTemplate = jiraTemplateReader.read()
        assert.isNotNull(jiraTemplate)
        assert.equal(
            jiraTemplate.summary,
            'Fix SCA vulnerability: {appName} - {component}'
        )
    })
})
