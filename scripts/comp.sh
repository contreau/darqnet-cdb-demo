#!/bin/zsh
composedb composite:create schemas/Shard.graphql --output composites/shard.json --did-private-key $(cat priv.key) &&
composedb composite:merge composites/ritual.json composites/shard.json --output composites/demo-composites-merged.json &&
composedb composite:deploy composites/demo-composites-merged.json --did-private-key $(cat priv.key) &&
composedb composite:compile composites/demo-composites-merged.json composites/demo-runtime.json