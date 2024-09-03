# Simple API Access App Example

## Overview

This simple NodeJS Express app illustrates how to create an _API Access_ SmartApp that connects to your SmartThings
account with OAuth2 and allows you to execute manually run routines (which are called "scenes" in the API). 
It's a very simple app that stores the access and refresh tokens in session state. It uses the 
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
- A [SmartThings](https://smartthings.com) account with at least one location and manually run routines created

- The SmartThings CLI installed on your computer

- [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your computer

## Instructions

### 1. Clone [this GitHub repository](https://github.com/SmartThingsCommunity/api-app-minimal-example-js), cd into the directory, and install the Node modules with NPM:
```$bash
git clone https://github.com/SmartThingsCommunity/api-app-minimal-example-js.git
cd api-app-minimal-example-js
npm install
```

### 2. Register your app with SmartThings using the CLI

Start with the `smartthings apps:create` command to create a new app. You will be prompted for the required
information. The following is an example of the output from the command:

```bash
~ % smartthings apps:create
? What kind of app do you want to create? (Currently, only OAuth-In apps are supported.) OAuth-In App

More information on writing SmartApps can be found at
  https://developer.smartthings.com/docs/connected-services/smartapp-basics

? Display Name My API App
? Description Allows scenes to be executed
? Icon Image URL (optional) 
? Target URL (optional) 

More information on OAuth 2 Scopes can be found at:
  https://www.oauth.com/oauth2-servers/scope/

To determine which scopes you need for the application, see documentation for the individual endpoints you will use in your app:
  https://developer.smartthings.com/docs/api/public/

? Select Scopes. r:locations:*, r:scenes:*, x:scenes:*
? Add or edit Redirect URIs. Add Redirect URI.
? Redirect URI (? for help) http://localhost:3000/oauth/callback
? Add or edit Redirect URIs. Finish editing Redirect URIs.
? Choose an action. Finish and create OAuth-In SmartApp.
Basic App Data:
─────────────────────────────────────────────────────────────────
 Display Name     My API App                                     
 App Id           037bcd6c-xxxx-xxxx-xxxx-xxxxxxxxxxxx           
 App Name         amyapiapp-a8b20801-xxxx-xxxx-xxxx-xxxxxxxxxxxx 
 Description      Allows scenes to be executed                   
 Single Instance  true                                           
 Classifications  CONNECTED_SERVICE                              
 App Type         API_ONLY                                       
─────────────────────────────────────────────────────────────────


OAuth Info (you will not be able to see the OAuth info again so please save it now!):
───────────────────────────────────────────────────────────
 OAuth Client Id      689f9823-xxxx-xxxx-xxxx-xxxxxxxxxxxx 
 OAuth Client Secret  3a2c39d8-xxxx-xxxx-xxxx-xxxxxxxxxxxx 
───────────────────────────────────────────────────────────
````

### 3. Create a `.env` file in the root directory of the project

Add the `PORT`, `SERVER_URL`, `APP_ID`, `CLIENT_ID`, and `CLIENT_SECRET` properties from the output of the `smartthings apps:create` command. For example:

```$bash
PORT=3000
SERVER_URL=http://localhost:3000
APP_ID=037bcd6c-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CLIENT_ID=689f9823-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CLIENT_SECRET=3a2c39d8-xxxx-xxxx-xxxx-xxxxxxxxxxxx 
```

### 4. Start your server:
```$bash
node server.js
```

### 5. Connect your app to SmartThings

Go to http://localhost:3000, log in with your SmartThings account credentials, and 
choose a location. You should see a page with the location name as a header and button for 
each scene in that location. Clicking the button should execute the scene. If you don't see
any buttons you may need to create some scenes using the SmartThings mobile app.
