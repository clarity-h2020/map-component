/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

// OMG: Need to duplicate tests, since we cannot export  them

import axios from 'axios';
import log from 'loglevel';

// required because of https://github.com/clarity-h2020/simple-table-component/issues/4#issuecomment-595114163
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import { CSISRemoteHelpers, CSISHelpers } from 'csis-helpers-js';

import apiResponseStudy from './../__fixtures__/study.json';

log.enableAll();

/**
 * Set auth headers for live API test
 */
beforeAll(async (done) => {
	// required because of https://github.com/clarity-h2020/map-component/issues/43#issuecomment-595621339
	axios.defaults.adapter = require('axios/lib/adapters/http');
	
	jest.setTimeout(60000);
	let cookie = process.env.COOKIE;

	if (process.env.ORIGIN) {
		CSISRemoteHelpers.csisClient.defaults.headers.common['Origin'] = process.env.Origin;
	}

	//axios.defaults.withCredentials = true;
	if (process.env.CSIS_USERNAME && process.env.CSIS_PASSWORD) {
		try {
			const apiResponse = await CSISRemoteHelpers.login(
				'https://csis.myclimateservice.eu',
				process.env.CSIS_USERNAME,
				process.env.CSIS_PASSWORD
			);
			// Unfortunately, this does not work!
			// See https://github.com/axios/axios/issues/295#issuecomment-381485257
			if (
				apiResponse.headers['set-cookie'] &&
				Array.isArray(apiResponse.headers['set-cookie']) &&
				apiResponse.headers['set-cookie'].length > 0
			) {
				cookie = apiResponse.headers['set-cookie'][0];
				log.debug(`login cookie retrieved: ${cookie}`);
			} else {
				log.warn(
					'login with credentials from process.env.CSIS_USERNAME && process.env.CSIS_PASSWORD failed, please check file .env.test.local'
				);
			}
		} catch (error) {
			log.error('login to remote CSIS API failed', error);
		}
	}

	if (cookie) {
		log.info('cookie available, executing remote API tests');
		// this will fail when a new instance of axios has been created in CSISRemoteHelpers
		// because the instance is created with the *previous* defaults! :o
		//axios.defaults.headers.common[header[0]] = header[1];

		// therefore we change the instance in CSISRemoteHelpers :o
		CSISRemoteHelpers.csisClient.defaults.headers.common['Cookie'] = cookie;
	} else {
		log.warn('no headers ENV VAR (.env.test.local) found, skipping remote API tests');
	}
	done();
});

afterAll(() => {
	//delete axios.defaults.withCredentials;
	delete CSISRemoteHelpers.csisClient.defaults.headers.common[axios.defaults.xsrfHeaderName];
	if ((process.env.CSIS_USERNAME && process.env.CSIS_PASSWORD) || (process.env.COOKIE && process.env.ORIGIN)) {
		delete CSISRemoteHelpers.csisClient.defaults.headers.common['Cookie'];
		delete CSISRemoteHelpers.csisClient.defaults.headers.common['Origin'];
	}

	jest.setTimeout(5000);
});

describe('Remote API tests without authentication', () => {
	test('get and compare X-CSRF Token', async (done) => {
		expect.assertions(1);
		const token1 = await CSISRemoteHelpers.getXCsrfToken();
		const token2 = await CSISRemoteHelpers.getXCsrfToken();
		// if not logged in by session cookie, token will be different for each request
		if (
			(!process.env.COOKIE || !process.env.ORIGIN) &&
			(!process.env.CSIS_USERNAME || !process.env.CSIS_PASSWORD)
		) {
			expect(token1).not.toEqual(token2);
		} else {
			expect(token1).toEqual(token2);
		}
		done();
	});
});

describe('Remote API tests with authentication', () => {
	if ((!process.env.COOKIE || !process.env.ORIGIN) && (!process.env.CSIS_USERNAME || !process.env.CSIS_PASSWORD)) {
		it.only('no headers.js fixture found, skipping remote API tests', () => {
			log.warn('no headers.js fixture found, skipping remote API tests');
		});
	}

	it('[DEV] test get EMIKAT Credentials', async (done) => {
		const emikatCredentials = await CSISRemoteHelpers.getEmikatCredentialsFromCsis();
		expect.assertions(2);
		expect(emikatCredentials).toBeDefined();
		expect(emikatCredentials).not.toBeNull();
		done();
	});

	it.only('[DEV] test get complete Study', async (done) => {
		const studyGroupNode = await CSISRemoteHelpers.getStudyGroupNodeFromCsis(
			undefined,
			'c3609e3e-f80f-482b-9e9f-3a26226a6859'
		);
		expect.assertions(9);
		expect(studyGroupNode).toBeDefined();
		expect(studyGroupNode).not.toBeNull();
		expect(studyGroupNode.data).not.toBeNull();
		expect(studyGroupNode.data.id).toBeDefined();
		expect(apiResponseStudy).toBeDefined();
		expect(apiResponseStudy).not.toBeNull();
		expect(apiResponseStudy.data).not.toBeNull();
		expect(apiResponseStudy.data.id).toBeDefined();
		expect(apiResponseStudy.data.id).toEqual(studyGroupNode.data.id);
		done();
	});

	it('[DEV] test get datapackage resources for eu-gl:hazard-characterization', async (done) => {
		const resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(
			undefined,
			'a8ff7930-4a9f-4289-8246-3383ba13c30f'
		);

		expect.assertions(6);

		expect(resourcesApiResponse).toBeDefined();
		expect(resourcesApiResponse).not.toBeNull();
		expect(resourcesApiResponse.data).not.toBeNull();
		expect(resourcesApiResponse.included).not.toBeNull();

		const filteredResources = CSISHelpers.filterResourcesByEuglId(
			resourcesApiResponse.data,
			resourcesApiResponse.included,
			'eu-gl:hazard-characterization'
		);

		log.info(`filteredResources: ${filteredResources.length}`);

		expect(filteredResources).not.toBeNull();
		expect(filteredResources.length).toBeGreaterThan(0);

		done();
	});
});
