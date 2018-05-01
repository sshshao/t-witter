#!/bin/bash
mongo -host docker-2 < clear-mongo.js
echo "truncate media.media" | cqlsh docker-1
echo 'truncate "userAccount", "userActivationToken";' | psql -h 10.98.18.188 -p 5432 -U postgres witter;
