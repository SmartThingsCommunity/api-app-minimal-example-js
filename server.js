'use strict';

require('dotenv').config();
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const encodeUrl = require('encodeurl')
const rp = require('request-promise-native')
const SmartApp = require('@smartthings/smartapp')

const port = process.env.PORT
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const redirectUri = `${process.env.URL}/oauth/callback`
const scope = encodeUrl('r:locations:* r:scenes:* x:scenes:*')

/* SmartThings API */
const smartApp = new SmartApp()

/* Webserver setup */
const server = express()
server.set('views', path.join(__dirname, 'views'))
server.set('view engine', 'ejs')
server.use(logger('dev'))
server.use(express.json())
server.use(express.urlencoded({extended: false}))
server.use(cookieParser())
server.use(express.static(path.join(__dirname, 'public')))

/* Main page. Shows link to SmartThings if not authenticated and list of scenes afterwards */
server.get('/', function (req, res) {
	console.log(req.cookies.smartThings)
	if (req.cookies.smartThings) {
		// Context cookie found, use it to list scenes
		const data = JSON.parse(req.cookies.smartThings)
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
})

/* Uninstalls app and clears context cookie */
server.get('/logout', function(req, res) {
	smartApp.withContext(JSON.parse(req.cookies.smartThings)).then(ctx => {
		ctx.api.installedApps.deleteInstalledApp().then(result => {
			res.cookie('smartThings', '', {maxAge: 0, httpOnly: true});
			res.redirect('/')
			res.end();
		})
	}).catch(error => {
		res.cookie('smartThings', '', {maxAge: 0, httpOnly: true});
		res.redirect('/')
		res.end()
	})
})

/* Executes a scene */
server.post('/scenes/:sceneId', function (req, res) {
	smartApp.withContext(JSON.parse(req.cookies.smartThings)).then(ctx => {
		ctx.api.scenes.execute(req.params.sceneId).then(result => {
			res.send(result)
		})
	})
})

/* Accepts registration challenge and confirms app */
server.post('/', function (req, res) {
	console.log(JSON.stringify(req.body, null, 2))
	if (false && req.body.confirmationData && req.body.confirmationData.confirmationUrl) {
		rp.get(req.body.confirmationData.confirmationUrl).then(data => {
			console.log(data)
		})
	}
	res.send('{}')
})

/* Handles OAuth redirect */
server.get('/oauth/callback', function (req, res) {
	console.log(`/oauth/callback ${JSON.stringify(req.query)}`)

	// Exchange the code for the auth token
	rp.post('https://api.smartthings.com/oauth/token', {
		headers: {
			Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`
		},
		form: {
			client_id: clientId,
			code: req.query.code,
			grant_type: 'authorization_code',
			redirect_uri: redirectUri
		}
	}).then(body => {

		// Initialize the SmartThings API context
		const data = JSON.parse(body)
		smartApp.withContext({
			installedAppId: data.installed_app_id,
			authToken: data.access_token,
			refreshToken: data.refresh_token
		}).then(ctx => {

			// Get the location ID from the installedAppId (would be nice if it was already in the response)
			ctx.api.installedApps.get(data.installed_app_id).then(isa => {

				// Get the location name
				ctx.api.locations.get(isa.locationId).then(location => {

					// Set the cookie with the context, including the location ID and name
					res.cookie('smartThings', JSON.stringify({
						locationId: isa.locationId,
						locationName: location.name,
						installedAppId: data.installed_app_id,
						authToken: data.access_token,
						refreshToken: data.refresh_token
					}), { maxAge: 31536000000, httpOnly: true });

					// Redirect back to the main mage
					res.redirect('/')

				})
			})
		})
	})

})

server.listen(port);
console.log(`Open:     ${process.env.URL}`);
console.log(`Callback: ${process.env.URL}/oauth/callback`);
