#!/bin/bash
echo "Deployment Process Started."

echo '\033[35m[x] Stopping Services... \033[0m'

cd deployment
kubectl delete -f api-gateway-deployment.yml
kubectl delete -f auth-service-deployment.yml
kubectl delete -f email-service-deployment.yml
kubectl delete -f profile-service-deployment.yml
kubectl delete -f memcached-service-deployment.yml
kubectl delete -f tweet-service-deployment.yml

cd ..
echo '\033[35m[x] Updating Codebase... \033[0m'
git checkout m4
git pull origin m4
sudo sh build.sh


echo '\033[35m[x] Clearing Databases.. \033[0m'
curl -XDELETE 10.0.1.14:9200/tweets
cd deployment
sleep 5
cd utils
sh clear.sh
cd ..
echo '\033[35m[x] Deploying new Services... \033[0m'
kubectl apply -f api-gateway-deployment.yml
kubectl apply -f auth-service-deployment.yml
kubectl apply -f email-service-deployment.yml
kubectl apply -f profile-service-deployment.yml
kubectl apply -f tweet-service-deployment.yml
kubectl apply -f memcached-service-deployment.yml


echo '\033[36m[x] Deployment Finished... \033[0m'
