rs.initiate()
cfg = rs.conf()
cfg.members[0].host = "mongodb-node03.default.svc.cluster.local:27020"
cfg.members[0].priority = 5
rs.reconfig(cfg, {force: true})
