export const definition = {
  models: {
    DemoRitual: {
      id: "kjzl6hvfrbw6ca0umk8zz2y39gunxcai5j88vq2rna6dppmbaqhz3mou4d9eyon",
      accountRelation: { type: "single" },
    },
    DemoShard: {
      id: "kjzl6hvfrbw6c5ugxdgut7jez0fkd6qu6bo8qq4rrtwgg96ywwyd3sc6dv42f61",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    DemoRitual: {
      date: { type: "datetime", required: true },
      name: { type: "string", required: true },
      intentions: { type: "string", required: true },
    },
    DemoShard: {
      ritualID: { type: "streamid", required: true },
      shardValue: { type: "string", required: true },
      ritual: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "document",
          model:
            "kjzl6hvfrbw6ca0umk8zz2y39gunxcai5j88vq2rna6dppmbaqhz3mou4d9eyon",
          property: "ritualID",
        },
      },
    },
  },
  enums: {},
  accountData: {
    demoRitual: { type: "node", name: "DemoRitual" },
    demoShardList: { type: "connection", name: "DemoShard" },
  },
};
