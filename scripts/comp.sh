#!/bin/zsh
composedb composite:create schemas/Shard.graphql --output composites/shard.json --did-private-key $(cat priv.key) &&
composedb composite:merge composites/ritual.json composites/shard.json --output composites/demo-composites-merged.json &&
composedb composite:compile composites/demo-composites-merged.json composites/demo-runtime.json &&
composedb graphql:server composites/demo-runtime.json --did-private-key $(cat priv.key) --port=35000 --graphiql