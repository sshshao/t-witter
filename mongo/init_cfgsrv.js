rs.initiate(
    {
      _id : cfg,
      members: [
        { _id : 0, host : "cfg_r1:27018" },
        { _id : 1, host : "cfg_r2:27018" }
      ]
    }
  )