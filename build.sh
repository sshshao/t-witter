#!/bin/bash
echo "Build Started."

cd auth
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
docker tag twitter_auth_service localhost:5000/twitter_auth_service

echo '\033[35m[x] Pushing Auth Service...\033[0m'
docker push localhost:5000/twitter_auth_service


# Tagging and Pushing Email Service.
echo '\033[35m[x] Tagging Email Service...\033[0m'
docker tag twitter_email_service localhost:5000/twitter_email_service

echo '\033[35m[x] Pushing Email Service...\033[0m'
docker push localhost:5000/twitter_email_service


# Tagging and Pushing Gateway Service.
echo '\033[35m[x] Tagging Gateway Service...\033[0m'
docker tag twitter_gateway_service localhost:5000/twitter_gateway_service

echo '\033[35m[x] Pushing Gateway Service...\033[0m'
docker push localhost:5000/twitter_gateway_service


# Tagging and Pushing Profile Service.
echo '\033[35m[x] Tagging Profile Service...\033[0m'
docker tag twitter_profile_service localhost:5000/twitter_profile_service

echo '\033[35m[x] Pushing Profile Service...\033[0m'
docker push localhost:5000/twitter_profile_service


# Tagging and Pushing Tweet Service.
echo '\033[35m[x] Tagging Tweet Service...\033[0m'
docker tag twitter_tweet_service localhost:5000/twitter_tweet_service

echo '\033[35m[x] Pushing Tweet Service...\033[0m'
docker push localhost:5000/twitter_tweet_service

echo '\033[32m[x] Image Build Finished...\033[0m'
