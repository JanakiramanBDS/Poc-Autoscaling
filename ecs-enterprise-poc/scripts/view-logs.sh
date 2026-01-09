#!/bin/bash

# Script to view ECS container logs and inspect the deployment

echo "📋 Viewing ECS Container Logs..."
echo "================================"

# Get the latest log stream
LOG_GROUP="/ecs/company-ecs-poc"
REGION="ap-south-1"

echo ""
echo "🔍 Fetching latest log streams..."
aws logs describe-log-streams \
  --log-group-name "$LOG_GROUP" \
  --order-by LastEventTime \
  --descending \
  --max-items 5 \
  --region "$REGION" \
  --query 'logStreams[*].[logStreamName,lastEventTime]' \
  --output table

echo ""
echo "📄 Latest Container Logs:"
echo "------------------------"

# Get the most recent log stream name
LATEST_STREAM=$(aws logs describe-log-streams \
  --log-group-name "$LOG_GROUP" \
  --order-by LastEventTime \
  --descending \
  --max-items 1 \
  --region "$REGION" \
  --query 'logStreams[0].logStreamName' \
  --output text)

echo "Log Stream: $LATEST_STREAM"
echo ""

# Tail the logs
aws logs tail "$LOG_GROUP" \
  --follow \
  --format short \
  --region "$REGION"
