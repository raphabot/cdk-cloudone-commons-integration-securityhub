import { CfnOutput, CfnParameter, CustomResource, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { AccountPrincipal, Effect, ManagedPolicy, Policy, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SecurityHubStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const CLOUD_ONE_INTEGRATIONS_AWS_ACCOUNT_ID = '868324285112';

    const cloudOneId = new CfnParameter(this, 'CloudOneId', {
      type: 'String',
      description: 'Cloud One Account id'
    })
    
    const cloudOneRegion = new CfnParameter(this, 'CloudOneRegion', {
      type: 'String',
      description: 'Cloud One Account region'
    })
    
    const cloudOneApiKey = new CfnParameter(this, 'CloudOneApiKey', {
      type: 'String',
      description: 'Cloud One Account API key'
    })

    const policy = new ManagedPolicy(this, 'Policy', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["securityhub:BatchImportFindings"],
          resources: [`arn:${Stack.of(this).partition}:securityhub:${Stack.of(this).region}:${Stack.of(this).account}:*`]
        })
      ]
    })

    const role = new Role(this, 'Role', {
      assumedBy: new AccountPrincipal(CLOUD_ONE_INTEGRATIONS_AWS_ACCOUNT_ID),
      externalIds: [cloudOneId.valueAsString],
      managedPolicies: [policy]
    })

    const createIntegrationFunction = new Function(this, 'CreateIntegrationFunction', {
      code: Code.fromAsset('./lambda/create-integration'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.seconds(20),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      environment: {
        URL: `https://integrations.${cloudOneRegion.valueAsString}.cloudone.trendmicro.com/api/integrations`,
        ARN: `arn:${Stack.of(this).partition}:securityhub:${Stack.of(this).region}:${Stack.of(this).account}:product/218213273676/default`,
        AWS_ACCOUNT_ID: Stack.of(this).account,
        ROLE_ARN: role.roleArn,
        NAME: 'Container Security to Security Hub.',
        DESCRIPTION: `This is an integration to send events from Container Security from Cloud One account ${cloudOneId.valueAsString} and region ${cloudOneRegion.valueAsString} to security hub.`,
        TYPE: 'SECURITY_HUB',
        API_KEY: cloudOneApiKey.valueAsString,
      }
    })
    const customResource = new CustomResource(this, 'CustomResource', {
      serviceToken: createIntegrationFunction.functionArn,
      resourceType: 'Custom::CreateIntegration',
    })
      

    new CfnOutput(this, 'RoleArn', {
      value: role.roleArn
    })
  }
}
