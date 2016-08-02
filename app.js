'use strict';

const FACE_DETECT_ENDPOINT = 'https://api.projectoxford.ai/face/v1.0/detect',
    FACE_IDENTIFY_ENDPOINT= 'https://api.projectoxford.ai/face/v1.0/identify';

var platform = require('./platform'),
    isEmpty = require('lodash.isempty'),
    isPlainObject = require('lodash.isplainobject'),
    request = require('request'),
    get = require('lodash.get'),
	config;

platform.on('data', function (requestId, data) {
    if (!isPlainObject(data)) {
        platform.sendResult(requestId, null);
        return platform.handleException(new Error(`Invalid data received. Must be a valid JSON Object. Data: ${data}`));
    }

    if (isEmpty(data) || isEmpty(data.image)) {
        platform.sendResult(requestId, null);
        return platform.handleException(new Error('Invalid data received. Data must have a base64 encoded image field.'));
    }

    if(isEmpty(data.personGroupId)) {
        platform.sendResult(requestId, null);
        return platform.handleException(new Error('Invalid data received. Data must have personGroupId field.'));
    }

    request.post({
        url: FACE_DETECT_ENDPOINT,
        qs: {
            returnFaceId: true,
            returnFaceLandmarks: false,
            returnFaceAttributes: 'age,gender,headPose,smile,facialHair,glasses'
        },
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': config.api_key
        },
        body: new Buffer(data.image, 'base64')
    }, (error, response, body) => {
        if (error || !isEmpty(get(body, 'error'))) {
            let err = error || get(body, 'error');
            console.error(err);
            platform.sendResult(requestId, null);
            return platform.handleException(err);
        }
        else{
            let faceDetectResult = JSON.parse(body);
            let faceId = get(faceDetectResult, '[0].faceId');

            request.post({
                url: FACE_IDENTIFY_ENDPOINT,
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': config.api_key
                },
                json: {
                    personGroupId: data.personGroupId,
                    faceIds:[faceId],
                    maxNumOfCandidatesReturned:1,
                    confidenceThreshold: 0.5
                }
            }, (error, response, body) => {
                if (error || !isEmpty(get(body, 'error'))) {
                    let err = error || get(body, 'error');
                    console.error(err);
                    platform.sendResult(requestId, null);
                    return platform.handleException(err);
                }

                platform.sendResult(requestId, JSON.stringify(body));
            });
        }
    });
});

platform.once('close', function () {
    platform.notifyClose();
});

platform.once('ready', function (options) {
    config = options;

	platform.notifyReady();
	platform.log('Face Identification Service has been initialized.');
});