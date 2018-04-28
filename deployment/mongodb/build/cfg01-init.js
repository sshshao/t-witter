rs.initiate( {
   _id: "configReplSet01",
   configsvr: true,
   members: [
		{ _id: 0, host: "mongodb-node01.default.svc.cluster.local:27018" },
		{ _id: 1, host: "mongodb-node02.default.svc.cluster.local:27018" },
		{ _id: 2, host: "mongodb-node03.default.svc.cluster.local:27018" },
		{ _id: 3, host: "mongodb-node04.default.svc.cluster.local:27018" }
   ]
} )
