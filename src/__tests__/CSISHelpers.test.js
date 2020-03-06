/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

import axios from 'axios';
import log from 'loglevel';
import express from 'express';

// required because of https://github.com/clarity-h2020/simple-table-component/issues/4#issuecomment-595114163
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import { CSISHelpers } from 'csis-helpers-js';
import apiResponseStudy from './../__fixtures__/study.json';
import apiResponseDataPackage from './../__fixtures__/dataPackage.json';
import apiResponseResources from './../__fixtures__/resources.json';
import studyArea from './../__fixtures__/studyArea.json';

const app = express();
var server;

beforeAll(() => {
	// required because of https://github.com/clarity-h2020/map-component/issues/43#issuecomment-595621339
	axios.defaults.adapter = require('axios/lib/adapters/http');
	
	app.get('/jsonapi/group/study', function(req, res) {
		res.json(apiResponseStudy);
	});

	// https://csis.myclimateservice.eu/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=c3609e3e-f80f-482b-9e9f-3a26226a6859');
	app.get('/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f/field_resources', function(req, res) {
		res.json(apiResponseStudy);
	});

	// https://csis.myclimateservice.eu/jsonapi/group/study/c3609e3e-f80f-482b-9e9f-3a26226a6859/field_data_package
	// https://csis.myclimateservice.eu/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f
	app.get('/jsonapi/group/study/c3609e3e-f80f-482b-9e9f-3a26226a6859/field_data_package', function(req, res) {
		res.json(apiResponseDataPackage);
	});

	// https://csis.myclimateservice.eu/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f/field_resources?resourceVersion=id%3A270&include=field_resource_tags,field_map_view,field_references,field_analysis_context.field_field_eu_gl_methodology,field_analysis_context.field_hazard
	app.get('/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f/field_resources', function(req, res) {
		res.json(apiResponseResources);
	});

	// this is just unbelievable: log.debug() is not printed  to console when running the tests in VSCode. WTF?!
	server = app.listen(0, () => log.debug(`Example app listening on http://${server.address().address}:${server.address().port}`));
	log.debug(`Example app listening on http://${server.address().address}:${server.address().port}`);
});

test('test extract study area from study json', async (done) => {
	
	// does not work if bound d to ipv6 adaress. :-()
	// const url = `http://${server.address().address}:${server.address().port}/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=c3609e3e-f80f-482b-9e9f-3a26226a6859`;
	const url = `http://localhost:${server.address().port}/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=c3609e3e-f80f-482b-9e9f-3a26226a6859`;
	// unbelievable: does not print to console. See https://github.com/facebook/jest/issues/2441
	log.info(url);
	const response = await axios.get(url);
	// -> error 400 ?! This used to work  with a fixed  port. since simple things like logging don't seem
	// to be possible with jest, and debugging tests in vscode works only 50% of the time, we disable this test.

	expect.assertions(5);
	expect(response).toBeDefined();
	expect(response.data).toBeDefined();
	expect(response.data.data).toBeDefined();
	expect(response.data.data[0]).not.toBeNull();

	const studyAreaJson = CSISHelpers.extractStudyAreaFromStudyGroupNode(response.data.data);
	expect(studyAreaJson).toEqual(studyArea);
	done();
});

test('find HC LE resources in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization - Local Effects';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName);
	expect(filteredResources).toHaveLength(18);
});

test('find HC resources in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName);
	expect(filteredResources).toHaveLength(10);
});

test('find resources with @mapview:ogc:wms references in resource array', () => {
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = CSISHelpers.filterResourcesbyReferenceType(resourcesArray, includedArray, referenceType);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	expect(filteredResources).toHaveLength(30);
});

test('find HC resources with @mapview:ogc:wms references in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;

	const filteredResources = CSISHelpers.filterResourcesbyReferenceType(
		CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName),
		includedArray,
		referenceType
	);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	//expect(filteredResources).toHaveLength(30);
});

test('get taxonomy_term--hazards tags from resources ', () => {
	const tagType = 'taxonomy_term--hazards';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	/**
     * @type{Set}
     */
	const distinctTags = new Set();

	expect(resourcesArray).not.toBeNull();
	expect(resourcesArray.length).toBeGreaterThan(0);
	resourcesArray.map((resource) => {
		const tags = CSISHelpers.extractTagsfromResource(resource, includedArray, tagType);
		if (tags) {
			tags.map((tag) => {
				distinctTags.add(tag);
			});
		}
	});

	expect(distinctTags.size).toBeGreaterThan(0);
	distinctTags.forEach((tag) => {
		log.debug(`found distinct tag $tag.attributes.name in $resourcesArray.length`);
	});
});

test('get 1st "reference" for first HC resource with @mapview:ogc:wms references in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;

	const filteredResources = CSISHelpers.filterResourcesbyReferenceType(
		CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName),
		includedArray,
		referenceType
	);
	expect(filteredResources).not.toBeNull();
	expect(filteredResources.length).toBeGreaterThan(0);
	const reference = CSISHelpers.extractReferencesfromResource(filteredResources[0], includedArray, referenceType);
	expect(reference).not.toBeNull();
	expect(reference.length).toBeGreaterThan(0);

	//expect(filteredResources).toHaveLength(30);
});

test('check for emikat id in study', () => {
	const emikatId = CSISHelpers.extractEmikatIdFromStudyGroupNode(apiResponseStudy.data);
	expect(emikatId).toEqual(2846);
});

afterAll(() => {
	log.debug('afterAll');
	if(server) {
		server.close(() => {
			//console.log('JSON Server closed');
			//process.exit(0);
		});
	} else {
		// WTF?!!!!
		// https://github.com/clarity-h2020/map-component/issues/43#issuecomment-595637179

		// unfortunely, we'll never see this because of  https://github.com/facebook/jest/issues/2441
		log.warn('server undefined');
	}
});
