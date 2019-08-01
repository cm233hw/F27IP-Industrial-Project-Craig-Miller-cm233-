// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * File contains functions used to find package version history and push up to
 * database.
 * More detail on individual functions given below.
*/
// Used to connect express to mongodb (environment variables defined in .env file)
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Functions used to process package information to send to database
 */
const shell = require('shelljs');

/**
 * Schemas for database collections of package_1, packag_2 & package_3
 * TODO: Generalise schema models (using function)
 */
const Package3Schema = require('./models/package_model');
const Package2Schema = require('./models/package_model');
const Package1Schema = require('./models/package_model');

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Determines update type.
 *
 * Determines type of update by checking for test (alpha) builds then by
 * checking for right-most non-zero value.
 *
 * @param {String}	currentVersion	String containing current version number
 * @return {String}					Type of update major | minor | patch | test
 */
function versionUpdateType(currentVersion) {
	// Splits version number into array
	// check if currentVersion is a string
	if (typeof currentVersion === 'string') {
		const currentVersionArray = currentVersion.split('.');
		if (currentVersionArray[2] === undefined) {
			return 'Invalid version number';
		}
		if (currentVersionArray[2].includes('alpha')) {
			return 'test';
		} if (currentVersionArray[2] !== '0') {
			return 'patch';
		} if (currentVersionArray[1] !== '0') {
			return 'minor';
		} if (currentVersionArray[0] > currentVersionArray[1]) {
			return 'major';
		}
	} return 'Invalid version number';
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Parses date and time from timestamp.
 *
 * Splits timestamp and processes part to produce date and time of a release as a string.
 *
 * @param {String}	releaseTimeStamp	Timestamp containing date and time of release
 * @return {String}						String containing the formatted date and time of release
 */
function versionDateAndTime(releaseTimeStamp) {
	if (typeof releaseTimeStamp === 'string') {
		const timeSplit = releaseTimeStamp.split('T');
		const dateSplit = timeSplit[0].split('-');
		if (dateSplit[0].length === 4 && dateSplit[1].length === 2 && dateSplit[2].length === 2) {
			const date = new Date(releaseTimeStamp);
			const day = date.getUTCDate() > 9 ? date.getUTCDate() : `0${date.getUTCDate()}`;
			const month = date.getUTCMonth() + 1 > 9 ? date.getUTCMonth() + 1 : `0${date.getUTCMonth() + 1}`;
			const year = date.getUTCFullYear();
			const hour = date.getUTCHours() > 9 ? date.getUTCHours() : `0${date.getUTCHours()}`;
			const minutes = date.getUTCMinutes() > 9 ? date.getUTCMinutes() : `0${date.getUTCMinutes()}`;
			const formattedDate = `${day}/${month}/${year} ${hour}:${minutes}`;
			return formattedDate;
		}
	}
	return 'Incorrect date format';
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Reformats yarn info output into useful format
 *
 * Changes output from yarn info into useful and readable format for further processing
 *
 * @param {String} packageName	The package name to get yarn info details from
 * @return {Array} 				An array of string of remorted output from yarn info
 */
function reformatYarnInfoOutput(packageName) {
	// Executes 'yarn info' on package name
	const npmHistory = shell.exec(`yarn info ${packageName} time -json`, { silent: true }).stdout;
	const npmHistoryString = JSON.stringify(npmHistory);
	const npmHistoryArr = npmHistoryString.split(',');

	const dataArr = [];

	// Cleans and reformats output into array of strings
	for (let i = 0; i < npmHistoryArr.length; i += 1) {
		if (i === 0 || i === 2) {
			continue;
		}
		const cleanString = npmHistoryArr[i].replace(/'|{|}|\\n|"|\\|\s/gi, '');
		dataArr.push(cleanString);
	}

	return dataArr;
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Turns array of strings into json object
 *
 * Takes dataArr from yarnInfoReformat and changes into json object
 *
 * @param {Array} dataArr	Array of strings containing cleaned yarn info output
 * @return {Object}			JSON object containing version history of a package name
 */
function createJsonData(dataArr) {
	let versionType;
	let releaseDate;
	const versionHistory = {
		versions: [],
	};

	for (let i = 0; i < dataArr.length; i += 1) {
		if (i === 0) {
			versionType = '';
		} else {
			versionType = versionUpdateType(dataArr[i].split(/:(.+)/)[0]);
		}

		releaseDate = versionDateAndTime(dataArr[i].split(/:(.+)/)[1]);

		const versionHistoryObj = {
			version: dataArr[i].split(/:(.+)/)[0],
			releasedate: releaseDate,
			type: versionType,
		};

		versionHistory.versions.push(versionHistoryObj);
	}

	return versionHistory;
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Creates JSON data for an arrow packages version history
 *
 * @param	packageName {String} Name of arrow package to get version history
 * @returns				{Object} JSON data of packages version history
 */
function packageHistory(packageName) {
	try {
		if (typeof packageName !== 'string') {
			throw new Error('packageName must be a string');
		} else if (!(packageName === 'package_1' || packageName === 'package_2' || packageName === 'package_3')) {
			throw new Error('packageName must be one of the following pru packages: package_1, package_2 or package_3');
		} else {
			const packageArr = reformatYarnInfoOutput(`pru/${packageName}`);
			return createJsonData(packageArr);
		}
	} catch (err) {
		return err;
	}
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Following three functions push array of package data to relevant collection in database
 * TODO: Properly generalise these functions
 *
 * Takes a JSON object parameter from packageHistory and pushes array of this data into database
 */
function package1Data(package1Json) {
	const newArr = [];

	for (let i = 0; i < package1Json.versions.length; i += 1) {
		const package1Stats = new Package1Schema({
			version: package1Json.versions[i].version,
			releasedate: package1Json.versions[i].releasedate,
			type: package1Json.versions[i].type,
		});

		newArr.push(package1Stats);
	}

	// Pushes array into database
	return Package1Schema.insertMany(newArr).then(() => {
		console.log('package_1 collection uploaded');
	});
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

function package2Data(package2Json) {
	const newArr = [];

	for (let i = 0; i < package2Json.versions.length; i += 1) {
		const package2Stats = new Package2Schema({
			version: package2Json.versions[i].version,
			releasedate: package2Json.versions[i].releasedate,
			type: package2Json.versions[i].type,
		});

		newArr.push(package2Stats);
	}

	// Pushes array into database
	return Package2Schema.insertMany(newArr).then(() => {
		console.log('package_2 collection uploaded');
	});
}

function package3Data(package3Json) {
	const newArr = [];

	for (let i = 0; i < package3Json.versions.length; i += 1) {
		const package3Stats = new Package3Schema({
			version: package3Json.versions[i].version,
			releasedate: package3Json.versions[i].releasedate,
			type: package3Json.versions[i].type,
		});

		newArr.push(package3Stats);
	}

	// Pushes array into database
	return Package3Schema.insertMany(newArr).then(() => {
		console.log('package_3 collection uploaded');
	});
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Deletes current collection for each package then reinserts all up-to-date data during manually
 * run script.
 * This function is called during a manual script that can be run as a yarn command.
 */
function manualRefresh() {
	const package3Promise = new Promise((resolve, reject) => Package3Schema.deleteMany((err) => {
		if (err) {
			console.error('Error deleting package_3 collection: ', err);
			reject(err);
		} else {
			console.log('package_3 collection cleared');
			package3Data(packageHistory('package_3'))
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		}
	}));
	// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

	const package2Promise = new Promise((resolve, reject) => Package2Schema.deleteMany((err) => {
		if (err) {
			console.error('Error deleting package_2 collection: ', err);
			reject(err);
		} else {
			console.log('package_2 collection cleared');
			package2Data(packageHistory('package_2'))
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		}
	}));

	const package1Promise = new Promise((resolve, reject) => Package1Schema.deleteMany((err) => {
		if (err) {
			console.error('Error deleting package_1 collection: ', err);
			reject(err);
		} else {
			console.log('Components collection cleared');
			package1Data(packageHistory('package_1'))
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		}
	}));

	// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
	Promise.all([
		package3Promise,
		package2Promise,
		package1Promise,
	]).then(() => {
		mongoose.disconnect();
	});
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * Connects to database after which the database collections are refreshed during a cron-job
 * in db-conn.js.
 * This is called as part of manual script to refresh databases if neccesary.
 */
function updateFunction() {
	mongoose.Promise = global.Promise;

	mongoose.connect(`${process.env.COSMOSDB_CONNSTR}?ssl=true&replicaSet=globaldb`, {
		auth: {
			user: process.env.COSMOSDB_USER,
			password: process.env.COSMOSDB_PASSWORD,
		},
		useNewUrlParser: true,
	})
		.then(() => {
			console.log('Connection to CosmosDB successful during manual update');
			manualRefresh();
		})
		.catch(err => console.error(`Can not connect to the database: ${err}`));
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
/**
 * This function is ran by cron job in server.js to automatically update database.
 */
function refreshDatabases() {
	Package3Schema.deleteMany((err) => {
		if (err) {
			console.error('Error deleting package_3 collection: ', err);
		} else {
			console.log('package_3 collection cleared');
			package3Data(packageHistory('package_3'));
		}
	});

	Package2Schema.deleteMany((err) => {
		if (err) {
			console.error('Error deleting package_2 collection: ', err);
		} else {
			console.log('package_2 collection cleared');
			package2Data(packageHistory('package_2'));
		}
	});

	Package1Schema.deleteMany((err) => {
		if (err) {
			console.error('Error deleting package_1 collection: ', err);
		} else {
			console.log('package_1 collection cleared');
			package1Data(packageHistory('package_1'));
		}
	});
}
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL

module.exports = {
	versionUpdateType,
	versionDateAndTime,
	package1Data,
	package2Data,
	package3Data,
	manualRefresh,
	packageHistory,
	refreshDatabases,
	updateFunction,
};
// All ASSETS AND CODE ARE COPYRIGHT M&G PRUDENTIAL
