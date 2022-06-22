# Cloud One Commons - Security Hub Integration

Using an AWS Security Hub integration channel you can send security events and assessments from Cloud One services into AWS Security Hub. This will allow you to analyze Trend Micro Cloud One data alongside data from AWS Cloud Native security solutions like: 'Amazon GuardDuty', 'Amazon Inspector', 'Amazon Macie', 'AWS Identity' and 'Access Management (IAM) Access Analyzer', 'AWS Systems Manager', and 'AWS Firewall Manager'. Security Hub is a single place that can aggregate, organize, prioritize, and automate the remediation of security alerts, or findings.

This CDK project automates the deployment of all of the requirements in a given AWS account and uses a custom resource to create the integration in the Cloud One backend.

## How to deploy

### Requirements

* `Cloud One Account Id`
* `Cloud One Account Region`
* `Cloud One Account API Key`

### Commands to deploy

```
git clone https://github.com/raphabot/cdk-cloudone-commons-integration-securityhub.git
cd cdk-cloudone-commons-integration-securityhub 
npm run build-lambda
cdk deploy --parameters CloudOneId=YOUR_CLOUD_ONE_ACCOUNT_ID --parameters CloudOneRegion=YOUR_CLOUD_ONE_ACCOUNT_REGION --parameters CloudOneApiKey=YOUR_CLOUD_ONE_ACCOUNT_API_KEY