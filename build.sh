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
echo '\033[32m[x] Image Build Finished...\033[0m'
