# Nomba SDK for Node.js

A TypeScript/Node.js SDK for interacting with the Nomba API.

## Coverage

This SDK currently supports Nomba's APIs, including:

-   Authentication — issue, refresh, and revoke access tokens
-   Bank — list banks, account lookup, and bank transfers
-   Checkout — create orders, cancel orders, and refund transactions
-   Virtual Accounts — create, create for sub-accounts, list, get, update, expire, suspend, and lookup

## Installation

You can install the published npm package directly:

```
npm install @ohunkohun/nomba
```

Then import and initialize the SDK:

```
import { Nomba } from "@ohunkohun/nomba";

const client = Nomba({
    account_id: "YOUR_ACCOUNT_ID",
    client_id: "YOUR_CLIENT_ID",
    client_secret: "YOUR_CLIENT_SECRET",
    environment: "sandbox", // or "live"
    debug: "error", // only supply this if you want logs when an error is caught
});
```

You can now use the available API resources through the client:

```
const response = await client.virtual_account.expire("virtualAccountRef");

if (response?.status) {
    console.log("success::", response.data);
} else {
    console.log("failed::", response.description);
}
```

For example, creating a virtual account:

```
const response = await client.virtual_account.create({
    accountName: "Test One",
    accountRef: "test-account-ref",
    currency: "NGN",
    expiryDate: new Date(
        Date.now() + 10 * 60 * 1000
    ).toISOString(),
});
```

> Replace the configuration and request values with those appropriate for your Nomba account and environment.

---

## Working With the Repository

If you have cloned this repository and want to work with the source code directly:

```
git clone https://github.com/OhunkohunSDKs/nomba
cd nomba
npm install
```

Build the SDK with:

```
npm run build
```

The compiled package will be generated in the `dist` directory.

---

## Testing the SDK Locally

The repository contains a simple example application for testing the SDK.

For example:

```
import { NombaConfig } from "@ohunkohun/nomba";

const config: NombaConfig = {
    account_id: process.env.ACCOUNT_ID!,
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    environment: process.env.ENVIRONMENT! as NombaConfig["environment"],
    debug: "error",
};

const client = Nomba(config);

const response = await client.virtual_account.expire(
    "virtualAccountRef"
);

if (response?.status) {
    console.log("success::", response.data);
} else {
    console.log("failed::", response.description);
}
```

The example does not form part of the published npm package. It is included in the repository for development and testing purposes.

### Environment Variables

The examples can use a `.env` file for configuration:

```
ACCOUNT_ID="your-account-id"
CLIENT_ID="your-client-id"
CLIENT_SECRET="your-client-secret"
ENVIRONMENT="sandbox"
```

Using `.env` is **not required**. Values can also be supplied directly:

```
const config: NombaConfig = {
    account_id: "your-account-id",
    client_id: "your-client-id",
    client_secret: "your-client-secret",
    environment: "sandbox",
};
```

Using environment variables is recommended for sensitive credentials such as `client_id` and `client_secret`.

---

## Testing the SDK as an Installed npm Package

To test the SDK as a consumer would, install the published package:

```
npm install @ohunkohun/nomba
```

Then import it normally:

```
import { Nomba } from "@ohunkohun/nomba";
```

This allows you to test the package's:

-   Public exports
-   TypeScript declarations
-   Auto-completion
-   API surface
-   Package entry points
-   Production build

---

## Development

Start the development environment with:

```
npm run dev
```

To watch for TypeScript errors:

```
npm run types:watch
```

To create a production build:

```
npm run build
```

---

## Package vs. Repository

If you only want to **use the SDK**, installing the npm package is recommended:

```
npm install @ohunkohun/nomba
```

If you want to **contribute to, modify, or inspect the SDK source code**, clone the repository:

```
git clone https://github.com/OhunkohunSDKs/nomba
cd nomba
npm install
```

The repository also contains examples that can be used to test the SDK against the Nomba API.

---

## Disclaimer

This is a community-built, unofficial Node.js/TypeScript SDK for the Nomba API. It is not an official Nomba package unless otherwise stated by Nomba.
