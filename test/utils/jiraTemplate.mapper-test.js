const { assert } = require('chai')
const jiraTemplateMapper = require('../../src/utils/jiraTemplate.mapper')

describe('Validate Jira data builder', () => {
    before(function () {
        process.env.MAPPING_APPID_TO_SCRUM_TEAM =
            '{"appPublicId": "team1","appPublicId2": "team2","appPublicId3": "team1"}'
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

    describe('jiraTemplate-mapper', () => {
        it('Validate Jira post data with valid input', () => {
            const reqBody = getPayload(10)
            const jiraData = jiraTemplateMapper.map(
                reqBody,
                reqBody.policyAlerts[0],
                reqBody.policyAlerts[0].componentFacts[0],
                JSON.parse(
                    '{ "priority": "P1", "severity": "S1", "bugNature": "SCA-Security" }'
                )
            )
            assert.isNotNull(jiraData)

            const jiraJsonData = JSON.parse(jiraData)
            assert.equal(
                jiraJsonData.summary,
                'Fix SCA vulnerability: My app - apache-collections : commons-collections : 3.1'
            )
            assert.equal(jiraJsonData.priority, 'P1')
            assert.equal(jiraJsonData.severity, 'S1')
            assert.equal(jiraJsonData.bugNature, 'SCA-Security')
            assert.equal(jiraJsonData.labels, 'Security-Critical')
            assert.equal(jiraJsonData.appId, 'appPublicId')
            assert.equal(jiraJsonData.scrumTeam, 'team1')
            assert.equal(
                jiraJsonData.replicationSteps,
                'https://my-lifecycle.com/reports/appPublicId/38e07c8866a242a485e6d7d2c1fd5692/componentDetails/40fb048097caeacdb11d/violations'
            )
        })

        it('Validate no Jira data is built for invalid request body', () => {
            assert.isNull(
                jiraTemplateMapper.map(
                    getPayload(10),
                    null,
                    null,
                    JSON.parse(
                        '{ "priority": "P1", "severity": "S1", "bugNature": "SCA-Security" }'
                    )
                )
            )
        })
    })
})
