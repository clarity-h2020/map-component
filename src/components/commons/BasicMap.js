import React from "react";
import PropTypes from 'prop-types';
import turf from 'turf';
import Wkt from 'wicket';
import queryString from 'query-string';
import log from 'loglevel';
import { CSISRemoteHelpers, CSISHelpers, EMIKATHelpers } from 'csis-helpers-js'

/**
 * This is the basic class of all map classes. 
 * It implements the common way to extract the overlay layers from the study. 
 */
export default class BasicMap extends React.Component {
  constructor(props) {
    super(props);

    log.enableAll();

    this.queryParams = {
      "eea_city_field": undefined,
      "host": "https://csis.myclimateservice.eu",
      "resource_uuid": undefined,
      "step": undefined,
      "step_uuid": undefined,
      "study": undefined,
      "study_area": undefined,
      "study_datapackage_uuid": undefined,
      "study_emikat_id": undefined,
      "study_uuid": undefined,
      "write_permissions": undefined
    };

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
    this.groupingCriteria =  this.queryParams.grouping_tag ? this.queryParams.grouping_tag : props.groupingCriteria; //e.g. taxonomy_term--eu_gl
    this.mapType = props.mapSelectionId;


    console.log('creating new ' + props.mapSelectionId + ' map with layer group from ' + props.groupingCriteria);
  }

  /**
   * For standalone use, e.g.
   * http://localhost:3000//?url=https://csis.myclimateservice.eu&id=c3609e3e-f80f-482b-9e9f-3a26226a6859
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
      log.error(`no study_area nor study_uuid submitted via query params, cannot set study area bbox`);
    }

    // load and process the resources to generate the overlay layers for the leaflet map
    if (this.queryParams.study_datapackage_uuid) {
      resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(this.queryParams.host, this.queryParams.study_datapackage_uuid);
    } else if (this.queryParams.resource_uuid) {
      resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourceFromCsis(this.queryParams.host, this.queryParams.resource_uuid);
    } else if (this.queryParams.study_uuid) {
      log.warn(`no study_datapackage_uuid or resource_uuid submitted via query params, trying to load it from API for study $this.queryParams.study_uuid`);
      if (!studyApiResponse) {
        studyApiResponse = await CSISRemoteHelpers.getStudyGroupNodeFromCsis(this.queryParams.host, this.queryParams.study_uuid);
      }
      if(studyApiResponse && studyApiResponse.data && studyApiResponse.data.relationships 
        && studyApiResponse.data.relationships.field_data_package && studyApiResponse.data.relationships.field_data_package.data) {
          this.queryParams.study_datapackage_uuid = studyApiResponse.data.relationships.field_data_package.data.id;
          resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(this.queryParams.host, this.queryParams.study_datapackage_uuid);
        } else {
          log.warn(`no data package associated with study {this.queryParams.study_uuid}, cannot load resources!`);
        }
    } else {
      log.error(`no study_uuid nor study_datapackage_uuid nor resource_uuid submitted via query params, cannot load addtional resource layers`);
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

    if (leafletMapModel.length > 0) {
      this.setState({
        overlays: leafletMapModel,
        loading: false,
        exclusiveGroups: this.extractGroups(leafletMapModel)
      });
    } else if (this.overlaysBackup != null) {
      this.setState({
        overlays: this.overlaysBackup,
        loading: false,
        exclusiveGroups: this.extractGroups(this.overlaysBackup)
      });
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


    log.debug(`process ${resourceArray.length} resources and ${includedArray.length} included  object for ${mapType} map, ${groupingCriteria} group type and ${referenceType} reference type`);
    //CHROME SUCKS! EVEN WITH THIS "TRICK" (https://stackoverflow.com/questions/52730747/google-chrome-console-does-not-allow-log-level-change)
    //the log messages above are not shown! WTF!
    log.info(`process ${resourceArray.length} resources and ${includedArray.length} included  object for ${mapType} map, ${groupingCriteria} group type and ${referenceType} reference type`);

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
      leafletMapModel.push(leafletLayer);
      log.debug('layer #' + i + ': ' + leafletLayer.groupTitle + '/' + leafletLayer.title + ' added: ' + leafletLayer.url);
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

    return leafletMapModel;
  }

  /**
   * Method can be overridden in subclasses to support custom behaviour.
   * 
   * FIXME: externalize, use callback method instead!
   * 
   * @param {*} resource 
   * @param {*} url 
   */
  processUrl(resource, url) {
    return EMIKATHelpers.addEmikatId(url, this.queryParams.EmikatId);
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
    var layerParam = url.substring(url.indexOf('layers=') + 'layers='.length)
    return (layerParam.indexOf('&') !== -1 ? layerParam.substring(0, layerParam.indexOf('&')) : layerParam);
  }

  /**
   * Extracts the style name from the given wms GetMap request
   * 
   * @param {String} url a get MapRequest
   */
  extractStyle(url) {
    var layerParam = url.substring(url.indexOf('style=') + 'style='.length)
    return (layerParam.indexOf('&') !== -1 ? layerParam.substring(0, layerParam.indexOf('&')) : layerParam);
  }

  /**
   * Returns the given url without parameters
   *  
   * @param {String} url 
   */
  extractUrl(url) {
    return (url.indexOf('?') !== -1 ? url.substring(0, url.indexOf('?')) : null);
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
