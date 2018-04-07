rs.initiate(
    {
      _id : shard03,
      members: [
        { _id : 0, host : "shard03_rep1:27019" },
        { _id : 1, host : "shard03_rep2:27019" }
      ]
    }
)