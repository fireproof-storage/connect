# Fireproof Cloud

This gateway intended for use with Fireproof Cloud.

## Usage

You can call the `connect` function with a ledger and it will provision a remote UUID for the ledger, and sync the ledger to the remote. It will also log a URL to the console that you can open in a browser to connect to the ledger, as well as try to open the URL in a new tab. Tell us what you think about this workflow!

```typescript
import { fireproof } from "@fireproof/core";
import { connect } from "@fireproof/cloud";

const ledger = await fireproof("my-db-name");
const connection = await connect(ledger);
```

### With React Hooks

In a React component, you can use the `useFireproof` hook to get the ledger and then call `connect` (it is safe to call `connect` multiple times, but in this example we're using a state variable to store the dashboard URL).

```typescript
import { useFireproof } from "use-fireproof";
import { connect } from "@fireproof/cloud";

const { ledger } = useFireproof("my-db-name");
const [dashboardUrl, setDashboardUrl] = useState<string | undefined>();

// there is a useConnection hook coming soon
useEffect(() => {
  connect(ledger).then((connection) => {
    setDashboardUrl(connection.dashboardUrl?.toString());
  });
}, [ledger]);
```

## The Second Argument

The second argument to `connect` is the remote ledger name. This will be assigned for you if you don't provide one, and the created name will be persisted locally.

The most common way to use this is if you want to sync to a remote ledger. The UUID will have been assigned when on first sync, and now you want to connect a new client to that remote.

```typescript
const connection = await connect(ledger, "my-remote-uuid");
```

If you provide a name, it will be used as the remote ledger name. If you want to control the name, you should use a prefix unique to your app, so no one else uses your endpoint. This is useful if you want the ledger name to come from your URL slug, like `/my-app/my-db-name`.

```typescript
const connection = await connect(ledger, `com.my-app.v1.${ledger.name}`);
```

Note: if your ledger already has data in it, connecting to a new remote will do nothing. To prevent data lost, you need to rename the local ledger to an unused name and the connect.

## No Warranty, For Evaluation Purposes

This preview of Fireproof Cloud doesn't even have login, so don't expect your data to be persisted, etc. Please give us feedback on the workflow! We'll be adding login and access control soon.

The source of truth on this stuff is the team. Join us on [Discord](https://discord.gg/cCryrNHePH) if you want to chat!
