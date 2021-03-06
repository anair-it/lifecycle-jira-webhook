const { assert,expect } = require('chai')
const sinon = require('sinon')
const https = require('https')
const http = require('http')
const jiraClient = require('../../../src/services/client/jira.client')

describe('Validate Jira client', () => {

    describe('Validate Jira client with valid data', () => {
        it('Mock jira call', async () => {
            process.env.ENABLE_JIRA_WEBHOOK = 'true';
            process.env.JIRA_WEBHOOK_HOST= 'company.jira.com';
            process.env.JIRA_WEBHOOK_PATH = '/webhook';

            const jiraRequest = sinon.createStubInstance(http.ClientRequest);
            jiraRequest.on('{"data":"val"}');
            jiraRequest.write;
            jiraRequest.end;
            const requestMock = sinon.stub(https,'request').returns(jiraRequest);

            expect(await jiraClient.createJiraTicket(JSON.stringify('{"data":"val"}'))).not.to.throw;

            assert.equal(requestMock.callCount, 1)
            requestMock.restore()
            sinon.restoreObject(jiraRequest);
        })
    })

    describe('Validate Jira client with invalid data', () => {
        it('Webhook disabled',  async () => {
            process.env.ENABLE_JIRA_WEBHOOK = 'false';
            jiraClient.createJiraTicket(JSON.stringify('{"data":"val"}'))
            try{
                await jiraClient.createJiraTicket(JSON.stringify('{"data":"val"}'))
            }catch(err){
                assert.isNotNull(err)
            }
        })

        it('Invalid webhook url',  async () => {
            delete process.env.JIRA_WEBHOOK_HOST
            process.env.ENABLE_JIRA_WEBHOOK = 'true';
            process.env.JIRA_WEBHOOK_PATH = '/webhook';
            try{
                await jiraClient.createJiraTicket(JSON.stringify('{"data":"val"}'))
            }catch(err){
                assert.isNotNull(err)
            }
        })

        it('Invalid webhook request payload',  async () => {
            process.env.ENABLE_JIRA_WEBHOOK = 'true';
            process.env.JIRA_WEBHOOK_HOST = 'company.jira.com';
            process.env.JIRA_WEBHOOK_PATH = '/webhook';
            try{
                await jiraClient.createJiraTicket(null)
            }catch(err){
                assert.isNotNull(err)
            }
        })
    })
})
