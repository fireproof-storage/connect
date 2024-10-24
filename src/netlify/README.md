# `@fireproof/netlify`

[Fireproof](https://use-fireproof.com) is an embedded JavaScript document ledger that runs in the browser (or anywhere with JavaScript) and **[connects to any cloud](https://www.npmjs.com/package/@fireproof/connect)**.

This module, `@fireproof/netlify`, allows you to connect your Fireproof ledger to Netlify, enabling you to sync your data across multiple users in real-time.

## Get started

We assume you already have an app that uses Fireproof in the browser, and you want to setup collaboration among multiple users via the cloud. To write your first Fireproof app, see the [Fireproof quickstart](https://use-fireproof.com/docs/react-tutorial), otherwise read on.

### 1. Install

In your existing Fireproof app install the connector:

```sh
npm install @fireproof/netlify
```

In your netlify project, install the `@netlify/blobs` package:

```sh
npm install @netlify/blobs
```

And finally, copy the `server.ts` file from this repo into your project:

```sh
cp node_modules/@fireproof/netlify/server.ts netlify/edge-functions/fireproof.ts
```

### 2. Connect

You're all done on the server, and ready to develop locally and then deploy with no further changes. Now you just need to connect to the Netlify in your client code:

```js
// you already have this in your app
import { useFireproof } from "use-fireproof";
// add this line
import { connect } from "@fireproof/netlify";
```

Now later in your app connect to the party (be sure to do this a component that runs on every render, like your root component or layout):

```js
const { ledger } = useFireproof('my-app-ledger-name')
const connection = connect(ledger, '', process.env.NEXT_PUBLIC_NETLIFY_HOST!)
```

The `connect` function is idempotent and designed to be safe to call on every render.

### 3. Collaborate

Now you can use Fireproof as you normally would, and it will sync in realtime with other users. Any existing apps you have that use the [live query](https://use-fireproof.com/docs/react-hooks/use-live-query) or [subscription](https://use-fireproof.com/docs/ledger-api/ledger#subscribe) APIs will automatically render multi-user updates.
