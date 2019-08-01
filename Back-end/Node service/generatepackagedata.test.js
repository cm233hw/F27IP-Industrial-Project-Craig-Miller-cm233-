const Package1Schema = require('../src/models/package_model');
const Package2Schema = require('../src/models/package_model');
const Package3Schema = require('../src/models/package_model');

const {
	versionUpdateType,
	versionDateAndTime,
	package1Data,
	package2Data,
	package3Data,
	manualRefresh,
	refreshDatabases,
	packageHistory,
} = require('../src/generatepackagedata');

describe('versionUpdateType tests', () => {
	test('Should return release type "patch"', () => {
		const currentVersion = '8.0.8';
		expect(versionUpdateType(currentVersion)).toBe('patch');
	});

	test('Should return release type "test"', () => {
		const currentVersion = '9.0.2-alpha.0';
		expect(versionUpdateType(currentVersion)).toBe('test');
	});

	test('Should return type "major"', () => {
		const currentVersion = '8.0.0';
		expect(versionUpdateType(currentVersion)).toBe('major');
	});

	test('Should return type "minor"', () => {
		const currentVersion = '8.1.0';
		expect(versionUpdateType(currentVersion)).toBe('minor');
	});

	test('Should return "Invalid version number"', () => {
		const numbers = 67890;
		expect(versionUpdateType(numbers)).toBe('Invalid version number');

		const stringOfNumbers = '67890';
		expect(versionUpdateType(stringOfNumbers)).toBe('Invalid version number');

		const stringOfNumbersAndLetters = '23j7u8i9';
		expect(versionUpdateType(stringOfNumbersAndLetters)).toBe('Invalid version number');

		const stringOfNumbersAndLettersCharacters = '^8)3j7%u8i9';
		expect(versionUpdateType(stringOfNumbersAndLettersCharacters)).toBe('Invalid version number');
	});
});

describe('versionDateAndTime', () => {
	test('Should return DD/MM/YYYY HH:MM', () => {
		const releaseTimeStamp = '2019-04-17T09:19:39.434Z';
		expect(versionDateAndTime(releaseTimeStamp)).toBe('17/04/2019 09:19');
	});

	test('Should return "Incorrect date format"', () => {
		const numbers = 98765;
		expect(versionDateAndTime(numbers)).toBe('Incorrect date format');

		const string = '345hgv5t6yu7i8';
		expect(versionDateAndTime(string)).toBe('Incorrect date format');
	});
});

describe('packageHistory tests', () => {
	test('Should return createJsonData() containing an array of package_1 objects and match data', () => {
		const package1 = 'package_1';
		const packageHistoryArray = packageHistory(package1).versions;
		expect(Array.isArray(packageHistoryArray)).toEqual(true);
		packageHistoryArray.forEach((packageObject) => {
			expect(typeof packageObject).toEqual('object');
			expect(Object.keys(packageObject).sort()).toEqual([
				'releasedate',
				'type',
				'version',
			]);
			expect(typeof packageObject.releasedate).toEqual('string');
			expect(typeof packageObject.type).toEqual('string');
			expect(typeof packageObject.version).toEqual('string');
		});
	});
	test('Should return createJsonData() containing an array of package_2 objects and match data', () => {
		const package2 = 'package_2';
		const packageHistoryArray = packageHistory(package2).versions;

		expect(Array.isArray(packageHistoryArray)).toEqual(true);

		packageHistoryArray.forEach((packageObject) => {
			expect(typeof packageObject).toEqual('object');
			expect(Object.keys(packageObject).sort()).toEqual([
				'releasedate',
				'type',
				'version',
			]);
			expect(typeof packageObject.releasedate).toEqual('string');
			expect(typeof packageObject.type).toEqual('string');
			expect(typeof packageObject.version).toEqual('string');
		});
	});
	test('Should return createJsonData() containing an array of package_3 objects and match data', () => {
		const package3 = 'package_3';
		const packageHistoryArray = packageHistory(package3).versions;
		expect(Array.isArray(packageHistoryArray)).toEqual(true);
		packageHistoryArray.forEach((packageObject) => {			// test an object is present
			expect(typeof packageObject).toEqual('object');
			expect(Object.keys(packageObject).sort()).toEqual([
				'releasedate',
				'type',
				'version',
			]);
			expect(typeof packageObject.releasedate).toEqual('string');
			expect(typeof packageObject.type).toEqual('string');
			expect(typeof packageObject.version).toEqual('string');
		});
	});
	test('Should return "packageName must be a string"', () => {
		const incorrectPackage = 9873;
		expect(packageHistory(incorrectPackage)).toEqual(new Error('packageName must be a string'));
	});

	test('Should return "packageName must be one of the following package_1, package_2, package_3"', () => {
		const incorrectPackage = 'wealth';
		expect(packageHistory(incorrectPackage)).toEqual(new Error('packageName must be one of the following package_1, package_2, package_3'));
	});
});

describe('package1Data test', () => {
	test('Should return package_1 model', async () => {
		const package1History = packageHistory('package_1');
		const package1Model = new Package1Schema();
		package1Data(package1History).then((data) => {
			expect(data).toBe(package1Model);
		});
	});
});

describe('package2Data test', () => {
	test('Should return package_2 model', async () => {
		const package2History = packageHistory('package_2');
		const package2Model = new Package2Schema();
		package2Data(package2History).then((data) => {
			expect(data).toBe(package2Model);
		});
	});
});

describe('package3Data test', () => {
	test('Should return package_3 model', async () => {
		const package3History = packageHistory('package_3');
		const package3Model = new Package3Schema();
		package3Data(package3History).then((data) => {
			expect(data).toBe(package3Model);
		});
	});
});

describe('refreshDatabases test', () => {
	test('console.log', async () => {
		console.log = jest.fn();
		expect(console.log).toHaveBeenCalledTimes(0);
		Package1Schema.deleteMany = jest.fn(cb => cb(false));
		Package2Schema.deleteMany = jest.fn(cb => cb(false));
		Package3Schema.deleteMany = jest.fn(cb => cb(false));
		await refreshDatabases();

		jest.spyOn(console, 'log');
		expect(console.log).toHaveBeenCalledTimes(3);
		expect(console.log.mock.calls[0][0]).toBe('package_1 collection cleared');
		expect(console.log.mock.calls[1][0]).toBe('package_2 collection cleared');
		expect(console.log.mock.calls[2][0]).toBe('package_3 collection cleared');
	});

	test('console.error', async () => {
		console.error = jest.fn();
		expect(console.error).toHaveBeenCalledTimes(0);
		Package1Schema.deleteMany = jest.fn(cb => cb(true));
		Package2Schema.deleteMany = jest.fn(cb => cb(true));
		Package3Schema.deleteMany = jest.fn(cb => cb(true));
		await refreshDatabases();
		expect(console.error).toHaveBeenCalledTimes(3);

		jest.spyOn(console, 'error');
		expect(console.error.mock.calls[0][0]).toBe(
			'Error deleting package_3 collection: ',
		);
		expect(console.error.mock.calls[1][0]).toBe(
			'Error deleting package_2 collection: ',
		);
		expect(console.error.mock.calls[2][0]).toBe(
			'Error deleting package_1 collection: ',
		);
	});
});

describe('manualRefresh test', () => {
	test('console.log', async () => {
		console.log = jest.fn();
		expect(console.log).toHaveBeenCalledTimes(0);
		Package1Schema.deleteMany = jest.fn(cb => cb(false));
		Package2Schema.deleteMany = jest.fn(cb => cb(false));
		Package3Schema.deleteMany = jest.fn(cb => cb(false));
		await manualRefresh();
		expect(console.log).toHaveBeenCalledTimes(3);

		jest.spyOn(console, 'error');
		expect(console.log.mock.calls[0][0]).toBe('package_3 collection cleared');
		expect(console.log.mock.calls[1][0]).toBe('package_2 collection cleared');
		expect(console.log.mock.calls[2][0]).toBe('package_1 collection cleared');
	});
	test('console.error', async () => {
		console.error = jest.fn();
		expect(console.error).toHaveBeenCalledTimes(0);
		Package1Schema.deleteMany = jest.fn(cb => cb(true));
		Package2Schema.deleteMany = jest.fn(cb => cb(true));
		Package3Schema.deleteMany = jest.fn(cb => cb(true));
		await manualRefresh();
		expect(console.error).toHaveBeenCalledTimes(3);

		jest.spyOn(console, 'error');
		expect(console.error.mock.calls[0][0]).toBe(
			'Error deleting package_3 collection: ',
		);
		expect(console.error.mock.calls[1][0]).toBe(
			'Error deleting package_2 collection: ',
		);
		expect(console.error.mock.calls[2][0]).toBe(
			'Error deleting package_1 collection: ',
		);
	});
});
