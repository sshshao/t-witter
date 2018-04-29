kubectl run curl-abc --image=radial/busyboxplus:curl -i --tty --rm

kubectl exec -ti mongodb-shard-node01-5d5b4dd544-7psl4 -c mgs01-node01 mongo

curl -i -XDELETE 'localhost:9200/witter'; curl -i -XDELETE 'localhost:9200/mongodb_meta'; curl -i -XGET 'localhost:9200/_cat/indices?v';
