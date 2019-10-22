# Simple API Access App Example

## Overview

This simple NodeJS Express app illustrates how to create an _API Access_ SmartApp that connects to your SmartThings
account with OAuth2 and allows you to execute scenes. It's a very simple app that stores the access and refresh tokens
in session state. By default it uses the 
[express-session](https://www.npmjs.com/package/express-session#compatible-session-stores) in-memory session store, 
so you will lose your session data
when you restart the server, but you can use another 
[compatible session store](https://www.npmjs.com/package/express-session#compatible-session-stores)
to make the session persist between server
restarts. This example uses the 
[@SmartThings/SmartApp](https://www.npmjs.com/package/@smartthings/smartapp) SDK NPM module for making the
API calls to list and execute scenes.

## Files and directories 

- public
  - stylesheets -- stylesheets used by the web pages
- views
  - error.ejs -- error page
  - index.ejs -- initial page with link to connect to SmartThings
  - scenes.ejs -- page that displays scenes and allows them to be executed
- server.js -- the Express server and SmartApp
- .env -- file you create with app client ID and client secret

## Getting Started

### Prerequisites
- A [Samsung Developer Workspace account](https://smartthings.developer.samsung.com/workspace/) with _API Access_ app approval. 
Submit requests for approval using
[this form](https://smartthings.developer.samsung.com/oauth-request)

- [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed

- [ngrok](https://ngrok.com/) or similar tool to create a secure tunnel to a publically available URL (This is
required because the Developer Workspace does not allow HTTP or localhost in callback URLs. As an alternative, 
you can edit your local machine's _hosts_ file so that your app can have a redirect URL that isn't _localhost_).

## Instructions

- Clone [this GitHub repository](https://github.com/SmartThingsCommunity/api-app-minimal-example-js), cd into the
directory, and install the Node modules with NPM:
```$bash
git clone https://github.com/SmartThingsCommunity/api-app-minimal-example-js.git
cd api-app-minimal-example-js
npm install
```

- Create a file named `.env` in the project directory and set the base URL of the server to your ngrok URL 
(or the URL you configured in your local hosts file):
```$bash
SERVER_URL=https://your-subdomain-name.ngrok.io
```

- Start your server and make note of the :
```$bash
node server.js

Website URL -- Use this URL to log into SmartThings and connect this app to your account:
https://your-subdomain-name.ngrok.io

Redirect URI -- Copy this value into the "Redirection URI(s)" field in the Developer Workspace:
https://your-subdomain-name.ngrok.io/oauth/callback
```

- Go to the [SmartThings Developer Workspace](https://smartthings.developer.samsung.com/workspace) and create an new
[API Access](https://smartthings.developer.samsung.com/workspace/projects/new?type=CPT-OAUTH) project in your organization.
If the previous link doesn't work and you don't see an option for creating an API access project, then your access
has not yet been approved. 

- After creating the project click the Use the _Register an Application_ link and fill in the fields, and click _Save_. 
Use the _Redirect URI_ value printed out in the server log and specify the 
`r:locations:*`, `r:scenes:*`, and `x:scenes:*` scopes.

>NOTE: If you do not see options for the `r:scenes:*` and `x:scenes:*` scopes in the Developer Workspace, add then
>to your app with the following steps:
>- Get a personal token with at least `w:apps` scope from [https://account.smartthings.com/tokens](https://account.smartthings.com/tokens)
>
>- Save the current OAuth information for you app by running the following command, substituting your PAT_TOKEN and APP_ID. You can
>get your APP_ID from the Developer Workspace
> ```$bash
> curl -H "Authorization: Bearer {PAT_TOKEN}" \
>      https://api.smartthings.com/apps/{APP_ID}/oauth > oauth.json
> ```
>
> - Edit the `oauth.json` file to add the scenes scopes. It should look something like this:
>```$json
> {
>     "clientName": "API App Minimal example",
>     "scope": [
>       "r:locations:*",
>       "r:scenes:*",
>       "x:scenes:*"
>     ],
>     "redirectUris": [
>       "https://something-or-the-other.glith.me/oauth/callback"
>     ]
>   }
>```
>
> - Update your app with the new OAuth scopes:
>```$bash
> curl -X PUT -H "Authorization: Bearer {PAT_TOKEN}" \
>      -d @oauth.json \
>      https://api.smartthings.com/apps/{APP_ID}/oauth
>```
>

- Add the _CLIENT_ID_ and _CLIENT_SECRET_ properties from the Developer Workspace to your `.env` file. 
For example:
```$bash
SERVER_URL=https://your-subdomain-name.ngrok.io
CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx
CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx
```

- Restart your server:
```$bash
node server.js
```

- Go to webside URL from the server log, log in with your SmartThings account credentials, and 
choose a location. You should see a page with the location name as a header and button for 
each scene in that location. Clicking the button should execute the scene. If you don't see
any buttons you may need to create some scenes using the SmartThings mobile app.
