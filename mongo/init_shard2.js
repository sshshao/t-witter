rs.initiate(
    {
      _id : shard02,
      members: [
        { _id : 0, host : "shard02_rep1:27019" },
        { _id : 1, host : "shard02_rep2:27019" }
      ]
    }
)