import React from "react";
import PropTypes from 'prop-types';
import Wkt from 'wicket';
import turf from 'turf';
import queryString from 'query-string';
import log from 'loglevel';


/**
 * This is the basic class of all map classes. 
 * It implements the common way to extract the overlay layers from the study. 
 */
export default class BasicMap extends React.Component {
  constructor(props) {
    super(props);

    /**
     * The protocol that is used by the server. The protocol of the server is https://, but for local testing it can be changed to http://
     */
    this.protocol = 'https://';

    this.referenceType = '@mapview:ogc:wms';

    console.log('creating new ' + props.mapSelectionId + ' map with layer group from ' + props.groupingCriteria);
  }

  /**
   * For standalone use, e.g.
   * http://localhost:3000//?url=https://csis.myclimateservice.eu&id=c3609e3e-f80f-482b-9e9f-3a26226a6859
   * 
   */
  componentDidMount() {
    if (this.props.location && this.props.location.search) {
      const values = queryString.parse(this.props.location.search)
      if (values.id && values.id != null && values.url && values.url != null) {
        this.setStudyURL(values.id, values.url);
      }
    }


    //const layerObject = _this.processResources(resources, _this.props.mapSelectionId, _this.props.groupingCriteria);
    //_this.finishMapExtraction(layerObject);
  }

  /**
   * Starts the loading of the study layers and render them on the map
   * 
   * @param {String} studyUuid the uuid of the study
   * @param {String} hostName the hostname
   * @deprecated
   */
  setStudyURL(studyUuid, hostName) {
    console.log('loading study ' + studyUuid + ' from ' + hostName);
    this.setState({
      studyUuid: studyUuid,
      hname: hostName
    });
    const _this = this;
    // get and render the study area
    // ARGH! WTF?!
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + studyUuid, { credentials: 'include' })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        //console.debug(response);
        return response.json();
      })
      // study area --------------------------------------------------
      .then(function (data) {
        var wktVar = new Wkt.Wkt();

        if (data != null && data.data[0] != null) {

          if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
            wktVar.read(data.data[0].attributes.field_area.value);
            _this.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
          } else {
            console.error('no study area in study ' + studyUuid);
          }

          // get and render the map layers
          // resources --------------------------------------------------
          _this.processStudy(data);


        } else {
          console.error('no data in study ' + studyUuid);
          console.debug(JSON.stringify(data));
        }
      })
      .catch(function (error) {
        console.error('could not load study area from ' + hostName, error);
      });


  }

  /**
   * Add the given study area to the map
   * 
   * @param {Object} studyAreaGeometry the geometry of the study area
   */
  setStudyAreaGeom(studyAreaGeometry) {
    if (geome != null) {
      var study = {
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
        "geometry": JSON.parse(studyAreaGeometry)
      };
      this.setState({
        studyAreaPolygon: null
      });
      this.setState({
        studyAreaPolygon: study,
        bounds: this.getBoundsFromArea(JSON.parse(studyAreaGeometry))
      });
    }
  }

  /**
   * Retrieves the study object from the server, extracts the layers from the study and add it to the map.
   * processResources processes the resources.
   * 
   * FIXME: remove API requests from this component!
   * 
   * @param {Object} study 
   * @deprecated
   */
  processStudy(studyApiResponse) {

    const studyAreaJson = CSISHelpers.extractStudyAreaFromStudyGroupNode(studyApiResponse.data);

    const _this = this;
    if (study != null && study.data[0] != null && study.data[0].relationships.field_data_package.links.related != null) {
      // get the 1st available data package
      // ARGH!!
      fetch(study.data[0].relationships.field_data_package.links.related.href.replace('http://', _this.protocol), { credentials: 'include' })
        .then((resp) => resp.json())
        .then(function (dataPackage) {
          if (dataPackage.data.relationships.field_resources.links.related != null) {

            //FIXME: #28
            var includes = 'include=field_resource_tags,field_map_view,field_references,field_analysis_context.field_field_eu_gl_methodology,field_analysis_context.field_hazard';

            // TODO: remove above line and uncomment line below when Data Packages have been updated in CSIS!
            //var includes = 'include=field_resource_tags,field_references';

            var separator = (dataPackage.data.relationships.field_resources.links.related.href.indexOf('?') === - 1 ? '?' : '&');
            
            // ARGH!! NOT AGAIN!
            fetch(dataPackage.data.relationships.field_resources.links.related.href.replace('http://', _this.protocol) + separator + includes, { credentials: 'include' })
              .then((resp) => resp.json())
              .then(function (resources) {
                const layerObject = _this.processResources(resources, _this.props.mapSelectionId, _this.props.groupingCriteria);
                _this.finishMapExtraction(layerObject);
              })
              .catch(function (error) {
                console.log('could not load relationships', error);
              });
          } else {
            console.error('no resources in study!');
            console.debug(JSON.stringify(dataPackage));
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      console.error('no data in study!');
      console.debug(JSON.stringify(study));
    }
  }

  /**
   * Extracts the layers from the given RESOURCES array and add it to the map 
   * 
   * FIXME: externalise, eventually merge with finishMapExtraction()
   * 
   * @param {Object} resourcesApiResponse the resources API response
   * @param {String} mapType the eu-gl step of the layers, which should be added. E.g. eu-gl:risk-and-impact-assessment 
   * @param {String} groupingCriteria th grouping criteria of the layers. E.g. taxonomy_term--hazards
   * @return {Object[]}
   */
  processResources(resourcesApiResponse, mapType, groupingCriteria) {
    const _this = this;
    const resourceArray = resourcesApiResponse.data;
    const includedArray = resourcesApiResponse.included;
    const referenceType = '@mapview:ogc:wms';

    var mapData = [];

    const filteredResources = CSISHelpers.filterResourcesbyReferenceType(
      CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, 'taxonomy_term--eu_gl', mapType),
      includedArray,
      referenceType);

    log.info(`$filteredResources.length valid resources for $mapType with $referenceType references found in $resourceArray.length available resources`);

    for (var i = 0; i < filteredResources.length; ++i) {
      const resource = resourceArray[i];
      const resourceReferences = CSISHelpers.extractReferencesfromResource(resource, includedArray, referenceType);
      if (resourceReferences.length > 1) {
        log.warn(`$resourceReferences.length $referenceType references in resource $resource.attributes.title, using only 1st reference $resourceReferences[0].attributes.field_reference_path`);
      }

      const layerUrl = _this.processUrl(resource, resourceReferences[0].attributes.field_reference_path);
      const groupName = 'taxonomy_term--hazards';

      const tags = CSISHelpers.extractTagsfromResource(resource, includedArray, tagType);

      var layerObject = {};
      layerObject.url = layerUrl;
      layerObject.title = resource.attributes.title;
      // if no taxonomy term is available, use default group name.
      // WARNING: 
      // null == undefined  // true
      // null === undefined  // false -> compare value AND type
      if (tags != null || tags.length > 0) {
        layerObject.group = tags[0].attributes.name;
        if(tags.length > 0) {
          log.warn(`$tags.length $tagType tags in resource $resource.attributes.title, using only 1st tag $tags[0].attributes.name`);
        }
      } else {
        layerObject.group = 'Default';
      }
      mapData.push(layerObject);
    }

    return mapData; 
  }

/**
 * Method can be overridden in subclasses to support custom behaviour.
 * 
 * FIXME: externalise, use callback method instead!
 * 
 * @param {*} resource 
 * @param {*} url 
 */
processUrl(resource, url) {
  return url;
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
 * Add the given overlay layers to the state
 *  
 * FIXME: split method, externalise layer generation part
 * 
 * @param {Array} mapData the overlay layers
 * @param {Number} resourceLength the resource count of the current study
 * @deprecated
 */
finishMapExtraction(mapData) {
  var mapModel = [];
  for (var i = 0; i < mapData.length; ++i) {
    if (mapData[i].url && mapData[i].url != null) {
      var layer = {};
      layer.checked = false;
      layer.groupTitle = (mapData[i].group === null ? 'Overlays' : mapData[i].group);
      layer.name = this.titleToName(mapData[i].title);
      layer.title = mapData[i].title;
      layer.layers = this.extractLayers(mapData[i].url.toString());
      layer.url = this.extractUrl(mapData[i].url.toString());
      mapModel.push(layer);
      console.debug('layer #' + i + ': ' + layer.groupTitle + '/' + layer.title + ' added: ' + layer.url);
    }
  }

  if (mapModel.length > 0) {
    mapModel.sort(function (a, b) {
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
    this.setState({
      overlays: mapModel,
      loading: false,
      exclusiveGroups: this.extractGroups(mapModel)
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
 * Extract the groups from the given overlay layers
 * 
 * FIXME: externalise method! Use a Set!
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
  mapSelectionId: 'eu-gl:risk-and-impact-assessment',
  groupingCriteria: 'taxonomy_term--hazards'

};
