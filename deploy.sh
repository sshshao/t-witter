#!/bin/bash
echo "Deployment Process Started."

echo '\033[35m[x] Stopping Services... \033[0m'
sudo docker stack rm twitter

echo '\033[35m[x] Updating Codebase... \033[0m'
git pull origin master

echo '\033[36m[x] Build Docker Images... \033[0m'
sudo sh build.sh

echo '\033[36m[x] Deploy Services... \033[0m'
sleep 10
sudo docker stack deploy -c docker-compose.yml twitter

echo '\033[36m[x] Deployment Finished... \033[0m'
