export const definition = {
  models: {
    DemoRitual: {
      id: "kjzl6hvfrbw6c9h4ngosxy1lrugyy3ouctqndnefh7lmrdq9gcs60c7hvdbmq80",
      accountRelation: { type: "list" },
    },
    DemoShard: {
      id: "kjzl6hvfrbw6c5xyuo9aj6zanou90f6xgqdfjxfjz8j6qwin160ozv61i910gh6",
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
            "kjzl6hvfrbw6c9h4ngosxy1lrugyy3ouctqndnefh7lmrdq9gcs60c7hvdbmq80",
          property: "ritualID",
        },
      },
      userPKHDID: { type: "view", viewType: "documentAccount" },
    },
  },
  enums: {},
  accountData: {
    demoRitualList: { type: "connection", name: "DemoRitual" },
    demoShardList: { type: "connection", name: "DemoShard" },
  },
};
