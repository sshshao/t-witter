#!/bin/bash
echo '\033[35m[x] Starting Services... \033[0m'

cd deployment
kubectl apply -f api-gateway-deployment.yml
kubectl apply -f auth-service-deployment.yml
kubectl apply -f email-service-deployment.yml
kubectl apply -f profile-service-deployment.yml
kubectl apply -f tweet-service-deployment.yml


echo '\033[36m[x] Services Started... \033[0m'
