# Load Vault secrets
set -euo pipefail
  VAULT_ADDR=${1:-"http://127.0.0.1:8200"}
  VAULT_TOKEN=${2:-"myroot"}
# Required
: "${VAULT_ADDR:?missing VAULT_ADDR}"
: "${VAULT_TOKEN:?missing VAULT_TOKEN}"
# Adjust to your secret path.
# KV v2 uses ".../data/..."; if you use KV v1, change to "secret/POS" and jq path below.
# ******************************
VAULT_SECRET_PATH=${VAULT_SECRET_PATH:-"PAYMENT-GATEWAY-DEV/data/payment-center"}

# Pick correct jq path for KV v1 vs v2
JQ_DATA='.data.data'
case "$VAULT_SECRET_PATH" in
  */data/*) JQ_DATA='.data.data' ;;  # KV v2
  *)        JQ_DATA='.data'      ;;  # KV v1
esac

if ! command -v jq >/dev/null 2>&1; then
  sudo apt update && sudo apt install -y jq
fi

# Fetch
json=$(curl -sS --fail -H "X-Vault-Token: $VAULT_TOKEN" \
  "$VAULT_ADDR/v1/$VAULT_SECRET_PATH")

# Extract (edit keys to match your Vault)
export NODE_ENV=$(echo "$json" | jq -r "$JQ_DATA.NODE_ENV // empty")
export RABBITMQ_QUEUE_NAME_SEND=$(echo "$json" | jq -r "$JQ_DATA.RABBITMQ_QUEUE_NAME_SEND // empty")
export RABBITMQ_QUEUE_PROFILE_SEND=$(echo "$json" | jq -r "$JQ_DATA.RABBITMQ_QUEUE_PROFILE_SEND // empty")
export RABBITMQ_QUEUE_ORDER_SEND=$(echo "$json" | jq -r "$JQ_DATA.RABBITMQ_QUEUE_ORDER_SEND // empty")
export DATABASE_URL=$(echo "$json" | jq -r "$JQ_DATA.DATABASE_URL // empty")
export URL_RABBITMQ=$(echo "$json" | jq -r "$JQ_DATA.URL_RABBITMQ // empty")
export RABBITMQ_QUEUE_NAME=$(echo "$json" | jq -r "$JQ_DATA.RABBITMQ_QUEUE_NAME // empty")
export IP_ADDRESS=$(echo "$json" | jq -r "$JQ_DATA.IP_ADDRESS // empty")
export PORT=$(echo "$json" | jq -r "$JQ_DATA.PORT // empty")


#================================================================================================
#PULL AND RUN DOCKER IMAGE
DOCKERHUB_USERNAME=${3:-"iquri"}
VERSION=${4:-"latest"}
DOCKER_PASSWORD=${5:-"pass-docker-hub"} #*******
IMAGE_NAME="rider" #********
CONTAINER_NAME="rider" #********
CLUSTER_NAME=api-cluster
DEPLOYMENT_NAME=__APP_NAME__

echo "🚀 Running POS Backend from Docker Hub..."
echo "Username: $DOCKERHUB_USERNAME"
echo "Version: $VERSION"
echo "Image: $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION"


# Docker login
echo "$DOCKER_PASSWORD" | sudo docker login -u "$DOCKERHUB_USERNAME" --password-stdin

# Pull the latest image from Docker Hub
echo "⬇️  Pulling image from Docker Hub..."
sudo docker pull $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION

# ===== CLUSTER =====
if ! k3d cluster list | grep -q "$CLUSTER_NAME"; then
  k3d cluster create $CLUSTER_NAME \
    --servers 3 \
    --agents 0 \
    --volume "$PWD/images:/images/" \
    -p "$PORT:$PORT@loadbalancer" \
    -p "8443:443@loadbalancer"
fi

# ===== IMAGE =====
k3d image import $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION -c $CLUSTER_NAME

# ===== APPLY MANIFEST =====
kubectl apply -f k3s/

# ===== SET ENV (NO FILE CHANGE) =====
kubectl set env deployment/$DEPLOYMENT_NAME \
  APP_NAME=$APP_NAME \
  NODE_ENV=$NODE_ENV \
  RABBITMQ_QUEUE_NAME_SEND=$RABBITMQ_QUEUE_NAME_SEND \
  RABBITMQ_QUEUE_PROFILE_SEND=$RABBITMQ_QUEUE_PROFILE_SEND \
  RABBITMQ_QUEUE_ORDER_SEND=$RABBITMQ_QUEUE_ORDER_SEND \
  DATABASE_URL=$DATABASE_URL \
  URL_RABBITMQ=$URL_RABBITMQ \
  RABBITMQ_QUEUE_NAME=$RABBITMQ_QUEUE_NAME \
  IP_ADDRESS=$IP_ADDRESS \
  PORT=$PORT

# ===== ROLLOUT =====
kubectl rollout restart deployment $DEPLOYMENT_NAME
kubectl rollout status deployment $DEPLOYMENT_NAME


# Show container status
sleep 2

#Docker logout
sudo docker logout || true

# Check if service exists
if sudo docker service ls | grep -q $CONTAINER_NAME; then
    echo "✅ Service deployed successfully!"
    echo "🌐 Application might be accessible at: http://localhost:$PORT/api/v1"
    echo "📊 View logs: docker service logs -f $CONTAINER_NAME"
    echo "🛑 Remove service: docker service rm $CONTAINER_NAME"
else
    echo "❌ Failed to deploy service."
    echo "Check logs with: docker service logs $CONTAINER_NAME"
fi

# Show service status
echo ""
echo "📈 Service Status:"
sudo docker service ls --filter "name=$CONTAINER_NAME"

# Show service tasks (containers running inside the service)
echo ""
echo "📦 Service Tasks:"
sudo docker service ps $CONTAINER_NAME --format "table {{.Name}}\t{{.CurrentState}}\t{{.Node}}"

# Get one running task ID to show logs (optional)
TASK_ID=$(sudo docker ps --filter "name=${CONTAINER_NAME}" --format "{{.ID}}" | head -n 1)

echo ""
echo "📋 Initial logs (last 10 lines):"
if [ -n "$TASK_ID" ]; then
    sudo docker logs --tail 10 $TASK_ID
else
    echo "⚠ No running task found to show logs."
fi


sudo docker system prune -f