const mongoose = require('mongoose');
const dbConn = require('../src/db-conn');

describe('Test mongodb connection', () => {
	test('should log stating Connection to CosmosDB successful', async () => {
		console.log = jest.fn();

		const catchObj = {
			catch: () => false,
		};

		const then = {
			then: (cb) => {
				cb();
				return catchObj;
			},
		};

		const implementation = () => then;
		mongoose.connect = jest.fn(implementation);

		await dbConn.isConnected();

		expect(console.log).toHaveBeenCalledWith(
			'Connection to CosmosDB successful',
		);
	});

	test('should log stating Can not connect to the database', async () => {
		console.error = jest.fn();

		const catchObj = {
			catch: cb => cb('error message'),
		};

		const then = {
			then: () => catchObj,
		};

		const implementation = () => then;
		mongoose.connect = jest.fn(implementation);

		await dbConn.isConnected();

		expect(console.error).toHaveBeenCalledWith(
			'Can not connect to the database: error message',
		);
	});
});
