sh.enableSharding( "witter" )
sh.shardCollection("witter.tweet", {"id": "hashed"})
sh.shardCollection("witter.profile", {"id": "hashed"})
//sh.shardCollection( "styxmail.styxlog", { "area" : 1, "_id" : 1 } )