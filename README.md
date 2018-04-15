# Witter
Dockerized version of service Witter

AMQP

Exchange: tasks Type: Direct

Queue: email_queue -> For Sending Emails.
Queue: auth_queue -> For Authentication Service RPC.
Queue: tweet_queue -> For Tweet-related Service RPC.
Queue: profile_queue -> For Profile Action Handling.


run deploy.sh will first stop all services, then fetch the newest repo, then deploy those services.