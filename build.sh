#!/bin/bash
echo "Build Started."

#echo '\033[35m[x] Stopping Services... \033[0m'
#kompose down
#sudo docker stack rm twitter

echo '\033[35m[x] Updating Codebase... \033[0m'
git pull origin kube
git checkout kube

echo '\033[36m[x] Build Docker Images... \033[0m'
#sudo sh build.sh
#echo '\033[36m[x] Deploy Services... \033[0m'
#sleep 10
#kompose up
#sudo docker stack deploy -c docker-compose.yml twitter

cd mongo
echo '\033[33m[x] Building Mongo DB Service...\033[0m'
docker image build -q -t twitter_mongo_db .

cd ../auth
echo '\033[35m[x] Building Auth Service...\033[0m'
docker image build -q -t twitter_auth_service .

cd ../email
echo '\033[36m[x] Building Email Service...\033[0m'
docker image build -q -t twitter_email_service .

cd ../gateway
echo '\033[34m[x] Building API Gateway Service...\033[0m'
docker image build -q -t twitter_gateway_service .

cd ../profile
echo '\033[33m[x] Building Profile Service...\033[0m'
docker image build -q -t twitter_profile_service .

cd ../tweet
echo '\033[35m[x] Building Tweet Service...\033[0m'
docker image build -q -t twitter_tweet_service .

# TAG AND PUSH TO LOCAL REGISTRY.


# Tagging and Pushing Auth Service.
echo '\033[35m[x] Tagging Auth Service...\033[0m'
docker tag twitter_auth_service richackard/twitter_auth_service:latest

echo '\033[35m[x] Pushing Auth Service...\033[0m'
docker push richackard/twitter_auth_service:latest


# Tagging and Pushing Email Service.
echo '\033[35m[x] Tagging Email Service...\033[0m'
docker tag twitter_email_service richackard/twitter_email_service:latest

echo '\033[35m[x] Pushing Email Service...\033[0m'
docker push richackard/twitter_email_service:latest


# Tagging and Pushing Gateway Service.
echo '\033[35m[x] Tagging Gateway Service...\033[0m'
docker tag twitter_gateway_service richackard/twitter_gateway_service:latest

echo '\033[35m[x] Pushing Gateway Service...\033[0m'
docker push richackard/twitter_gateway_service:latest


# Tagging and Pushing Profile Service.
echo '\033[35m[x] Tagging Profile Service...\033[0m'
docker tag twitter_profile_service richackard/twitter_profile_service:latest

echo '\033[35m[x] Pushing Profile Service...\033[0m'
docker push richackard/twitter_profile_service:latest


# Tagging and Pushing Tweet Service.
echo '\033[35m[x] Tagging Tweet Service...\033[0m'
docker tag twitter_tweet_service richackard/twitter_tweet_service:latest

echo '\033[35m[x] Pushing Tweet Service...\033[0m'
docker push richackard/twitter_tweet_service:latest

echo '\033[32m[x] Image Build Finished...\033[0m'
