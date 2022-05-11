const request = require('supertest');
const sinon = require('sinon');
const {assert} = require('chai');
const app = require("../../index");
const violationService = require("../../src/services/lifecycleViolation.service");

describe('POST /lifecycle/violation', () => {

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

    it('Mock Jira tickets created successfully', async()=> {
        const service = sinon.stub(violationService, 'create').returns(true);
        await request(app)
            .post('/lifecycle/violation')
            .set('X-Nexus-Webhook-ID','iq:violationAlert')
            .set('X-Nexus-Webhook-Delivery','unit-test-1')
            .set('Content-Type','application/json')
            .send(getPayload(10))
            .expect(201, 'Success');

        assert.equal(service.callCount, 1);
        service.restore()
    });

    it('Mock Jira ticket creation failed', async()=> {
        const service = sinon.stub(violationService, 'create').returns(false);
        await request(app)
            .post('/lifecycle/violation')
            .set('X-Nexus-Webhook-ID','iq:violationAlert')
            .set('X-Nexus-Webhook-Delivery','unit-test-1')
            .set('Content-Type','application/json')
            .send(getPayload(10))
            .expect(500, 'Error');

        assert.equal(service.callCount, 1);
        service.restore()
    });

    it('Mock Jira ticket exception', async()=> {
        const service = sinon.stub(violationService, 'create').throws(new Error('jira error'));
        await request(app)
            .post('/lifecycle/violation')
            .set('X-Nexus-Webhook-ID','iq:violationAlert')
            .set('X-Nexus-Webhook-Delivery','unit-test-1')
            .set('Content-Type','application/json')
            .send(getPayload(10))
            .expect(500, 'jira error');

        assert.equal(service.callCount, 1);
        service.restore()
    });

    it('Invalid webhook signature', async()=> {
        process.env.LIFECYCLE_SECRET_KEY = 'badsecret'
        await request(app)
            .post('/lifecycle/violation')
            .set('X-Nexus-Webhook-ID','iq:violationAlert')
            .set('X-Nexus-Webhook-Delivery','unit-test-1')
            .set('x-nexus-webhook-signature', '123')
            .set('Content-Type','application/json')
            .send(getPayload(10))
            .expect(401, 'Not authorized');

    });
})
