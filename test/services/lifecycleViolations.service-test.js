const { assert } = require('chai')
const sinon = require('sinon')
const service = require('../../src/services/lifecycleViolation.service')
const jiraClient = require('../../src/services/client/jira.client')
const threatLevelMapper = require('../../src/utils/threatlevel.mapper')

describe('Validate Jira client', () => {

    before(function () {
        process.env.MAPPING_STAGE_TO_BRANCH_TYPE =
            '{"build": "develop","stage-release": "master","release": "release"}'
        process.env.LIFECYCLE_BASE_URL = 'https://my-lifecycle.com'
        process.env.LIFECYCLE_APP_REPORT_BASE_URL = '/reports/'
    })

    function getPayload(threatLevel) {
        return {
            initiator: 'admin',
            applicationEvaluation: {
                application: {
                    id: '1e010417a9fd4624b0eaccebccac21f6',
                    publicId: 'appPublicId',
                    name: 'My app',
                    organizationId: '2edd9a73b5444ca7b563501445b7b2fc',
                },
                policyEvaluationId: 'e534d2c0bb64473a8206ead3cdee9d84',
                stage: 'build',
                ownerId: '5c2cb33bc52e48b7ad04b4905bf74337',
                evaluationDate: '2019-08-27T20:33:47.854+0000',
                affectedComponentCount: 1,
                criticalComponentCount: 1,
                severeComponentCount: 0,
                moderateComponentCount: 0,
                outcome: 'fail',
                reportId: '38e07c8866a242a485e6d7d2c1fd5692',
            },
            application: {
                id: '1e010417a9fd4624b0eaccebccac21f6',
                publicId: 'appPublicId',
                name: 'My app',
                organizationId: '2edd9a73b5444ca7b563501445b7b2fc',
            },
            policyAlerts: [
                {
                    policyId: '6f981ceb94684b3da36ee1a1d863956f',
                    policyName: 'Security-Critical',
                    threatLevel: threatLevel,
                    componentFacts: [
                        {
                            hash: '40fb048097caeacdb11d',
                            displayName:
                                'apache-collections : commons-collections : 3.1',
                            componentIdentifier: {
                                format: 'maven',
                                coordinates: {
                                    artifactId: 'commons-collections',
                                    classifier: '',
                                    extension: 'jar',
                                    groupId: 'apache-collections',
                                    version: '3.1',
                                },
                            },
                            pathNames: [],
                            constraintFacts: [
                                {
                                    constraintName: 'Critical risk CVSS score',
                                    satisfiedConditions: [
                                        {
                                            summary:
                                                'Security Vulnerability Severity >= 9',
                                            reason: 'Found security vulnerability sonatype-2015-0002 with severity 9.0.',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            hash: '10fb048097caeacdb11d',
                            displayName: 'apache : commons-lang : 1.6',
                            componentIdentifier: {
                                format: 'maven',
                                coordinates: {
                                    artifactId: 'commons-lang',
                                    classifier: '',
                                    extension: 'jar',
                                    groupId: 'apache',
                                    version: '1.6',
                                },
                            },
                            pathNames: [],
                            constraintFacts: [
                                {
                                    constraintName: 'Critical risk CVSS score',
                                    satisfiedConditions: [
                                        {
                                            summary:
                                                'Security Vulnerability Severity >= 9',
                                            reason: 'Found security vulnerability sonatype-2015-0002 with severity 9.0.',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    policyViolationId: '62c3f1fc67b149f1a584cd63acb23eed',
                },
                {
                    policyId: '6f981ceb94684b3da36ee1a1d863956f',
                    policyName: 'Security-Critical',
                    threatLevel: threatLevel - 1,
                    componentFacts: [
                        {
                            hash: '40fb048097caeacdb11d',
                            displayName: 'log4j : log4j : 1.2.17',
                            componentIdentifier: {
                                format: 'maven',
                                coordinates: {
                                    artifactId: 'log4j',
                                    classifier: '',
                                    extension: 'jar',
                                    groupId: 'log4j',
                                    version: '1.2.17',
                                },
                            },
                            pathNames: [],
                            constraintFacts: [
                                {
                                    constraintName: 'Critical risk CVSS score',
                                    satisfiedConditions: [
                                        {
                                            summary:
                                                'Security Vulnerability Severity >= 9',
                                            reason: 'Found security vulnerability sonatype-2015-0002 with severity 9.0.',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    policyViolationId: '62c3f1fc67b149f1a584cd63acb23eed',
                },
            ],
        }
    }

    function noPolicyAlerts() {
        return {
            initiator: 'admin',
            applicationEvaluation: {
                application: {
                    id: '1e010417a9fd4624b0eaccebccac21f6',
                    publicId: 'appPublicId',
                    name: 'My app',
                    organizationId: '2edd9a73b5444ca7b563501445b7b2fc',
                },
                policyEvaluationId: 'e534d2c0bb64473a8206ead3cdee9d84',
                stage: 'build',
                ownerId: '5c2cb33bc52e48b7ad04b4905bf74337',
                evaluationDate: '2019-08-27T20:33:47.854+0000',
                affectedComponentCount: 1,
                criticalComponentCount: 1,
                severeComponentCount: 0,
                moderateComponentCount: 0,
                outcome: 'fail',
                reportId: '38e07c8866a242a485e6d7d2c1fd5692',
            },
            application: {
                id: '1e010417a9fd4624b0eaccebccac21f6',
                publicId: 'appPublicId',
                name: 'My app',
                organizationId: '2edd9a73b5444ca7b563501445b7b2fc',
            },
            policyAlerts: [],
        }
    }

    describe('Validate process', () => {
        it('Empty policy alerts',  async () => {
            try{
                await service.create(noPolicyAlerts())
            }catch(err){
                assert.isNotNull(err)
            }
        })

        it('Empty threat level map',  async () => {
            const threatlevelMap = sinon.stub(threatLevelMapper, 'map').returns(null)
            try{
                await service.create(getPayload(10))
            }catch(err){
                assert.isNotNull(err)
            }
            assert.equal(threatlevelMap.callCount, 1)
            threatlevelMap.restore();
        })

        it('Successfully invoke Jira client',  async () => {
            process.env.MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS =
                '{' +
                '       "10": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S1", "bugNature": "SCA-Security"}},\n' +
                '       "9": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S2", "bugNature": "SCA-Security"}},\n' +
                '       "8": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S3", "bugNature": "SCA-Security"}},\n' +
                '       "7": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P2", "severity": "S4", "bugNature": "SCA-Security"}}\n' +
                '      }'

            const jiraClientResponse = sinon.stub(jiraClient, 'createJiraTicket')

            try{
                await service.create(getPayload(10))
            }catch(err){
                assert.isEmpty(err)
            }
            assert.equal(jiraClientResponse.callCount, 3)
            jiraClientResponse.restore()
        })
    })
})
