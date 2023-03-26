#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EncodingRailsCdkStack } from '../lib/encoding_rails-cdk-stack';

const app = new cdk.App();
new EncodingRailsCdkStack(app, 'EncodingRailsCdkStack');
