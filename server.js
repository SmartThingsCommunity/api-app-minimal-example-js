'use strict';

require('dotenv').config();
const express = require('express');
const session = require("express-session");
const path = require('path');
const morgan = require('morgan');
const encodeUrl = require('encodeurl');
const rp = require('request-promise-native');
const SmartApp = require('@smartthings/smartapp');

const port = process.env.PORT;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = `${process.env.URL}/oauth/callback`;
const scope = encodeUrl('r:locations:* r:scenes:* x:scenes:*');

/* SmartThings API */
const smartApp = new SmartApp();

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
		// No context cookie. Displey link to authenticate with SmartThings
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
	// Exchange the code for the auth token
	const body = await rp.post('https://api.smartthings.com/oauth/token', {
		headers: {
			Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`
		},
		form: {
			client_id: clientId,
			code: req.query.code,
			grant_type: 'authorization_code',
			redirect_uri: redirectUri
		}
	});

	// Initialize the SmartThings API context
	const data = JSON.parse(body)
	let ctx = await smartApp.withContext({
		installedAppId: data.installed_app_id,
		authToken: data.access_token,
		refreshToken: data.refresh_token
	});

	// Get the location ID from the installedAppId (would be nice if it was already in the response)
	const isa = await ctx.api.installedApps.get(data.installed_app_id);

	// Get the location name
	const location = await ctx.api.locations.get(isa.locationId);

	// Set the cookie with the context, including the location ID and name
	req.session.smartThings = {
		locationId: isa.locationId,
		locationName: location.name,
		installedAppId: data.installed_app_id,
		authToken: data.access_token,
		refreshToken: data.refresh_token
	};

	// Redirect back to the main mage
	res.redirect('/')

});

server.listen(port);
console.log(`Open:     ${process.env.URL}`);
console.log(`Callback: ${process.env.URL}/oauth/callback`);
