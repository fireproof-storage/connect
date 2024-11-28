# Testing

All gateways are enabled by default in the Fireproof test suite. Before running the tests, you need to set up the gateway servers for PartyKit and Netlify:

```console
$ pnpm setup-gateway-servers
```

To run tests for all gateways:

```console
$ pnpm test-gateways
```

To run tests for a single gateway, you can use the Vitest workspace configuration. For example, to run tests for the PartyKit gateway only:

```console
$ pnpm test-gateways --project partykit
```

To run a single test by its full name, you can use the `-t` flag followed by the test name in quotes. For example:

```console
$ pnpm test-gateways --project partykit -t "should sync to an empty db"
```

Cloud Meta Merge Datastructure:

1. PK(reqId,resId,tenant,ledger) accessed(date) (delete after x of time)
2. PK(tenant,ledger,reqId,resId) meta deliveryCount (delete if deiveryCount > y)
   if meta is updated deliveryCount = 0

getMeta updates deliveryCount
getMeta on stream starts updates stream of resGetMeta
avoid subscribe method
