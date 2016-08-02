'use strict';

const API_KEY = 'dcf18309abd54d42bd5260faf5517b2f';

var cp     = require('child_process'),
	should = require('should'),
    fs = require('fs'),
	service;

describe('Service', function () {
	this.slow(5000);

	after('terminate child process', function (done) {
        this.timeout(15000);
        setTimeout(() => {
            service.kill('SIGKILL');
            done();
        }, 10000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(service = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			service.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			service.send({
				type: 'ready',
				data: {
					options: {
						api_key: API_KEY
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should process the data and send back a result', function (done) {
            this.timeout(10000);
			var requestId = (new Date()).getTime().toString();

			service.on('message', function (message) {
				if (message.type === 'result') {
					var data = JSON.parse(message.data);

					should.equal(data[0].candidates.length, 1, 'Invalid return data.');
					done();
				}
			});

            fs.readFile('./test/test.jpg', function (readFileError, data) {
                should.ifError(readFileError);

                service.send({
                    type: 'data',
                    requestId: requestId,
                    data: {
                        image: new Buffer(data).toString('base64'),
                        personGroupId: 'group1'
                    }
                }, function (dataSendError) {
                    should.ifError(dataSendError);
                });
            });
		});
	});
});