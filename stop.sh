#!/bin/bash
echo '\033[35m[x] Stopping Services... \033[0m'

cd deployment
kubectl delete -f api-gateway-deployment.yml
kubectl delete -f auth-service-deployment.yml
kubectl delete -f email-service-deployment.yml
kubectl delete -f profile-service-deployment.yml
kubectl delete -f tweet-service-deployment.yml


echo '\033[36m[x] Stopping Finished... \033[0m'
