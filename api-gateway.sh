
cd deployment
kubectl delete -f api-gateway-deployment.yml

git checkout m3-node
git pull origin m3-node

cd ../gateway
echo '\033[34m[x] Building API Gateway Service...\033[0m'
sudo docker image build -q -t twitter_gateway_service .

# Tagging and Pushing Gateway Service.
echo '\033[35m[x] Tagging Gateway Service...\033[0m'
sudo docker tag twitter_gateway_service richackard/twitter_gateway_service:latest

echo '\033[35m[x] Pushing Gateway Service...\033[0m'
sudo docker push richackard/twitter_gateway_service:latest

cd ../deployment

kubectl apply -f api-gateway-deployment.yml