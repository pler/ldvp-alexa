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

const UTTERANCES = {
	[INTENT_RECEIVER_TURN_OFF]: [],
	[INTENT_RECEIVER_TURN_ON]: [],
	[INTENT_RECEIVER_SET_VOLUME_TO]: [
		'setze lautstärke auf {-|VOLUME_LEVEL}'
	]
};


const SLOTS = {
	[INTENT_RECEIVER_TURN_OFF]: [],
	[INTENT_RECEIVER_TURN_ON]: [],
	[INTENT_RECEIVER_SET_VOLUME_TO]: {
			'VOLUME_LEVEL': 'AMAZON.NUMBER'
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
	_sendRequest('GET', '/receiver/poweroff', {}, _expect([200], function (err, _, body) {
		if (err) {
			console.error(err);
			response.say("fehler").send();
			return;
		}
		console.log(body);
		response.say("fertig").send();
	}));
	return false;
});

// Intent: LDVPReceiverTurnOnIntent

app.intent(INTENT_RECEIVER_TURN_ON, _getIntentOpts(INTENT_RECEIVER_TURN_ON), function (request, response) {
	_sendRequest('GET', '/receiver/poweron', {}, _expect([200], function (err, _, body) {
		if (err) {
			console.error(err);
			response.say("fehler").send();
			return;
		}
		console.log(body);
		response.say("fertig").send();
	}));
	return false;
});

// Intent: LDVPReceiverSetVolumeToIntent

app.intent(INTENT_RECEIVER_SET_VOLUME_TO, _getIntentOpts(INTENT_RECEIVER_SET_VOLUME_TO), function (request, response) {
	_sendRequest('GET', '/receiver/setVolumeTo/' + request.slot('VOLUME_LEVEL'), {}, _expect([200], function (err, _, body) {
		if (err) {
			console.error(err);
			response.say("fehler").send();
			return;
		}
		console.log(body);
		response.say("fertig").send();
	}));
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

function _expect(expectedStatusCodes, callback) {
	return function (err, res, body) {
		if (err) {
			return callback(err);
		} else if (expectedStatusCodes.indexOf(res.statusCode) === -1) {
			return callback(new Error('Unexpected status code: ' + res.statusCode + ', expected: ' + expectedStatusCodes));
		}
		return callback(null, res, body);
	};
}

module.exports = app;