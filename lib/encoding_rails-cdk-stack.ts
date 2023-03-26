import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';

export class EncodingRailsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // vpcの作成
    const vpc = new ec2.Vpc(this, 'vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.2.0.0/16'),
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC
        },
      ],
    });

    // AMIを設定
    const amazonLinux2 = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // EC2のセキュリティグループ作成
    const webSecurityGroup = new ec2.SecurityGroup(this, 'webSg', {
      vpc,
      allowAllOutbound: true,
    });
    webSecurityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(80), 'Allow inbound HTTP');

    // EC2のIAMロール作成
    const webRole = new iam.Role(this, 'webRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // EC2作成
    const web = new ec2.Instance(this, 'web', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: webSecurityGroup,
      role: webRole,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: amazonLinux2,
    });

    // ユーザーデータ追加
    const userDataScript = readFileSync('./lib/resources/user-data.sh', 'utf8');
    web.addUserData(userDataScript);
  }
}
