'use strict';

require('dotenv').config();
const express = require('express');
const session = require("express-session");
const path = require('path');
const morgan = require('morgan');
const encodeUrl = require('encodeurl');
const rp = require('request-promise-native');
const SmartApp = require('@smartthings/smartapp');

const port = process.env.PORT || 3000
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000'
const redirectUri = `${serverUrl}/oauth/callback`;
const scope = encodeUrl('r:locations:* r:scenes:* x:scenes:*');
const appId = process.env.APP_ID
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

/* SmartThings API */
const smartApp = new SmartApp()
	.appId(appId)
	.clientId(clientId)
	.clientSecret(clientSecret)
	.redirectUri(redirectUri)

/* Webserver setup */
const server = express();
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs');
server.use(morgan('dev'));
server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(session({
	secret: "oauth example secret",
	resave: false,
	saveUninitialized: true,
	cookie: {secure: false}
}));
server.use(express.static(path.join(__dirname, 'public')));

/* Main page. Shows link to SmartThings if not authenticated and list of scenes afterwards */
server.get('/', function (req, res) {
	if (req.session.smartThings) {
		// Context cookie found, use it to list scenes
		const data = req.session.smartThings;
		smartApp.withContext(data).then(ctx => {
			ctx.api.scenes.list().then(scenes => {
				res.render('scenes', {
					installedAppId: data.installedAppId,
					locationName: data.locationName,
					errorMessage: '',
					scenes: scenes
				})
			}).catch(error => {
				res.render('scenes', {
					installedAppId: data.installedAppId,
					locationName: data.locationName,
					errorMessage: `${error.message}`,
					scenes: {items:[]}
				})
			})
		})
	}
	else {
		// No context cookie. Display link to authenticate with SmartThings
		res.render('index', {
			url: `https://api.smartthings.com/oauth/authorize?client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}`
		})
	}
});

/* Uninstalls app and clears context cookie */
server.get('/logout', async function(req, res) {
	const ctx = await smartApp.withContext(req.session.smartThings)
	await ctx.api.installedApps.deleteInstalledApp()
	req.session.destroy(err => {
		res.redirect('/')
	})
});

/* Executes a scene */
server.post('/scenes/:sceneId', function (req, res) {
	smartApp.withContext(req.session.smartThings).then(ctx => {
		ctx.api.scenes.execute(req.params.sceneId).then(result => {
			res.send(result)
		})
	})
});

/* Handles OAuth redirect */
server.get('/oauth/callback', async (req, res) => {
	// Exchange the code for the auth token. Returns an API context that can be used for subsequent calls
	const ctx = await smartApp.handleOAuthCallback(req)

	// Get the location name
	const location = await ctx.api.locations.get();

	// Set the cookie with the context, including the location ID and name
	req.session.smartThings = {
		locationId: ctx.locationId,
		locationName: location.name,
		installedAppId: ctx.installedAppId,
		authToken: ctx.authToken,
		refreshToken: ctx.refreshToken
	};

	// Redirect back to the main mage
	res.redirect('/')
});

server.listen(port);
console.log(`\nWebsite URL -- Use this URL to log into SmartThings and connect this app to your account:\n${serverUrl}\n`);
console.log(`Redirect URI -- Copy this value into the "Redirection URI(s)" field in the Developer Workspace:\n${redirectUri}`);
