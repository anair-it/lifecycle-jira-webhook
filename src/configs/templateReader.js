const fs = require('fs')

//Read and parse Jira template
function readJiraTemplate() {
    return JSON.parse(fs.readFileSync('src/configs/jiraTemplate.json'))
}


//Read and parse Slack violation template
function readSlackViolationTemplate() {
    return JSON.parse(fs.readFileSync('src/configs/slack.violation.template.json'))
}

//Read and parse Slack security override template
function readSlackSecurityOverrideTemplate() {
    return JSON.parse(fs.readFileSync('src/configs/slack.security.override.template.json'))
}

//Read and parse Slack license override template
function readSlackLicenseOverrideTemplate() {
    return JSON.parse(fs.readFileSync('src/configs/slack.license.override.template.json'))
}

module.exports = { readJiraTemplate, readSlackViolationTemplate, readSlackSecurityOverrideTemplate, readSlackLicenseOverrideTemplate }
