#!/usr/bin/env bash
set -e

# ===== CONFIG =====
CLUSTER_NAME=dev-cluster
APP_NAME=api
NODE_ENV=production
DEPLOYMENT_NAME=api
IMAGE=test:dev

# ===== CLUSTER =====
if ! k3d cluster list | grep -q "$CLUSTER_NAME"; then
  k3d cluster create $CLUSTER_NAME \
    --servers 1 \
    --agents 0 \
    --network my_network \
    -p "8000:80@loadbalancer" \
    -p "8443:443@loadbalancer"
fi

# ===== IMAGE =====
k3d image import $IMAGE -c $CLUSTER_NAME

# ===== APPLY MANIFEST =====
kubectl apply -f k8s/

# ===== SET ENV (NO FILE CHANGE) =====
kubectl set env deployment/$DEPLOYMENT_NAME \
  SERVICE_NAME="template_clean_nest" \
  DATABASE_URL="postgresql://postgres:postgres@postgres-nest:5432/template_clean_nest?schema=public"

# ===== ROLLOUT =====
kubectl rollout restart deployment $DEPLOYMENT_NAME
kubectl rollout status deployment $DEPLOYMENT_NAME

