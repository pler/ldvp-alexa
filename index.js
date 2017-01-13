'use strict';

// Initialization
module.change_code = 1;

const Alexa = require('alexa-app');
const request = require('request');
const url = require('url');

// -------------
// Globals
// -------------

const APP_NAME = 'ldvp-alexa';

const INTENT_RECEIVER_TURN_OFF = 'LDVPReceiverTurnOffIntent';
const INTENT_RECEIVER_TURN_ON = 'LDVPReceiverTurnOnIntent';
const INTENT_RECEIVER_SET_VOLUME_TO = 'LDVPReceiverSetVolumeToIntent';
const INTENT_RECEIVER_SET_INPUT_TO = 'LDVPReceiverSetInputIntent';

const UTTERANCES = {
	[INTENT_RECEIVER_TURN_OFF]: [
		'{auschalten|auszuschalten|auf aus}',
		'schalte receiver {aus|ab}',
	],
	[INTENT_RECEIVER_TURN_ON]: [
		'{einschalten|anschalten}',
		'schalte receiver {an|ein}'
	],
	[INTENT_RECEIVER_SET_VOLUME_TO]: [
		'{setze|stelle} lautstärke {auf|zu} {-|VOLUME_LEVEL}',
		'lautstärke {-|VOLUME_LEVEL}'
	],
	[INTENT_RECEIVER_SET_INPUT_TO]: [
		'{setze|stelle} {eingang|input} {auf|zu} {-|INPUTS}',
		'{eingang|input} {-|INPUTS}'
	]
};

const SLOTS = {
	[INTENT_RECEIVER_TURN_OFF]: [],
	[INTENT_RECEIVER_TURN_ON]: [],
	[INTENT_RECEIVER_SET_VOLUME_TO]: {
		'VOLUME_LEVEL': 'AMAZON.NUMBER'
	},
	[INTENT_RECEIVER_SET_INPUT_TO]: {
		'INPUTS': 'INPUT'
	}
};

function _getSlots(intent) { return SLOTS[intent] || {}; }
function _getUtterance(intent) { return UTTERANCES[intent] || []; }
function _getIntentOpts(intent) { return { 'slots': _getSlots(intent), 'utterances': _getUtterance(intent) }; }

// -------------
// Init
// -------------

const HOST =	process.env.LDVP_HOST;
const USERNAME = process.env.LDVP_USERNAME;
const PASSWORD = process.env.LDVP_PASSWORD;


if (!(HOST && USERNAME && PASSWORD)) {
	console.error('Required environment variables: LDVP_HOST, LDVP_USERNAME, LDVP_PASSWORD');
	return;
}

var app = new Alexa.app(APP_NAME);

// -------------
// Events
// -------------

// LaunchRequest

/*
app.launch(function(req, res) {

});
*/

// SessionEndRequest

/*
app.sessionEnded(function(req, res) {

});
*/

// -------------
// Intents
// -------------

// Intent: LDVPReceiverTurnOffIntent

app.intent(INTENT_RECEIVER_TURN_OFF, _getIntentOpts(INTENT_RECEIVER_TURN_OFF), function (request, response) {
	_sendRequest('GET', '/receiver/poweroff', {}, function (err, _, body) {
		if (err) {
			response.say("Fehler").send();
		}
		if (body.message) {
			response.say(body.message).send();
		}
	});
	return false;
});

// Intent: LDVPReceiverTurnOnIntent

app.intent(INTENT_RECEIVER_TURN_ON, _getIntentOpts(INTENT_RECEIVER_TURN_ON), function (request, response) {
	_sendRequest('GET', '/receiver/poweron', {}, function (err, _, body) {
		if (err) {
			response.say("Fehler").send();
		}
		if (body.message) {
			response.say(body.message).send();
		}
	});
	return false;
});

// Intent: LDVPReceiverSetVolumeToIntent

app.intent(INTENT_RECEIVER_SET_VOLUME_TO, _getIntentOpts(INTENT_RECEIVER_SET_VOLUME_TO), function (request, response) {
	const volumeLevel = request.slot('VOLUME_LEVEL');
	_sendRequest('GET', '/receiver/setVolumeTo/' + volumeLevel, {}, function (err, res, body) {
		if (err) {
			response.say("Fehler").send();
		}
		if (body.message) {
			response.say(body.message).send();
		}
	});
	return false;
});

// Intent: LDVPReceiverSetInputIntent

app.intent(INTENT_RECEIVER_SET_INPUT_TO, _getIntentOpts(INTENT_RECEIVER_SET_INPUT_TO), function (request, response) {
	const input = request.slot('INPUT');
	_sendRequest('GET', '/receiver/setInputTo/' + input, {}, function (err, res, body) {
		if (err) {
			response.say("Fehler").send();
		}
		if (body.message) {
			response.say(body.message).send();
		}
	});
	return false;
});

// -------------
// Helpers
// -------------

function _sendRequest(method, path, payload, callback) {

	var requestOpts = {
		method: method || 'GET',
		url: url.resolve(HOST, path),
		headers: {
			'Content-type': 'application/json'
		},
		/*
		qs: {
			'time': +new Date()
		}
		*/
	};

	if (USERNAME && PASSWORD) {
		requestOpts.headers.Authorization = 'Basic ' + new Buffer(USERNAME + ':' + PASSWORD).toString('base64');
	}

	if (payload) {
		requestOpts.json = payload;
	}

	console.log('Sending request: ', JSON.stringify(requestOpts));

	request(requestOpts, callback);
}

module.exports = app;