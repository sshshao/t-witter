# Witter
Dockerized version of service Witter

AMQP

Exchange: tasks Type: Direct

Queue: email_queue -> For Sending Emails.
Queue: auth_queue -> For Authentication Service RPC.
Queue: tweet_queue -> For Tweet-related Service RPC.
Queue: profile_queue -> For Profile Action Handling.


run deploy.sh will first stop all services, then fetch the newest repo, then deploy those services.


Memcached can be accessed via port 11211 on the following DNS name from within your cluster:
memcache-memcached.default.svc.cluster.local

If you'd like to test your instance, forward the port locally:

  export POD_NAME=$(kubectl get pods --namespace default -l "app=memcache-memcached" -o jsonpath="{.items[0].metadata.name}")
  kubectl port-forward $POD_NAME 11211

In another tab, attempt to set a key:

  $ echo -e 'set mykey 0 60 5\r\nhello\r' | nc localhost 11211

You should see:

  STORED