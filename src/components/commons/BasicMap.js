import React from 'react';
import PropTypes from 'prop-types';
import turf from 'turf';
import Wkt from 'wicket';
import queryString from 'query-string';
import log from 'loglevel';
import { CSISRemoteHelpers, CSISHelpers } from 'csis-helpers-js';

import logo from './../../logo.svg';
import './../../App.css';

log.enableAll();

/**
 * This is the basic class of all map classes. 
 * It implements the common way to extract the overlay layers from the study. 
 * Why is it called map? I fact it's a wrapper component for a wrapper component that wraps a leaflet map. :o
 * 
 * 
 * TODO: transform to functional component. See https://github.com/clarity-h2020/simple-table-component
 * Complete redesign is necessary.
 */
export default class BasicMap extends React.Component {
	constructor(props) {
		super(props);
		this.initialBounds = this.props.initialBounds ? this.props.initialBounds : [[72, 55], [30, -30]];

		// We still use 'class' properties instead of *immutable* React 'props' -> pure functional component
		this.backgroundLayersTagType = 'taxonomy_term--dp_resourcetype';
		this.backgroundLayersTagName = 'background-layer';
		this.backgroundLayersGroupName = 'Backgrounds';

		this.clarityBackgroundLayersTagType = 'taxonomy_term--dp_resourcetype';
		this.clarityBackgroundLayersTagName = 'clarity-background-layer';
		this.clarityBackgroundLayersGroupName = 'CLARITY Backgrounds';

		// default **filter** criteria for overlay layers
		this.overlayLayersTagType = 'taxonomy_term--eu_gl';
		/**
		 * This correponds to props.mapSelectionId
		 * Example: 'eu-gl:hazard-characterization'
		 */
		this.overlayLayersTagName = undefined; // this means all resources

		// default **grouping** criteria for overlay layers
		/**
		 *  this corresponds to queryParams.grouping_tag and props.groupingCriteria
		 *  e.g. 'taxonomy_term--hazards'
		 */
		this.overlayLayersGroupingTagType = undefined;
		this.overlayLayersGroupName = 'Default'; //default group name

		/**
     * Base Layers
     * 
     * FIXME: Attribution not shown!
     * 
     * @type {Object[]}
     */
		this.baseLayers = this.props.baseLayers
			? this.props.baseLayers
			: [
				{
					name: 'WorldTopoMap',
					title: 'World Topo Map',
					url:
						'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
					attribution:
						'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
						'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
				},
				{
					name: 'OpenStreetMap',
					title: 'OpenStreetMap',
					url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					attribution:
						'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
						'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
				},
				{
					name: 'OpenTopoMap',
					title: 'Open Topo Map',
					url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
				}
			];

		// FIXME: write_permissions as query param?! OMFG!

		/**
     * Query params extracted from CSIS Helpers. See /examples and /fixtures/csisHelpers.json
     */
		this.queryParams = { ...CSISHelpers.defaultQueryParams };

		// we need also the setters and getters introduced for backwards capability.
		// this.queryParams = Object.create(Object.getPrototypeOf(CSISHelpers.defaultQueryParams), Object.getOwnPropertyDescriptors(CSISHelpers.defaultQueryParams)) ; <- does not work

		if (this.props.location && this.props.location.search) {
			// copy and extend queryParams using spread operator :o
			this.queryParams = { ...this.queryParams, ...queryString.parse(this.props.location.search) };
		} else {
			log.warn('no query parameters found, showing empty map!');
		}

		/**
     * The protocol that is used by the server. The protocol of the server is https://, but for local testing it can be changed to http://
     * @deprecated
     */
		this.protocol = 'https://';

		// TODO: Support for different reference types?!
		this.referenceType = '@mapview:ogc:wms';

		this.clarityBackgroundLayersTagType = this.queryParams.clarityBackgroundLayersTagType ? this.queryParams.clarityBackgroundLayersTagType : this.clarityBackgroundLayersTagType;
		this.clarityBackgroundLayersTagName = this.queryParams.clarityBackgroundLayersTagName ? this.queryParams.clarityBackgroundLayersTagName : this.clarityBackgroundLayersTagName;
		this.clarityBackgroundLayersGroupName = this.queryParams.clarityBackgroundLayersGroupName ? this.queryParams.clarityBackgroundLayersGroupName : this.clarityBackgroundLayersGroupName;
		this.overlayLayersGroupName = this.queryParams.overlayLayersGroupName ? this.queryParams.overlayLayersGroupName : this.overlayLayersGroupName;

		this.overlayLayersTagType = this.queryParams.overlayLayersTagType ? this.queryParams.overlayLayersTagType : this.overlayLayersTagType;
		// its defined by the sub-type, child classes override mapSelectionId props, e.g. 'eu-gl:hazard-characterization' for HC Map
		this.overlayLayersTagName = this.queryParams.overlayLayersTagName ? this.queryParams.overlayLayersTagName : props.mapSelectionId;
		// grouping_tag query params overwrites the grouping criteria set by the child class in this.props!
		// if we use child.groupingCriteria = x it will override queryParams, therefore we put them in class variable this.overlayLayersGroupingTagType

		this.overlayLayersGroupingTagType = this.queryParams.overlayLayersGroupingTagType ? this.queryParams.overlayLayersGroupingTagType
			: (this.queryParams.grouping_tag ? this.queryParams.grouping_tag : props.groupingCriteria); //e.g. taxonomy_term--eu_gl

		// Actually, this parameters are not used anymore! For data package and resource we use study_area as initial bbox
		// Yeah, that's inconsistent and not correct, but we reuse this query param since we don't want to re-implement
		// handling of initial bbox just because the data model contains rubbish. :-/
		// See https://github.com/clarity-h2020/map-component/issues/53
		this.initialBounds[0][0] = this.queryParams.minx;
		this.initialBounds[0][1] = this.queryParams.miny;
		this.initialBounds[1][0] = this.queryParams.maxx;
		this.initialBounds[1][1] = this.queryParams.maxy;

		log.info(
			`creating new ${props.mapSelectionId} map with layer group from ${this
				.overlayLayersGroupingTagType} and initial bbox ${this.queryParams.study_area}`
		);
	}

	/**
   * Main work is done here. 
   * 
   * For standalone use, e.g.
   * http://localhost:3000//?url=https://csis.myclimateservice.eu&study_id=c3609e3e-f80f-482b-9e9f-3a26226a6859
   * 
   */
	async componentDidMount() {
		let studyApiResponse = undefined;
		let resourcesApiResponse = undefined;

		// apply the study area
		if (this.queryParams.study_area) {
			try {
				const studyArea = new Wkt.Wkt();
				studyArea.read(this.queryParams.study_area);
				const studyAreaJson = studyArea.toJson();
				this.applyStudyAreaGeometry(studyAreaJson);
			} catch (error) {
				log.error(error);
				// if faulty coordinates submitted, try to lod them from study area
				this.queryParams.study_area = undefined;
			}
		} else if (!this.queryParams.study_area && this.queryParams.study_uuid) {
			log.warn(
				`no study area submitted via query params, trying to load it from API for study $this.queryParams.study_uuid`
			);
			studyApiResponse = await CSISRemoteHelpers.getStudyGroupNodeFromCsis(
				this.queryParams.host,
				this.queryParams.study_uuid
			);
			const studyArea = CSISHelpers.extractStudyAreaFromStudyGroupNode(studyApiResponse.data);
			this.applyStudyAreaGeometry(studyArea);
		} else {
			log.warn(`no study_area nor study_uuid submitted via query params, cannot set study area bbox`);
		}

		// load and process the resources to generate the overlay layers for the leaflet map
		if (this.queryParams.resource_uuid) {
			log.debug(`loading resource ${this.queryParams.resource_uuid}`);
			resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourceFromCsis(
				this.queryParams.host,
				this.queryParams.resource_uuid
			);
		} else if (this.queryParams.datapackage_uuid) {
			log.debug(`loading data package ${this.queryParams.datapackage_uuid}`);
			resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(
				this.queryParams.host,
				this.queryParams.datapackage_uuid
			);
		} else if (this.queryParams.study_uuid) {
			log.warn(
				`no datapackage_uuid or resource_uuid submitted via query params, trying to load it from API for study ${this
					.queryParams.study_uuid}`
			);
			if (!studyApiResponse) {
				studyApiResponse = await CSISRemoteHelpers.getStudyGroupNodeFromCsis(
					this.queryParams.host,
					this.queryParams.study_uuid
				);
			}
			if (
				studyApiResponse &&
				studyApiResponse.data &&
				studyApiResponse.data.relationships &&
				studyApiResponse.data.relationships.field_data_package &&
				studyApiResponse.data.relationships.field_data_package.data
			) {
				this.queryParams.datapackage_uuid = studyApiResponse.data.relationships.field_data_package.data.id;
				resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(
					this.queryParams.host,
					this.queryParams.datapackage_uuid
				);
			} else {
				log.error(
					`no data package associated with study ${this.queryParams.study_uuid}, cannot load resources!`
				);
			}
		} else {
			log.error(
				`no study_uuid nor datapackage_uuid nor resource_uuid submitted via query params, cannot load addtional resource layers`
			);
		}

		if (resourcesApiResponse && resourcesApiResponse.data && resourcesApiResponse.included) {
			const leafletMapModel = this.processResources(
				resourcesApiResponse,
				this.overlayLayersTagName,
				this.overlayLayersGroupingTagType,
				this.referenceType
			);
			if (leafletMapModel.length > 0) {
				this.applyLeafletMapModel(leafletMapModel);
			}
		} else {
			log.warn(`cannot load additional resource layers`);
		}
	}

	/**
   * Add the given study area to the map
   * 
   * @param {Object} studyAreaGeometry the geometry of the study area
   */
	applyStudyAreaGeometry(studyAreaGeometry) {
		if (studyAreaGeometry != null) {
			var studyArea = {
				type: 'Feature',
				properties: {
					popupContent: 'study',
					style: {
						weight: 2,
						color: 'black',
						opacity: 0.3,
						fillColor: '#ff0000',
						fillOpacity: 0.1
					}
				},
				geometry: studyAreaGeometry
			};
			this.setState({
				studyAreaPolygon: null
			});
			this.setState({
				studyAreaPolygon: studyArea,
				bounds: this.getBoundsFromArea(studyAreaGeometry)
			});
		}
	}

	/**
	 * Set 'exclusive' groups and add the given overlay layers to the state
	 *  
	 * FIXME: split method, externalize layer generation part
	 * 
	 * @param {Array} mapData the overlay layers
	 * @param {Number} resourceLength the resource count of the current study
	 * @deprecated
	 */
	applyLeafletMapModel(leafletMapModel) {
		if (leafletMapModel && leafletMapModel.length > 0) {
			this.setState({
				overlays: leafletMapModel,
				loading: false,
				exclusiveGroups: this.extractExclusiveGroups(leafletMapModel)
			});
		} else {
			log.error('no leafletMapModel set, cannot show addtional layers');
		}
	}

	/**
   * Creates an array of Leaflet Layer definitions from one CSIS Resource Meta Data item.
   * 
   * **ACCIDENTAL-COMPLEXITY-ALERT:** There are now **three** ways for generating multiple layer from one (atomic!) resource.
   * 
   * @param {Object} resource 
   * @param {Object[]} includedArray 
   * @param {String} referenceType 
   * @param {String} defaultGroupName 
   * @param {String} groupingTagType 
   * @param {Boolean} expandTemplateResources 
   * @return {Object[]}
   */
	createLeafletLayers(
		resource,
		includedArray,
		referenceType,
		defaultGroupName,
		groupingTagType,
		expandTemplateResources = false
	) {
		const resourceReferences = CSISHelpers.extractReferencesFromResource(resource, includedArray, referenceType);
		const leafletLayers = [];
		const prepareLayer = function (url, title) {
			// process URL will add the query parameters for Variables.
			// Unfortunately, ATM it uses this.queryParams. So resource expansion (e.g. submitting **two** time_periods via query params) is not easily possible).
			// See also https://github.com/clarity-h2020/map-component/issues/74
			const layerUrl = this.processUrl(resource, includedArray, url);
			const groupTitle = this.extractGroupName(groupingTagType, defaultGroupName, resource, includedArray);
			const leafletLayer = this.createLeafletLayer(groupTitle, title, layerUrl);
			return leafletLayer;
		}.bind(this); // yes, need to bind to this.

		// Create separate Layers for each Reference?
		if (resourceReferences.length > 1) {
			log.info(
				`processing  ${resourceReferences.length} ${referenceType} references in resource ${resource.attributes
					.title}`
			);
		} else if (resourceReferences.length === 0) {
			log.error(`expected ${referenceType} reference in resource ${resource.attributes.title}`);
			return leafletLayers;
		}

		resourceReferences.forEach((resourceReference, referenceIndex) => {
			// INCOHERENCE-ALERT: use the reference title instead of the resource title, if there are more than one references.
			/**
			 * @type {String}
			 */
			let title = resourceReferences.length > 1 ? resourceReference.attributes.title : resource.attributes.title;

			// ACCIDENTAL-COMPLEXITY-ALERT: another workaround caused by incoherent usage of predefined entity properties like title, name, etc.
			// the title is automatically is set the value of referenceType by Drupal, if not it is not explicitly set. Makes sense. NOT.
			if (title.indexOf(referenceType) === 0) {
				log.warn(
					`title of reference #${referenceIndex} not explicitely set, using attribute title instead. Check resource ${resource
						.attributes.title}.`
				);
				title = resource.attributes.title;
			}

			let uri = resourceReference.attributes.field_reference_path;

			// @deprecated: This "strongly demanded feature" has become unnecessary now. It didn't make any sense in the first place, tough.
			// now we have to decide whether this resource is a template resource and whether it should be expanded.
			// WARNING: This expands also all references :o
			if (expandTemplateResources === true) {
				const parametersMaps = CSISHelpers.parametersMapsFromTemplateResource(resource, includedArray);
				if (parametersMaps.length > 0) {
					parametersMaps.forEach((parametersMap, parametersMapIndex) => {
						// PITFALL ALERT: map.size vs. array.length
						if (parametersMap.size > 0) {
							const expandedUrl = CSISHelpers.addUrlParameters(uri, parametersMap);
							title += ' [';
							// FIXME: just value or value + key?
							parametersMap.forEach((value) => {
								title += value + ', ';
							});
							title = title.slice(0, -2) + ']';
							const leafletLayer = prepareLayer(expandedUrl, title);
							if (leafletLayer && leafletLayer !== null) {
								leafletLayers.push(leafletLayer);
							}
							log.debug(`resource ${resource.attributes.title} expanded to ${title} = ${expandedUrl}`);
						} else {
							log.warn(
								`resource ${resource.attributes
									.title} NOT expanded due to empty parameters map at index ${parametersMapIndex}`
							);

							// WARNING: We add the layer anyway.
							const leafletLayer = prepareLayer(uri, title);
							if (leafletLayer && leafletLayer !== null) {
								leafletLayers.push(leafletLayer);
							}
						}
					});
				} else {
					log.warn(`resource ${resource.attributes.title} NOT expanded due to empty parameters maps`);
					// does it make sense to push the unexpanded layer?
					const leafletLayer = prepareLayer(uri, title);
					if (leafletLayer && leafletLayer !== null) {
						leafletLayers.push(leafletLayer);
					}
				}
			} else {
				const leafletLayer = prepareLayer(uri, title);
				if (leafletLayer && leafletLayer !== null) {
					leafletLayers.push(leafletLayer);
				}
			}
		});

		return leafletLayers;
	}

	/**
	 * Creat a single leaflet layer from a resource.
	 * 
	 * @param {String} groupTitle 
	 * @param {String} layerTitle 
	 * @param {String} layerUrl 
	 * @return {Object}
	 */
	createLeafletLayer(groupTitle, layerTitle, layerUrl) {
		var leafletLayer = {};
		leafletLayer.checked = false;
		leafletLayer.groupTitle = groupTitle;
		leafletLayer.name = this.titleToName(layerTitle);
		leafletLayer.title = layerTitle;
		leafletLayer.layers = this.extractLayers(layerUrl.toString());
		leafletLayer.url = this.extractUrl(layerUrl.toString());
		leafletLayer.style = this.extractStyle(layerUrl.toString());

		// TODO: #54
		// If no variables can be set, we currently remove the layer until #54 is implemented
		if (leafletLayer.url.indexOf('$') === -1) {
			return leafletLayer;
		} else {
			log.warn(
				`layer ${leafletLayer.name} not added! URL contains unprocessed $EMIKAT variables: \n${leafletLayer.url}`
			);
		}

		return null;
	}

	/**
	 * Extract the group name for the layer selection control
	 * 
	 * @param {*} groupingTagType 
	 * @param {*} defaultGroupName 
	 * @param {*} resource 
	 * @param {*} includedArray 
	 */
	extractGroupName(groupingTagType, defaultGroupName, resource, includedArray) {
		// FIXME: Dangerous, if multiple values for tagType
		let groupTags = null;
		let groupTitle = defaultGroupName;
		if (groupingTagType && groupingTagType != null) {
			groupTags = CSISHelpers.extractTagsfromResource(resource, includedArray, groupingTagType);
		}
		if (groupTags != null && groupTags.length > 0) {
			groupTitle = groupTags[0].attributes.name;
			if (groupTags.length > 1) {
				log.warn(
					`${groupTags.length} ${groupingTagType} tags in resource ${resource.attributes
						.title}, using only 1st tag ${groupTags[0].attributes.name} as group title for layer ${resource
							.attributes.title}`
				);
			}
		} else {
			log.warn(`no ${groupingTagType} tag found in resource ${resource.attributes.title}, using default group name`);
		}
		return groupTitle;
	}

	/**
	 * Main difference between background layers and overlay layers is the possbility 
	 * for single / multiple selection.
	 * 
	 * See https://github.com/clarity-h2020/map-component/issues/84
	 * 
	 * @param {*} resourceArray 
	 * @param {*} includedArray 
	 * @param {*} referenceType 
	 * @param {*} backgroundLayersTagName 
	 * @param {*} backgroundLayersGroupName 
	 * @deprecated
	 */
	createLeafletMapModel(
		resourceArray,
		includedArray,
		referenceType,
		layersTagType,
		layersTagName,
		layersGroupName,
		groupingTagType,
		expandTemplateResources
	) {
		// FIXME: Define separate tag type for background layers
		let leafletMapModel = [];

		let filteredResources;
		if (layersTagName) {
			filteredResources = CSISHelpers.filterResourcesByReferenceType(
				CSISHelpers.filterResourcesbyTagName(resourceArray, includedArray, layersTagType, layersTagName),
				includedArray,
				referenceType
			);
		} else {
			// layersTagName is undefined, so we process all resources.
			filteredResources = CSISHelpers.filterResourcesByReferenceType(
				resourceArray,
				includedArray,
				referenceType
			);
		}
		log.info(
			`${filteredResources.length} valid layers for ${layersTagType} = ${layersTagName} with ${referenceType} references found in ${resourceArray.length} available resources.`
		);

		// 1st process the resources
		// FIXME: ~~expandTemplateResources currently ony supported for Backgrounds Layers~~ DISABLED!
		// See https://github.com/clarity-h2020/map-component/issues/69#issuecomment-558206120

		// WARNING: Even for Backgrounds Layers, expandTemplateResources should not be used! :-(
		// See https://github.com/clarity-h2020/map-component/issues/72
		for (let i = 0; i < filteredResources.length; ++i) {
			let leafletLayers = this.createLeafletLayers(
				filteredResources[i],
				includedArray,
				referenceType,
				layersGroupName,
				groupingTagType,
				expandTemplateResources
			);
			if (leafletLayers.length > 0) {
				leafletMapModel.push(...leafletLayers);
			}
		}
		return leafletMapModel;
	}

	/**
   * Extracts the layers from the given RESOURCES array and add it to the map.
   * Sorts it into categories according to flexible categorisation tags
   * See 
   * 
   * FIXME: externalize, eventually merge with finishMapExtraction()
   * 
   * @param {Object} resourcesApiResponse the resources API response
   * @param {String} overlayLayersTagType usually the eu-gl taxonomy
   * @param {String} overlayLayersTagName the eu-gl step of the layers, which should be added. E.g. eu-gl:risk-and-impact-assessment 
   * @param {String} groupingTagType the grouping criteria of the layers. E.g. taxonomy_term--hazards
   * @return {Object[]} leafletMapModel internal map model
   */
	processResources(resourcesApiResponse) {
		// if we requested a single resource with getDatapackageResourceFromCsis(), put it into an array.
		const resourceArray = Array.isArray(resourcesApiResponse.data)
			? resourcesApiResponse.data
			: [resourcesApiResponse.data];
		const includedArray = resourcesApiResponse.included;

		log.debug(
			`process ${resourceArray.length} resources and ${includedArray.length} included objects for ${this.referenceType} reference type`
		);

		const leafletMapModel = [];

		/**
		 * The Background layers, e.g. Vector Layers Urban Atlas Roads from Local Effects Input Layers
		 */
		let backgroundLayers = this.createLeafletMapModel(
			resourceArray,
			includedArray,
			this.referenceType,
			this.backgroundLayersTagType,
			this.backgroundLayersTagName,
			this.backgroundLayersGroupName,
			undefined,
			false);
		if (backgroundLayers && backgroundLayers.length > 0) {
			log.info(
				`${backgroundLayers.length} valid background Layers for ${this.backgroundLayersTagType} = ${this.backgroundLayersTagName} with ${this.referenceType} references found in ${resourceArray.length} available resources`
			);
			leafletMapModel.push(...backgroundLayers);
		} else {
			log.warn(`NO valid background Layers for ${this.backgroundLayersTagType} = ${this.backgroundLayersTagName} with ${this.referenceType} references found in ${resourceArray.length} available resources`);
		}

		/**
		 * The CLARITY Background layers, e.g. Vector Layers Urban Atlas Roads from Local Effects Input Layers
		 */
		let clarityBackgroundLayers = this.createLeafletMapModel(
			resourceArray,
			includedArray,
			this.referenceType,
			this.clarityBackgroundLayersTagType,
			this.clarityBackgroundLayersTagName,
			this.clarityBackgroundLayersGroupName,
			undefined,
			false);
		if (clarityBackgroundLayers && clarityBackgroundLayers.length > 0) {
			log.info(
				`${clarityBackgroundLayers.length} valid CLARITY background Layers for ${this.clarityBackgroundLayersTagType} = ${this.clarityBackgroundLayersTagName} with ${this.referenceType} references found in ${resourceArray.length} available resources`
			);
			leafletMapModel.push(...clarityBackgroundLayers);
		} else {
			log.warn(`NO valid CLARITY background Layers for ${this.clarityBackgroundLayersTagType} = ${this.clarityBackgroundLayersTagName} with ${this.referenceType} references found in ${resourceArray.length} available resources`);
		}

		/**
		 * The Overlay layers, e.g. Hazard Raster Layers
		 */
		let overlayLayers = this.createLeafletMapModel(
			resourceArray,
			includedArray,
			this.referenceType,
			this.overlayLayersTagType,
			this.overlayLayersTagName,
			this.overlayLayersGroupName,
			this.overlayLayersGroupingTagType,
			false);
		if (overlayLayers && overlayLayers.length > 0) {
			log.info(
				`${overlayLayers.length} valid overlay Layers for ${this.overlayLayersTagType} = ${this.overlayLayersTagName} with ${this.referenceType} references found in ${resourceArray.length} available resources`
			);
			leafletMapModel.push(...overlayLayers);
		} else {
			log.warn(`NO valid CLARITY overlay Layers for ${this.overlayLayersTagType} = ${this.overlayLayersTagName} with ${this.referenceType} references found in ${resourceArray.length} available resources`);
		}

		// Sort by name ...
		leafletMapModel.sort(function (a, b) {
			if (a.name < b.name) {
				return -1;
			} else if (a.name > b.name) {
				return 1;
			} else {
				return 0;
			}
		});
		// ... and then by group.
		leafletMapModel.sort(function (a, b) {
			if (a.groupTitle < b.groupTitle) {
				return -1;
			} else if (a.groupTitle > b.groupTitle) {
				return 1;
			} else {
				return 0;
			}
		});

		// Disabled by request. See #81
		/*
		if (leafletMapModel.length > 0) {
			leafletMapModel[0].checked = true;
		}*/

		return leafletMapModel;
	}

	/**
   * Method can be overridden in subclasses to support custom behaviour.
   * 
   * FIXME: externalize, use callback method instead!
   * 
   * @param {Object} resource 
   * @param {Object} includedArray 
   * @param {String} url 
   * @return String
   */
	processUrl(resource, includedArray, url) {
		// the whole "variable meaning mess" (https://github.com/clarity-h2020/csis/issues/101#issuecomment-565025875) is hidden in this method:
		const parametersMap = CSISHelpers.generateParametersMap(
			CSISHelpers.QUERY_PARAMS,
			this.queryParams,
			resource,
			includedArray
		);
		return CSISHelpers.addUrlParameters(url, parametersMap);
	}

	/**
   * Drupal JSON API 'deeply' includes objects, e.g. &include=field_references are provided only once in a separate array name 'included'.
   * This method resolves the references and extracts the included  object.
   * 
   * FIXME: Remove! Replace all occurrences with  CSISHelpers.getIncludedObject!
   * 
   * @deprecated
   */
	getIncludedObject(type, id, includedArray) {
		return CSISHelpers.getIncludedObject(type, id, includedArray);
	}

	/**
   * Extract the groups from the given overlay layers
   * 
   * FIXME: externalize method! Use a Set!
   * ExclusiveGroups?! -> https://github.com/ismyrnow/leaflet-groupedlayercontrol#leaflet-groupedlayercontrol
   * 
   * @param {Array} mapData 
   * @returns an array with all group names
   * @deprecated
   */
	extractExclusiveGroups(mapData) {
		var groups = [];
		for (var i = 0; i < mapData.length; ++i) {
			let groupTitle = mapData[i].groupTitle;
			// FIXME: use constant for group names
			if (
				!groups.includes(groupTitle) && groupTitle !== this.backgroundLayersGroupName && groupTitle !== this.clarityBackgroundLayersGroupName
			) {
				groups.push(groupTitle);
			}
		}

		return groups;
	}

	/**
   * Replace spaces, because spaces are not allowed in leaflet layer names
   * :-(
   * 
   * @param {String} title 
   */
	titleToName(title) {
		return title.replace(' ', '_');
	}

	/**
   * Extracts the layer name from the given wms GetMap request
   * 
   * @param {String} url a get MapRequest
   */
	extractLayers(url) {
		var layerParamName = 'layers=';
		var layerParam = url.substring(url.toLowerCase().indexOf(layerParamName) + layerParamName.length);
		return layerParam.indexOf('&') !== -1 ? layerParam.substring(0, layerParam.indexOf('&')) : layerParam;
	}

	/**
   * Extracts the style name from the given wms GetMap request
   * 
   * @param {String} url a get MapRequest
   */
	extractStyle(url) {
		var styleParamName = 'styles=';
		if (url !== null && url.toLowerCase().indexOf(styleParamName) !== -1) {
			var styleParam = url.substring(url.toLowerCase().indexOf(styleParamName) + styleParamName.length);
			return styleParam.indexOf('&') !== -1 ? styleParam.substring(0, styleParam.indexOf('&')) : styleParam;
		} else {
			return null;
		}
	}

	/**
   * Returns the given url without parameters
   * FIXME: use queryString.parse() !
   *  
   * @param {String} url 
   */
	extractUrl(url) {
		//remove the parameters, which will be set by leaflet
		var parameterList = [
			'request',
			'version',
			'service',
			'layers',
			'bbox',
			'width',
			'height',
			'srs',
			'crs',
			'format',
			'styles',
			'transparent',
			'bgcolor',
			'exceptions'
		];
		var baseUrl = url.indexOf('?') !== -1 ? url.substring(0, url.indexOf('?')) : url;

		if (url.indexOf('?') !== -1) {
			/**
       * The parameters part of the URL
       * @deprecated use queryString.parse() instead!
       * @type String
       */
			var urlParameters = url.substring(url.indexOf('?'));

			for (var index = 0; index < parameterList.length; ++index) {
				/**
         * e.g. 'request'
         */
				var parameter = parameterList[index];

				// automatically generated parameter from  parameterList found in URL ..
				if (urlParameters.toLowerCase().indexOf(parameter) !== -1) {
					// ???
					var lastUrlPart = urlParameters.substring(urlParameters.toLowerCase().indexOf(parameter));

					urlParameters = urlParameters.substring(0, urlParameters.toLowerCase().indexOf(parameter));

					if (lastUrlPart.indexOf('&') !== -1) {
						urlParameters = urlParameters + lastUrlPart.substring(lastUrlPart.indexOf('&') + 1);
					}
				}
			}

			return baseUrl + urlParameters;
		} else {
			return baseUrl;
		}
	}

	/**
   * Returns the bounding box of the given polygon geometry
   * 
   * @param {Object} area 
   */
	getBoundsFromArea(area) {
		const bboxArray = turf.bbox(area);
		const corner1 = [bboxArray[1], bboxArray[0]];
		const corner2 = [bboxArray[3], bboxArray[2]];
		var bounds = [corner1, corner2];

		return bounds;
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Map Component not initilaised correctly</h2>
					<p>
						Query Parametes, e.g. <i>study_id</i> missing!
					</p>
				</header>
			</div>
		);
	}
}

/**
 * Prop Types. 
 * FIXME: replace by query params
 */
BasicMap.propTypes = {
	/**
	 * deprecated
	 */
	match: PropTypes.object,
	location: PropTypes.any,
	/**
   * ~ mapType, e.g. 'eu-gl:risk-and-impact-assessment' = Taxonomy Term
   */

	mapSelectionId: PropTypes.string,
	/**
   * Taxonomy for Layer Groups, e.g. 'taxonomy_term--hazards'
   */
	groupingCriteria: PropTypes.string
};

/**
 * Default props. ATM pretty useless. 
 * Redesign to functional component pending.
 */
BasicMap.defaultProps = {
	mapSelectionId: undefined,
	groupingCriteria: undefined
};
