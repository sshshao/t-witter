# Witter
Dockerized version of service Witter

AMQP

Exchange: tasks Type: Direct

Queue: email_queue -> For Sending Emails.
Queue: auth_queue -> For Authentication Service RPC.
Queue: tweet_queue -> For Tweet-related Service RPC.
Queue: profile_queue -> For Profile Action Handling.


sudo docker stack rm twitter
git pull origin test
git checkout test

sudo sh build.sh
sudo docker stack deploy -c docker-compose.yml twitter