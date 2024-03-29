#!/bin/zsh
composedb graphql:server composites/demo-runtime.json --did-private-key $(cat priv.key) --port=35000 --graphiql