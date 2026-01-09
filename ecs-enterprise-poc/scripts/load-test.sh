#!/bin/bash
set -e

# --- Load Test Script for Autoscaling POC ---
# Aggressive load generation using curl with actual computational load

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
else
    echo "❌ .env file not found"
    exit 1
fi

# Get ALB URL from Terraform
cd "$PROJECT_ROOT/infra"
ALB_URL="http://$(terraform output -raw alb_url)"
echo "🎯 Target: $ALB_URL"

# Verify ALB is responding
echo "🔍 Testing ALB connectivity..."
if curl -s -f "$ALB_URL" > /dev/null 2>&1; then
    echo "✅ ALB is responding"
else
    echo "❌ ALB not responding. Check deployment."
    exit 1
fi

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_stage() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

show_metrics() {
    local stage=$1
    echo -e "${YELLOW}📊 ECS Metrics - $stage${NC}"
    
    CLUSTER_NAME="${PROJECT_NAME}-cluster"
    SERVICE_NAME="${PROJECT_NAME}-service"
    
    TASK_COUNT=$(aws ecs describe-services \
        --cluster "$CLUSTER_NAME" \
        --services "$SERVICE_NAME" \
        --region "$AWS_REGION" \
        --query 'services[0].desiredCount' \
        --output text 2>/dev/null || echo "N/A")
    
    RUNNING=$(aws ecs describe-services \
        --cluster "$CLUSTER_NAME" \
        --services "$SERVICE_NAME" \
        --region "$AWS_REGION" \
        --query 'services[0].runningCount' \
        --output text 2>/dev/null || echo "N/A")
    
    echo "   Desired Tasks: $TASK_COUNT | Running: $RUNNING"
    echo ""
}

# Function for aggressive concurrent load
aggressive_load() {
    local duration=$1
    local concurrency=$2
    local name=$3
    
    echo -e "${GREEN}▶ Starting $name (this will take ~${duration}s)${NC}"
    echo "  Concurrency: ${concurrency} | Target: $ALB_URL"
    
    local start_time=$(date +%s)
    local end_time=$((start_time + duration))
    local request_count=0
    
    while [ $(date +%s) -lt $end_time ]; do
        # Launch concurrent curl requests - each one makes multiple calls
        for ((i=0; i<concurrency; i++)); do
            (
                # Each process makes 3 rapid requests to amplify load
                for ((j=0; j<3; j++)); do
                    curl -s -o /dev/null "$ALB_URL" 2>/dev/null
                done
            ) &
        done
        
        request_count=$((request_count + concurrency * 3))
        
        # Wait 0.5 seconds before next batch (faster batching = more load)
        sleep 0.5
    done
    
    wait 2>/dev/null || true
    
    echo -e "${GREEN}✅ Completed: $name${NC}"
    echo "  Total requests: ~$request_count"
    echo ""
}

# --- Test 1: Baseline ---
print_stage "STAGE 1: BASELINE (2 min, low load)"
show_metrics "baseline-start"
aggressive_load 120 3 "low-load"
sleep 20
show_metrics "baseline-end"

# --- Test 2: Ramp ---
print_stage "STAGE 2: RAMP UP (3 min, medium load)"
show_metrics "ramp-start"
aggressive_load 180 15 "medium-load"
sleep 30
show_metrics "ramp-end"

# --- Test 3: Peak ---
print_stage "STAGE 3: PEAK LOAD (3 min, high load)"
echo -e "${RED}⚠️  GENERATING HEAVY LOAD - EXPECT SCALE-UP${NC}"
show_metrics "peak-start"
aggressive_load 180 30 "heavy-load"
sleep 30
show_metrics "peak-end"

# --- Test 4: Sustain ---
print_stage "STAGE 4: SUSTAIN (2 min, maintain load)"
echo "🔹 Monitoring task stabilization..."
show_metrics "sustain-start"
aggressive_load 120 25 "sustain-load"
sleep 30
show_metrics "sustain-end"

# --- Test 5: Cool Down ---
print_stage "STAGE 5: COOL DOWN (drop load, wait for scale-in)"
echo "🔹 Dropping traffic - expect tasks to scale down after 5 min"
show_metrics "cooldown-start"
aggressive_load 60 2 "light-load"
echo "⏳ Waiting 5 minutes for scale-in to trigger..."
sleep 300
show_metrics "cooldown-end"

# --- Summary ---
print_stage "TEST COMPLETE"
echo -e "${GREEN}✅ Load test finished!${NC}"
echo ""
echo "📊 What to look for:"
echo "   • PEAK LOAD stage: Task count should INCREASE"
echo "   • COOL DOWN stage: Task count should DECREASE"
echo "   • Min: 2 tasks | Max: 10 tasks"
echo ""
echo "📈 View metrics in AWS Console:"
echo "   https://console.aws.amazon.com/ecs/"
echo "   Cluster: ${PROJECT_NAME}-cluster"
echo "   Service: ${PROJECT_NAME}-service"
echo "   → Metrics tab"
echo ""
echo "💡 If tasks didn't scale:"
echo "   1. Check if CPU/Memory actually increased (Metrics tab)"
echo "   2. Verify autoscaling policies are active"
echo "   3. Run: aws ecs describe-services --cluster ${PROJECT_NAME}-cluster --services ${PROJECT_NAME}-service --region $AWS_REGION"
echo ""
