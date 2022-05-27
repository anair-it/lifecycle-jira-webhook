const { assert,expect } = require('chai')
const sinon = require('sinon')
const slackClient = require('../../../src/services/client/slack.client')
const {IncomingWebhook} = require('@slack/client')


describe('Validate Slack client', () => {

    describe('Validate Slack client with valid data', () => {
        it('Mock Slack call', async () => {
            process.env.ENABLE_SLACK_WEBHOOK = 'true'
            process.env.SLACK_WEBHOOK_URL= 'company.jira.com'

            // const jiraRequest = sinon.createStubInstance(http.ClientRequest);
            // jiraRequest.on('{"data":"val"}');
            // jiraRequest.write;
            // jiraRequest.end;
            const requestMock = sinon.stub(IncomingWebhook,'send')

            expect(await slackClient.postMessage(JSON.stringify('{"data":"val"}'))).not.to.throw

            assert.equal(requestMock.callCount, 1)
            requestMock.restore()
            sinon.restoreObject(jiraRequest)
        })
    })

    describe('Validate Slack client with invalid data', () => {
        it('Webhook disabled',  async () => {
            process.env.ENABLE_SLACK_WEBHOOK = 'false'
            try{
                await slackClient.postMessage(JSON.stringify('{"data":"val"}'))
            }catch(err){
                assert.isNotNull(err)
            }
        })

        it('Invalid webhook url',  async () => {
            delete process.env.SLACK_WEBHOOK_URL
            process.env.ENABLE_SLACK_WEBHOOK = 'true'
            try{
                await slackClient.postMessage(JSON.stringify('{"data":"val"}'))
            }catch(err){
                assert.isNotNull(err)
            }
        })

        it('Invalid webhook request payload',  async () => {
            process.env.ENABLE_SLACK_WEBHOOK = 'true'
            process.env.SLACK_WEBHOOK_URL = 'company.jira.com'
            try{
                await slackClient.postMessage(null)
            }catch(err){
                assert.isNotNull(err)
            }
        })
    })
})
