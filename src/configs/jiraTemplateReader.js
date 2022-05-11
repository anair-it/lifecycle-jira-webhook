const fs = require('fs')

//Read and parse Jira template
function read() {
    return JSON.parse(fs.readFileSync('src/configs/jiraTemplate.json'))
}

module.exports = { read }
