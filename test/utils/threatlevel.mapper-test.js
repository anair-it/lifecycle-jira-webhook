const { assert } = require('chai')
const threatlevelMapper = require('../../src/utils/threatlevel.mapper')

describe('Validate threat level mapper', () => {
    before(function () {
        process.env.MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS =
            '{' +
            '       "10": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S1", "bugNature": "SCA-Security"}},\n' +
            '       "9": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S2", "bugNature": "SCA-Security"}},\n' +
            '       "8": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S3", "bugNature": "SCA-Security"}},\n' +
            '       "7": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P2", "severity": "S4", "bugNature": "SCA-Security"}}\n' +
            '      }'
    })

    describe('threatlevel-mapper', () => {
        it('Validate Jira priority and severity based on threat level', () => {
            const threatlevelMap = threatlevelMapper.map(10)
            assert.equal(threatlevelMap.size, 2)
            assert.equal(threatlevelMap.get('License').severity, 'S1')
            assert.equal(threatlevelMap.get('License').priority, 'P1')
            assert.equal(threatlevelMap.get('Security').severity, 'S1')
            assert.equal(threatlevelMap.get('Security').priority, 'P1')
        })

        it('Validate Jira priority and severity not set for invalid threat level', () => {
            assert.isNull(threatlevelMapper.map(1))
        })
    })
})
