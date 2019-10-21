# Simple API App Example

## Overview

This simple NodeJS Express app illustrates how to create an "API Only" application that connects to your SmartThings
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
- .env -- file you create with AWS and app credentials

## Getting Started

### Prerequisites
- Approval to create an _API Access_ app in the SmartThings Developer Workspace. Submit requests for approval using
[this form](https://smartthings.developer.samsung.com/oauth-request)
- A [Glitch](https://glitch.com) account if you are following these instructions as written. Alternatly you can install
[Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) locally and use a tool like
[ngrok](https://ngrok.com/) to create a tunnel to a publically accessible HTTPS URL

