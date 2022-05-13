# Sonatype Nexus Lifecycle-Jira cloud integration
[Sonatype Nexus Lifecycle](https://www.sonatype.com/products/open-source-security-dependency-management?topnav=true) is an SCA product. Currently Nexus Lifecycle cannot push violation events to __Jira cloud__ through a builtin plugin or software. This is a middleware component that can listen to Lifecycle violation events and create Jira cloud tickets

![Data flow](data-flow.png)
![Jira bug](jira-bug.png)

## Reference
- (https://help.sonatype.com/iqserver/automating/iq-server-webhooks#IQServerWebhooks)

## Features
1. This webhook integration implements a POST endpoint __/lifecycle/violation__ that will listen to a Nexus Lifecycle violation event
2. Works with Jira cloud (Should work in Jira datacenter as well, but not tested)
3. Lightweight Express JS middleware on Node platform
4. Jira json payload template in _jiraDataTemplate.json_ can be updated based on your needs
5. Map Nexus Lifecycle data elements to Jira elements
6. Post data to Jira webhook that creates a story/bug. If there are multiple violations and multiple components per violation, a jira ticket is created per component. So one event can trigger multiple Jira tickets
7. Lifecycle will send all events for every violation. Dedupe using componentFact.hash in the Jira webhook
8. Externalized properties to modify webhook behavior:
   1. LIFECYCLE_SECRET_KEY: Optional. Set this if a secret key is set in Lifecycle webhook admin page
   2. ENABLE_JIRA_WEBHOOK: Set to true to create Jira tickets. Else the event will be received, but no data will be posted to Jira. Defaults to 'false'
   3. JIRA_WEBHOOK_AUTH_TOKEN: Required. Jira webhook doesn't have built-in authentication mechanism, it's better to use a made-up encoded string and match it on the webhook side.
   4. JIRA_WEBHOOK_HOST: Required. Jira webhook base url
   5. JIRA_WEBHOOK_PATH: Required. Jira webhook rest of the url
   6. LIFECYCLE_BASE_URL: Required. Nexus lifecycle base url/host
   7. LIFECYCLE_APP_REPORT_BASE_URL: Required. Nexus Lifecycle report url path
   8. MAPPING_THREAT_LEVEL_TO_JIRA_FIELDS: Required. Threat level is mapped to a policy category like License/Security. Each category has it own definition of priority, severity and bug nature Example: ``` git   
      {
       "10": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S1", "bugNature": "SCA-Security"}},
       "9": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S2", "bugNature": "SCA-Security"}},
       "8": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P1", "severity": "S3", "bugNature": "SCA-Security"}},
       "7": {"License": {"priority": "P1", "severity": "S1", "bugNature": "SCA-License"}, "Security": {"priority": "P2", "severity": "S4", "bugNature": "SCA-Security"}}
      }```
   9. MAPPING_STAGE_TO_BRANCH_TYPE: Required. Map Lifecycle stage to an SCM branch type like `{"build": "develop","stage-release": "master","release": "release"}`
   10. PORT: Exposed port. Defaults to __3000__
   11. LOG_LEVEL: Minimum log level. Defaults to __info__
9. Deployable as a Docker container or Helm chart in a K8s environment
10. Structured logging to help with debugging
11. Refer unit tests for details. Run `npm test`


## Root level components
1. index.js: Entrypoint with Rest endpoints
2. jiraTemplate.json: Jira webhook POST payload structure
3. Dockerfile: Docker image creation steps
4. chart: Helm chart directory with templates and chart information to deploy to any K8s cluster


## Pre-requisite
1. Create a Jira automation webhook. Work with your Jira admin for this
2. Configure Jira webhook actions and mapping to create the right Jira type
3. Work with your Nexus Lifecycle admin to configure a webhook with the url of the POST endpoint(_/lifecycle/violation_)

## Install
### As a Docker container
> [Docker hub image reference](https://hub.docker.com/repository/docker/anoopnair/lifecycle-jira-integration) 

1. Create container and run in an environment where Nexus Lifecycle can access the url

```unix
# Pull docker image from docker hub
docker pull anoopnair/lifecycle-jira-integration:latest

# Run webhook container
# Add env variables using -e
docker run -p 3000:3000 --name my-lifecycle-jira-integration --rm -d -e PORT=3000  anoopnair/lifecycle-jira-integration

# Ping endpoint and get a "pong" response
curl localhost:3000/ping
```

2. Ensure Nexus lifecycle can access the webhook url
3. Re-evaluate an application to manually create a violation
4. Verify Jira ticket is created based on the violation
5. Monitor container logs `docker logs -f my-lifecycle-jira-integration`

### As a Helm chart
1. Download helm chart from [Artifact Hub](https://anair-it.github.io/lifecycle-jira-webhook/chart/)
2. Create a custom values.yaml file. Update the following in that values.yaml:
   1. lifecycle.*
   2. jira.*
   3. log.level
   4. mapping.lifecycleStageToScmBranch
   5. mapping.threatLevelToJiraFields
   6. And others as required
3. Run `helm install my-lifecycle-jira-integration chart -f chart/my-values.yaml` in minikube or your K8s cluster
4. Ensure Nexus lifecycle can access the webhook url
5. Re-evaluate an application to manually create a violation
6. Verify Jira ticket is created based on the violation
7. To verify, log into the pod using `kubectl exec -it POD_ID -- bash`
8. Run POST curl command in bash shell
9. Monitor container logs `kubectl logs -f POD_ID`
10. To uninstall chart, run `helm uninstall my-lifecycle-jira-integration`


## Sample violation event request (Testing purpose only)
This event will create 2 Jira tickets

```unix
curl --request POST \
  --url http://localhost:3000/lifecycle/violation \
  --header 'Content-Type: application/json' \
  --header 'X-Nexus-Webhook-Delivery: 12343' \
  --header 'X-Nexus-Webhook-ID: iq:policyAlert' \
  --data '{
  "initiator": "admin",
  "applicationEvaluation": {
    "application": {
      "id": "1e010417a9fd4624b0eaccebccac21f6",
      "publicId": "appPublicId",
      "name": "My app",
      "organizationId": "2edd9a73b5444ca7b563501445b7b2fc"
    },
    "policyEvaluationId": "e534d2c0bb64473a8206ead3cdee9d84",
    "stage": "build",
    "ownerId": "5c2cb33bc52e48b7ad04b4905bf74337",
    "evaluationDate": "2019-08-27T20:33:47.854+0000",
    "affectedComponentCount": 1,
    "criticalComponentCount": 1,
    "severeComponentCount": 0,
    "moderateComponentCount": 0,
    "outcome": "fail",
    "reportId": "38e07c8866a242a485e6d7d2c1fd5692"
  },
  "application": {
    "id": "1e010417a9fd4624b0eaccebccac21f6",
    "publicId": "appPublicId",
    "name": "My app",
    "organizationId": "2edd9a73b5444ca7b563501445b7b2fc"
  },
  "policyAlerts": [
    {
      "policyId": "6f981ceb94684b3da36ee1a1d863956f",
      "policyName": "Security-Critical",
      "threatLevel": 10,
      "componentFacts": [
        {
          "hash": "40fb048097caeacdb11d",
          "displayName": "apache-collections : commons-collections : 3.1",
          "componentIdentifier": {
            "format": "maven",
            "coordinates": {
              "artifactId": "commons-collections",
              "classifier": "",
              "extension": "jar",
              "groupId": "apache-collections",
              "version": "3.1"
            }
          },
          "pathNames": [],
          "constraintFacts": [
            {
              "constraintName": "Critical risk CVSS score",
              "satisfiedConditions": [
                {
                  "summary": "Security Vulnerability Severity >= 9",
                  "reason": "Found security vulnerability sonatype-2015-0002 with severity 9.0."
                }
              ]
            }
          ]
        },
				{
          "hash": "10fb048097caeacdb11d",
          "displayName": "apache : commons-lang : 1.6",
          "componentIdentifier": {
            "format": "maven",
            "coordinates": {
              "artifactId": "commons-lang",
              "classifier": "",
              "extension": "jar",
              "groupId": "apache",
              "version": "1.6"
            }
          },
          "pathNames": [],
          "constraintFacts": [
            {
              "constraintName": "Critical risk CVSS score",
              "satisfiedConditions": [
                {
                  "summary": "Security Vulnerability Severity >= 9",
                  "reason": "Found security vulnerability sonatype-2015-0002 with severity 9.0."
                }
              ]
            }
          ]
        }
      ],
      "policyViolationId": "62c3f1fc67b149f1a584cd63acb23eed"
    }
  ]
}'
```
