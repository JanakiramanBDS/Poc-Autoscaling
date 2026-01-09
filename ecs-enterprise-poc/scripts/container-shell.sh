#!/bin/bash

# Script to get shell access to ECS container

echo "🔐 Accessing ECS Container..."
echo "=============================="

CLUSTER="company-ecs-poc-cluster"
SERVICE="company-ecs-poc-service"
REGION="ap-south-1"

echo ""
echo "1️⃣ Getting running task ARN..."
TASK_ARN=$(aws ecs list-tasks \
  --cluster "$CLUSTER" \
  --service-name "$SERVICE" \
  --region "$REGION" \
  --query 'taskArns[0]' \
  --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
  echo "❌ No running tasks found!"
  exit 1
fi

echo "✅ Found task: $TASK_ARN"
echo ""
echo "2️⃣ Attempting to connect to container..."
echo ""
echo "⚠️  NOTE: This requires ECS Execute Command to be enabled."
echo "   If this fails, use the Bastion host method instead."
echo ""

# Try to execute command
aws ecs execute-command \
  --cluster "$CLUSTER" \
  --task "$TASK_ARN" \
  --container app \
  --interactive \
  --command "/bin/sh" \
  --region "$REGION"

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ECS Execute Command failed!"
  echo ""
  echo "📝 Alternative Methods:"
  echo "----------------------"
  echo ""
  echo "Method 1: View Container Logs"
  echo "  ./view-logs.sh"
  echo ""
  echo "Method 2: Use Bastion Host"
  echo "  1. SSH to bastion: ssh -i bastion-key.pem ec2-user@43.205.206.10"
  echo "  2. Install AWS CLI on bastion"
  echo "  3. Run this script from bastion"
  echo ""
  echo "Method 3: Check Task Details"
  echo "  aws ecs describe-tasks --cluster $CLUSTER --tasks $TASK_ARN --region $REGION"
  echo ""
  echo "Method 4: Test the API directly"
  echo "  curl http://company-ecs-poc-alb-542985694.ap-south-1.elb.amazonaws.com/api/movies"
  echo ""
fi
