# `@fireproof/ucan`

[Fireproof](https://use-fireproof.com) is an embedded JavaScript document database that runs in the browser (or anywhere with JavaScript) and **[connects to any cloud](https://www.npmjs.com/package/@fireproof/connect)**.

This connector connects to an instance of a [Fireproof UCAN server](https://github.com/fireproof-storage/fireproof-ucan).

## Get started

In your existing Fireproof app install the connector:

```sh
npm install @fireproof/ucan
```

Then connect:

```js
import { useFireproof } from "use-fireproof";
import * as UCAN from "@fireproof/ucan";

const { database } = useFireproof("my-app-database-name");
const connection = await UCAN.connect(database);
```
