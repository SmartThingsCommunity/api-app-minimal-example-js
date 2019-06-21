# Simple API App Example

## Overview

This simple NodeJS Express app illustrates how to create an "API Only" application that connects to your SmartThings
account with OAuth2 and allows you to execute scenes. It's a very simple app that stores the access and refresh tokens
in a cookie, so it needs no server-side persistence. It uses the 
[@SmartThings/SmartApp](https://www.npmjs.com/package/@smartthings/smartapp) SDK NPM module for making the
API calls to list and execute scenes.

## Quickstart

### Register your app

- Get a personal token with at least `w:apps` scope from [https://account.smartthings.com/tokens](https://account.smartthings.com/tokens)

- Register the app by replacing the `Authorization` header, `appName`, `targetUrl` and `redirectUris` fields and running 
the following command :

```bash
curl -X POST -H "Authorization: Bearer {REPLACE-WITH-YOUR-PAT-TOKEN}" \
"https://api.smartthings.com/apps" \
-d '{
  "appName": "{REPLACE-WITH-YOUR-APP-NAME}",
  "displayName": "Simple API App Example",
  "description": "Demonstrates basics of a SmartThings API app which authenticates with the SmartThings platform using OAuth2",
  "singleInstance": false,
  "appType": "API_ONLY",
  "classifications": [
    "AUTOMATION"
  ],
  "apiOnly": {
      "targetUrl": "{REPLACE-WITH-YOUR-TUNNEL-URL}"
  },
  "oauth": {
    "clientName": "Simple API App Example",
    "scope": [
      "r:locations:*",
      "r:scenes:*",
      "x:scenes:*"
    ],
    "redirectUris": ["{REPLACE-WITH-YOUR-TUNNEL-URL}/oauth/callback"]
  }
}'
```

Save the response somewhere. Put the `oauthClientId` and `oauthClientSecret` fields from that response in the `.env` 
file as `CLIENT_ID` and `CLIENT_SECRET`.

### Start the server
```bash
node server.js
```

### Confirm the app

Confirm the app by replacing the the `Authorization` header and appId and running the following command:

```bash
curl -X PUT -H "Authorization: Bearer {YOUR-TOKEN}" \
"https://api.smartthingsgdev.com/v1/apps/{YOUR-APP-ID}/register"
```

This request will result in a POST request being made to the server with a body that includes a confirmation URL, such as:

```json
{
  "messageType": "CONFIRMATION",
  "confirmationData": {
    "appId": "dsdf9572-edb5-8dss-a68e-8f3d60ab3a7b",
    "confirmationUrl": "https://apid.smartthingsgdev.com/apps/dsdf9572-edb5-8dss-a68e-8f3d60ab3a7b/confirm-registration?token=255de253-9ddb-48b5-8343-3a13574pa0da"
  }
}
```

The server will automatically issue a `GET` request to the `confirmationUrl` to confirm your app and allow requests from 
SmartThings to be sent to it. The response from that
request will contain the URL of your server, for example:
```json
{"targetUrl":"https://yourngrokname.ngrok.io"}
```

### Authenticate with SmartThings and execute scenes

1. Open a browser to your your public server tunnel URL
2. Click the "Connect to SmartThings" link on the page
3. Log in to your SmartThings account
4. Select a location and authorize the app

You will then see a page with all the scenes defined for that location. Clicking on a scene name should make an API call 
to execute the scene.
