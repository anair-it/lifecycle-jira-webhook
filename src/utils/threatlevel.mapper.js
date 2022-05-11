const logger = require('../lib/logger')

//Parse THREAT_LEVEL_TO_JIRA_FIELDS_MAPPING json to a Map
function map(threatLevel) {
    const MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS = new Map(
        Object.entries(
            JSON.parse(process.env.MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS)
        )
    )
    const threatLevelMappingValues = MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS.get(
        threatLevel + ''
    )
    let threatLevelMap = null
    if (threatLevelMappingValues != null) {
        threatLevelMap = new Map(
            Object.entries(JSON.parse(JSON.stringify(threatLevelMappingValues)))
        )
        if (logger.isVerboseEnabled())
            logger.verbose(
                `MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS parsed: ${threatLevelMap}`
            )
    } else {
        logger.error(
            'MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS has no entry for threat level: ' +
                threatLevel
        )
    }
    return threatLevelMap
}

module.exports = { map }
