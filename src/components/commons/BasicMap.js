import React from "react";
import PropTypes from 'prop-types';
import turf from 'turf';
import Wkt from 'wicket';
import queryString from 'query-string';
import log from 'loglevel';
import { CSISRemoteHelpers, CSISHelpers, EMIKATHelpers } from 'csis-helpers-js';

import logo from './../../logo.svg';
import './../../App.css';

log.enableAll();

/**
 * This is the basic class of all map classes. 
 * It implements the common way to extract the overlay layers from the study. 
 */
export default class BasicMap extends React.Component {
  constructor(props) {
    super(props);

    this.initialBounds = this.props.initialBounds ? this.props.initialBounds : [[72, 55], [30, -30]];

    /**
     * Base Layers
     * 
     * FIXME: Attribution not shown!
     * 
     * @type {Object[]}
     */
    this.baseLayers = this.props.baseLayers ? this.props.baseLayers : [
      {
        name: 'WorldTopoMap',
        title: 'World Topo Map',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
      },
      {
        name: 'OpenStreetMap',
        title: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
      },
      {
        name: 'OpenTopoMap',
        title: 'Open Topo Map',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
      }
    ]

    // FIXME: write_permissions as query param?! OMFG!

    /**
     * Query params extracted from CSIS Helpers. See /examples and /fixtures/csisHelpers.json
     */
    this.queryParams = { ...CSISHelpers.defaultQueryParams };

    if (this.props.location && this.props.location.search) {
      // copy and extend queryParams using spread operator :o
      this.queryParams = { ...this.queryParams, ...queryString.parse(this.props.location.search) }
    } else {
      log.warn('no query parameters found, showing empty map!')
    }

    /**
     * The protocol that is used by the server. The protocol of the server is https://, but for local testing it can be changed to http://
     * @deprecated
     */
    this.protocol = 'https://';

    // TODO: Support for different reference types?!
    this.referenceType = '@mapview:ogc:wms';
    // grouping_tag query params overwrites the grouping criteria set by the child class in this.props!
    // if we use child.groupingCriteria =M x ist will override queryParams, therefore we put them in props
    this.groupingCriteria = this.queryParams.grouping_tag ? this.queryParams.grouping_tag : props.groupingCriteria; //e.g. taxonomy_term--eu_gl
    this.mapType = props.mapSelectionId;

    // Actually, this parameters are not used anymore! For data package and resource we use study_area as initial bbox
    // Yeah, that's inconsistent and not correct, but we reuse this query param since we don't want to re-implement 
    // handling of initial bbox just because the data model contains rubbish. :-/
    // See https://github.com/clarity-h2020/map-component/issues/53
    this.initialBounds[0][0] = this.queryParams.minx;
    this.initialBounds[0][1] = this.queryParams.miny;
    this.initialBounds[1][0] = this.queryParams.maxx;
    this.initialBounds[1][1] = this.queryParams.maxy;

    log.info(`creating new ${props.mapSelectionId} map with layer group from ${this.groupingCriteria} and initial bbox ${this.queryParams.study_area}`);
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
      log.warn(`no study area submitted via query params, trying to load it from API for study $this.queryParams.study_uuid`);
      studyApiResponse = await CSISRemoteHelpers.getStudyGroupNodeFromCsis(this.queryParams.host, this.queryParams.study_uuid);
      const studyArea = CSISHelpers.extractStudyAreaFromStudyGroupNode(studyApiResponse.data);
      this.applyStudyAreaGeometry(studyArea);
    } else {
      log.warn(`no study_area nor study_uuid submitted via query params, cannot set study area bbox`);
    }

    // load and process the resources to generate the overlay layers for the leaflet map
    if (this.queryParams.resource_uuid) {
      log.debug(`loading resource ${this.queryParams.resource_uuid}`);
      resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourceFromCsis(this.queryParams.host, this.queryParams.resource_uuid);
    } else if (this.queryParams.datapackage_uuid) {
      log.debug(`loading data package ${this.queryParams.datapackage_uuid}`);
      resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(this.queryParams.host, this.queryParams.datapackage_uuid);
    } else if (this.queryParams.study_uuid) {
      log.warn(`no datapackage_uuid or resource_uuid submitted via query params, trying to load it from API for study ${this.queryParams.study_uuid}`);
      if (!studyApiResponse) {
        studyApiResponse = await CSISRemoteHelpers.getStudyGroupNodeFromCsis(this.queryParams.host, this.queryParams.study_uuid);
      }
      if (studyApiResponse && studyApiResponse.data && studyApiResponse.data.relationships
        && studyApiResponse.data.relationships.field_data_package && studyApiResponse.data.relationships.field_data_package.data) {
        this.queryParams.datapackage_uuid = studyApiResponse.data.relationships.field_data_package.data.id;
        resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(this.queryParams.host, this.queryParams.datapackage_uuid);
      } else {
        log.error(`no data package associated with study ${this.queryParams.study_uuid}, cannot load resources!`);
      }
    } else {
      log.error(`no study_uuid nor datapackage_uuid nor resource_uuid submitted via query params, cannot load addtional resource layers`);
    }

    if (resourcesApiResponse && resourcesApiResponse.data && resourcesApiResponse.included) {
      const leafletMapModel = this.processResources(resourcesApiResponse, this.mapType, this.groupingCriteria, this.referenceType)
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
        "type": "Feature",
        "properties": {
          "popupContent": "study",
          "style": {
            weight: 2,
            color: "black",
            opacity: 0.3,
            fillColor: "#ff0000",
            fillOpacity: 0.1
          }
        },
        "geometry": studyAreaGeometry
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
 * Add the given overlay layers to the state
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
        exclusiveGroups: this.extractGroups(leafletMapModel)
      });
    } else {
      log.error('no leafletMapModel set, cannot shoe addtional layers');
    }
  }

  /**
   * Extracts the layers from the given RESOURCES array and add it to the map 
   * 
   * FIXME: externalize, eventually merge with finishMapExtraction()
   * 
   * @param {Object} resourcesApiResponse the resources API response
   * @param {String} mapType the eu-gl step of the layers, which should be added. E.g. eu-gl:risk-and-impact-assessment 
   * @param {String} groupingCriteria the grouping criteria of the layers. E.g. taxonomy_term--hazards
   * @return {Object[]}
   */
  processResources(resourcesApiResponse, mapType, groupingCriteria, referenceType) {
    // if we requested a single resource, with getDatapackageResourceFromCsis() add put it onto an array.
    const resourceArray = Array.isArray(resourcesApiResponse.data) ? resourcesApiResponse.data : [resourcesApiResponse.data];
    const includedArray = resourcesApiResponse.included;

    log.debug(`process ${resourceArray.length} resources and 
    ${includedArray.length} included  object for ${mapType} map, ${groupingCriteria} group type and ${referenceType} reference type`);

    var leafletMapModel = [];
    let filteredResources;

    if (mapType) {
      filteredResources = CSISHelpers.filterResourcesbyReferenceType(
        CSISHelpers.filterResourcesByEuglId(resourceArray, includedArray, mapType),
        includedArray,
        referenceType);
    } else {
      filteredResources = CSISHelpers.filterResourcesbyReferenceType(
        resourceArray, includedArray, referenceType);
    }

    log.info(`${filteredResources.length} valid resources for  ${mapType} map type with ${referenceType} references found in ${resourceArray.length} available resources`);

    for (var i = 0; i < filteredResources.length; ++i) {
      const resource = filteredResources[i];
      const resourceReferences = CSISHelpers.extractReferencesfromResource(resource, includedArray, referenceType);
      if (resourceReferences.length > 1) {
        log.warn(`${resourceReferences.length} ${referenceType} references in resource ${resource.attributes.title}, using only 1st reference ${resourceReferences[0].attributes.field_reference_path}`);
      } else if (resourceReferences.length === 0) {
        log.error(`expected ${referenceType} reference in resource ${resource.attributes.title}`);
      }

      const layerUrl = this.processUrl(resource, resourceReferences[0].attributes.field_reference_path);
      const tagType = groupingCriteria;
      const tags = CSISHelpers.extractTagsfromResource(resource, includedArray, tagType);
      let groupTitle = 'Default';

      if (tags != null && tags.length > 0) {
        groupTitle = tags[0].attributes.name;
        if (tags.length > 1) {
          log.warn(`${tags.length} ${tagType} tags in resource ${resource.attributes.title}, using only 1st tag ${tags[0].attributes.name} as group title for layer ${resource.attributes.title}`);
        }
      } else {
        log.warn(`no ${tagType} tag found in resource ${resource.attributes.title}, using default group name`);
      }

      var leafletLayer = {};
      leafletLayer.checked = false;
      leafletLayer.groupTitle = groupTitle;
      leafletLayer.name = this.titleToName(resource.attributes.title);
      leafletLayer.title = resource.attributes.title;
      leafletLayer.layers = this.extractLayers(layerUrl.toString());
      leafletLayer.url = this.extractUrl(layerUrl.toString());
      leafletLayer.style = this.extractStyle(layerUrl.toString());
      
      // TODO: #54
      // If no variables can be set, we currently remove the layer until #54 is implemented
      if (leafletLayer.url.indexOf('$') === -1) {
        leafletMapModel.push(leafletLayer);
        log.debug('layer #' + i + ': ' + leafletLayer.groupTitle + '/' + leafletLayer.title + ' added: ' + leafletLayer.url);
      } else {
        log.warn(`layer ${leafletLayer.name} not added! URL contains unprocessed $EMIKAT variables: \n${leafletLayer.url}`)
      }
    }

    leafletMapModel.sort(function (a, b) {
      if ((a == null || a.name == null) && (b == null || b.name == null)) {
        return 0;
      } else if (a == null || a.name == null) {
        return -1;
      } else if (b == null || b.name == null) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });

    if(leafletMapModel.length > 0) {
      leafletMapModel[0].checked = true;
    }

    return leafletMapModel;
  }

  /**
   * Method can be overridden in subclasses to support custom behaviour.
   * 
   * FIXME: externalize, use callback method instead!
   * 
   * @param {Object} resource 
   * @param {String} url 
   * @return String
   */
  processUrl(resource, url) {
    //return EMIKATHelpers.addEmikatId(decodeURIComponent(url), this.queryParams.emikat_id);
    const parametersMap = new Map();
    EMIKATHelpers.QUERY_PARAMS.forEach((value, key) => {
      if (this.queryParams[value]) {
        parametersMap.set(key, this.queryParams[value]);
      }
    });

    return EMIKATHelpers.addEmikatParameters(url, parametersMap);
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
   * 
   * @param {Array} mapData 
   * @returns an array with all group names
   * @deprecated
   */
  extractGroups(mapData) {
    var groups = [];
    for (var i = 0; i < mapData.length; ++i) {
      if (!groups.includes(mapData[i].groupTitle)) {
        groups.push(mapData[i].groupTitle);
      }
    }

    return groups;
  }

  /**
   * Replace spaces, because spaces are not allowed in leaflet layer names
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
    var layerParam = url.substring(url.toLowerCase().indexOf(layerParamName) + layerParamName.length)
    return (layerParam.indexOf('&') !== -1 ? layerParam.substring(0, layerParam.indexOf('&')) : layerParam);
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
      return (styleParam.indexOf('&') !== -1 ? styleParam.substring(0, styleParam.indexOf('&')) : styleParam);
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
    var parameterList = ['request', 'version', 'service', 'layers', 'bbox', 'width', 'height', 'srs', 'crs', 'format', 'styles', 'transparent', 'bgcolor', 'exceptions'];
    var baseUrl = (url.indexOf('?') !== -1 ? url.substring(0, url.indexOf('?')) : url);

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
          <p>Query Parametes, e.g. <i>study_id</i> missing!</p>
        </header>
      </div>);
  }
};

BasicMap.propTypes = {
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

}

BasicMap.defaultProps = {
  mapSelectionId: undefined,
  groupingCriteria: undefined,
};
