rs.initiate(
    {
      _id : shard01,
      members: [
        { _id : 0, host : "shard01_rep1:27019" },
        { _id : 1, host : "shard01_rep2:27019" }
      ]
    }
)