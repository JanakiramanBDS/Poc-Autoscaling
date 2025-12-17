#!/bin/bash
set -e

# --- 1. Auto-Detect Project Root ---
# This line finds the folder where this script lives (scripts/), then goes up one level
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# --- 2. Load Environment ---
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a # Automatically export all variables
    source "$PROJECT_ROOT/.env"
    set +a
    echo "✅ Loaded .env config"
else
    echo "❌ .env file missing in $PROJECT_ROOT"
    exit 1
fi

echo "🚀 Deploying to $AWS_REGION..."

# --- 3. Terraform Init ---
cd "$PROJECT_ROOT/infra"
terraform init

# --- Step 4: Create ECR Repo ---
echo "🏗️  Creating ECR Repo..."
terraform apply -target=aws_ecr_repository.repo \
  -var="aws_region=$AWS_REGION" -var="project_name=$PROJECT_NAME" \
  -var="alert_email=$ALERT_EMAIL" -var="my_ip=$MY_IP" \
  -var="key_pair_name=$KEY_PAIR_NAME" -auto-approve

# --- Step 5: Build & Push ---
REPO_URL=$(terraform output -raw ecr_url)
echo "🐳 Logging into $REPO_URL..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPO_URL

echo "🔨 Building Image..."
cd "$PROJECT_ROOT/app"
docker build --platform linux/amd64 -t $REPO_URL:latest .
docker push $REPO_URL:latest
cd "$PROJECT_ROOT/infra"

# --- Step 6: Deploy Infrastructure ---
echo "🚀 Deploying Full Stack..."
terraform apply \
  -var="aws_region=$AWS_REGION" -var="project_name=$PROJECT_NAME" \
  -var="alert_email=$ALERT_EMAIL" -var="my_ip=$MY_IP" \
  -var="key_pair_name=$KEY_PAIR_NAME" -auto-approve

# --- Step 7: Force Update ---
CLUSTER=$(terraform output -raw alb_url | sed 's/-alb.*//')-cluster
SERVICE=$(terraform output -raw alb_url | sed 's/-alb.*//')-service
echo "🔄 Updating Service: $SERVICE..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region $AWS_REGION > /dev/null || true

echo "✅ SUCCESS!"
echo "------------------------------------------------"
echo "🌍 App URL:    http://$(terraform output -raw alb_url)"
echo "🔐 Bastion IP: $(terraform output -raw bastion_ip)"
echo "------------------------------------------------"
echo "⚠️  Check your email ($ALERT_EMAIL) to confirm alerts!"