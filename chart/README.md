# Sonatype Lifecycle and Jira integration
[Sonatype Nexus Lifecycle](https://www.sonatype.com/products/open-source-security-dependency-management?topnav=true) is an SCA product. Currently Nexus Lifecycle cannot push violation events to __Jira cloud__ through a builtin plugin or software. This is a middleware component that can listen to Lifecycle violation events and create Jira cloud tickets

## Introduction

This chart deploys a middleware component that integrates Sonatype lifecycle with Jira

## Prerequisites
- Kubernetes 1.4+
- Jira Cloud access
- Sonatype Lifecycle access

## QuickStart

```bash
$ helm repo add lifecycle-jira-integration https://anair-it.github.io/lifecycle-jira-webhook/chart
$ helm repo update
# Create a custom values.yaml file. Update the following in that values.yaml:
#   1. lifecycle.*
#   2. jira.*
#   3. log.level
#   4. mapping.lifecycleStageToScmBranch
#   5. mapping.threatLevelToJiraFields
#   6. And others as required
$ helm install my-lifecycle-jira-integration lifecycle-jira-integration/lifecycle-jira-integration -f my-values.yaml
```

## Uninstalling the Chart
To uninstall/delete the `my-lifecycle-jira-integration` deployment.The command removes all the Kubernetes components associated with the chart and deletes the release.

```bash
$ helm uninstall my-lifecycle-jira-integration
```

## Configuration

The configurable parameters of the lifecycle-jira-integration chart and their descriptions can be seen in `values.yaml`.

> **Tip**: You can use the default [values.yaml](values.yaml)

Here are the most common:

| Parameter                          | Description                                                                                                                                                           | Default                                  |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `replicaCount`                     | Number of replicas                                                                                                                                                    | `1`                                      |
| `image.repository`                 | The image to run                                                                                                                                                      | `anoopnair/lifecycle-jira-integration`   |                 |
| `image.tag`                        | The image tag to pull                                                                                                                                                 | `vX.XX`                                  |
| `image.pullPolicy`                 | Image pull policy                                                                                                                                                     | `IfNotPresent`                           |
| `image.pullSecrets`                | Specify image pull secrets                                                                                                                                            | `nil`                                    |
| `service.type`                     | Type of Service                                                                                                                                                       | `ClusterIP`                              |
| `service.port`                     | Port for kubernetes service                                                                                                                                           | `80`                                     |
| `ingress.enabled`                  | Enable ingress                                                                                                                                                        | `false`                                  |
| `resources`                        | Kubernetes ressources options                                                                                                                                         | `{}`                                     |
| `podSecurityContext`               | Pod security context settings                                                                                                                                         | `{}`                                     |
| `securityContext`                  | Security context settings                                                                                                                                             | `{}`                                     |
| `podAnnotations`                   | Pod annotations                                                                                                                                                       | `[]`                                     |
| `nodeSelector`                     | Node selector                                                                                                                                                         | `{}`                                     |
| `tolerations`                      | Tolerations                                                                                                                                                           | `[]`                                     |
| `affinity`                         | Affinity                                                                                                                                                              | `{}`                                     |
| `lifecycle.baseUrl`                | Base URL to Sonatype Lifecycle host                                                                                                                                   | `{}`                                     |
| `lifecycle.appReportBaseUrl`        | Rest of the URL to Sonatype Lifecycle                                                                                                                                 | `/assets/index.html#/applicationReport/` |
| `lifecycle.secretKey`               | Webhook HMAC secret. Optional                                                                                                                                         | `{}`                                     |
| `jira.webhook.enabled`              | Enable Jira integration                                                                                                                                               | `false`                                  |
| `jira.webhook.authToken`            | Made up Authentication token that Jira will validate                                                                                                                  | `{}`                                     |
| `jira.webhook.host`                 | Jira webhook base URL                                                                                                                                                 | `{}`                                     |
| `jira.webhook.path`                 | Jira webhook rest of the URL                                                                                                                                          | `{}`                                     |
| `log.level`                         | Log level                                                                                                                                                             | `info`                                   |
| `mapping.lifecycleStageToScmBranch` | Map Lifecycle stage to a SCM branch. Example: {"build": "develop","stage-release": "master","release": "release"}                                                     | `{}`                                     |
| `mapping.threatLevelToJiraFields`   | Map Lifecycle threat level to Jira priority, severity, bug nature. Example: ```{"10": { "License": { "priority": "P1", "severity": "SEV-1", "bugNature": "SCA-License" }, "Security": { "priority": "P1", "severity": "SEV-1","bugNature": "SCA-Security" } },"9": { "License": { "priority": "P1", "severity": "SEV-1", "bugNature": "SCA-License" }, "Security": { "priority": "P1", "severity": "SEV-2","bugNature": "SCA-Security" } },"8": { "License": { "priority": "P1", "severity": "SEV-1", "bugNature": "SCA-License" }, "Security": { "priority": "P1", "severity": "SEV-3","bugNature": "SCA-Security" } },"7": { "License": { "priority": "P1", "severity": "SEV-1", "bugNature": "SCA-License" }, "Security": { "priority": "P2", "severity": "SEV-4","bugNature": "SCA-Security" } }}``` | `{}`                                     |

