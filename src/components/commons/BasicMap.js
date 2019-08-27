import React from "react";
import Wkt from 'wicket';
import turf from 'turf';
import queryString from 'query-string';


/**
 * This is the basic class of all map classes. 
 * It implements the common way to extract the overlay layers from the study. 
 */
export default class BasicMap extends React.Component {
  constructor(props, mapSelectionId = 'eu-gl:risk-and-impact-assessment', groupingCriteria = 'taxonomy_term--hazards') {
    super(props);
    /**
     * ~ mapType, e.g. 'eu-gl:risk-and-impact-assessment' = Taxonomy Term
     */
    this.mapSelectionId = mapSelectionId;

    /**
     * Taxonomy for Layer Groups, e.g. 'taxonomy_term--hazards'
     */

    this.groupingCriteria = groupingCriteria;

    /**
     * The protocol that is used by the server. The protocol of the server is https://, but for local testing it can be changed to http://
     */
    this.protocol = 'https://';

    this.referenceType = '@mapview:ogc:wms';

    console.log('creating new ' + this.mapSelectionId + ' map with layer group from ' + this.groupingCriteria);
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
  }

  /**
   * Starts the loading of the study layers and render them on the map
   * 
   * @param {String} studyUuid the uuid of the study
   * @param {String} hostName the hostname
   */
  setStudyURL(studyUuid, hostName) {
    console.log('loading study ' + studyUuid + ' from ' + hostName);
    this.setState({
      studyUuid: studyUuid,
      hname: hostName
    });
    const _this = this;
    // get and render the study area
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + studyUuid, { credentials: 'include' })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        //console.debug(response);
        return response.json();
      })
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
          _this.processStudyJson(data);


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
   * @param {Object} geome the geometry of the study area
   */
  setStudyAreaGeom(geome) {
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
        "geometry": JSON.parse(geome)
      };
      this.setState({
        studyAreaPolygon: null
      });
      this.setState({
        studyAreaPolygon: study,
        bounds: this.getBoundsFromArea(JSON.parse(geome))
      });
    }
  }

  /**
   * Retrieves the study object from the server, extracts the layers from the study and add it to the map 
   * 
   * @param {Object} study 
   */
  processStudyJson(study) {
    const _this = this;
    if (study != null && study.data[0] != null && study.data[0].relationships.field_data_package.links.related != null) {
      // get the 1st available data package
      fetch(study.data[0].relationships.field_data_package.links.related.href.replace('http://', _this.protocol), { credentials: 'include' })
        .then((resp) => resp.json())
        .then(function (dataPackage) {
          if (dataPackage.data.relationships.field_resources.links.related != null) {

            //FIXME: #28
            var includes = 'include=field_resource_tags,field_map_view,field_references,field_analysis_context.field_field_eu_gl_methodology,field_analysis_context.field_hazard';

            // TODO: remove above line and uncomment line below when Data Packages have been updated in CSIS!
            //var includes = 'include=field_resource_tags,field_map_view,field_references';

            var separator = (dataPackage.data.relationships.field_resources.links.related.href.indexOf('?') === - 1 ? '?' : '&');

            fetch(dataPackage.data.relationships.field_resources.links.related.href.replace('http://', _this.protocol) + separator + includes, { credentials: 'include' })
              .then((resp) => resp.json())
              .then(function (resources) {
                _this.convertDataFromServer(resources, _this.mapSelectionId, _this.groupingCriteria);
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
   * Extracts the layers from the given study and add it to the map 
   * 
   * @param {Object} originData the study object
   * @param {String} mapType the eu-gl step of the layers, which should be added. E.g. eu-gl:risk-and-impact-assessment 
   * @param {String} groupingCriteria th grouping criteria of the layers. E.g. taxonomy_term--hazards
   */
  convertDataFromServer(originData, mapType, groupingCriteria) {
    var mapData = [];
    var resourceArray = originData.data;
    const resourceLength = resourceArray.length;
    const _this = this;

    // iterate resources
    for (var i = 0; i < resourceArray.length; ++i) {
      const resource = resourceArray[i];

      // iterate resource tags
      if (resource.relationships.field_resource_tags != null && resource.relationships.field_resource_tags.data != null
        && resource.relationships.field_resource_tags.data.length > 0) {
        console.debug('inspecting ' + resource.relationships.field_resource_tags.data.length + ' tags of resource #' + i + ': ' + resource.attributes.title);
        var euGlStep, groupName, layerUrl;
        var correctEuGlStep = false;

        for (var j = 0; j < resource.relationships.field_resource_tags.data.length; ++j) {
          // step one: extract relevant tags
          if (resource.relationships.field_resource_tags.data[j].type === 'taxonomy_term--eu_gl') {
            let tag = this.getIncludedObject(resource.relationships.field_resource_tags.data[j].type, resource.relationships.field_resource_tags.data[j].id, originData.included);
            euGlStep = tag.attributes.field_eu_gl_taxonomy_id.value;
            
            if (euGlStep != null && euGlStep === mapType) {
              correctEuGlStep = true;
            }
          } else if (resource.relationships.field_resource_tags.data[j].type === groupingCriteria) {
            let tag = this.getIncludedObject(resource.relationships.field_resource_tags.data[j].type, resource.relationships.field_resource_tags.data[j].id, originData.included);
            groupName = tag.attributes.name;
          }
        }

        // step two: create map layers
        // e.g. mapType = eu-gl:risk-and-impact-assessment
        if (correctEuGlStep) {
          // FIXME: #29

          // This is madness: iteratve over references
          if (resource.relationships.field_references != null && resource.relationships.field_references.data != null 
            && resource.relationships.field_references.data.length > 0) {
            for (let referenceReference of resource.relationships.field_references.data) {
              var reference = this.getIncludedObject(referenceReference.type, referenceReference.id, originData.included);
              if(reference != null &&  reference.attributes != null && reference.attributes.field_reference_path != null 
                && reference.attributes.field_reference_qualifier != null  
                && reference.attributes.field_reference_type  != null ) {
                
                // default: _this.referenceType = '@mapview:ogc:wms'
                if(reference.attributes.field_reference_type === _this.referenceType)
                {
                  layerUrl = _this.processUrl(resource, reference.attributes.field_reference_path);
                }
                
              } else {
                console.debug('no reference object available in inlcuded array for resource ' + i);
              }
            }
          }  // FIXME: #29 remove when all Data Packages have been updated!
          else if (resource.relationships.field_references != null && resource.relationships.field_references.length > 0) {
            console.warn('no references for  resource ' + resource.attributes.title + 'found, falling back to deprecated map_view property');
            var mapView = this.getIncludedObject(resource.relationships.field_map_view.data.type, resource.relationships.field_map_view.data.id, originData.included);

            if (mapView != null && mapView.attributes != null && mapView.attributes.field_url != null 
              && mapView.attributes.field_url.length > 0) {
              // FIXME: field_url is now an array .. nor not? Doesn't matter. We discard map_view anyway, See #29
              layerUrl = _this.processUrl(resource, mapView.attributes.field_url[0]);
              
            } else {
              console.debug('no map view object available for resource ' + i);
            }
          } else {
            console.debug('no map view property available in references or resource ' + i);
          }

          if(layerUrl != null) {
            var layerObject = {};
            layerObject.url = layerUrl;
            layerObject.title = resource.attributes.title;
            // if no taxonomy term is avaible, use default group name.
            // WARNING: 
            // null == undefined  // true
            // null === undefined  // false -> compare value AND type
            if(groupName == null || groupName.length > 0) {
              layerObject.group = groupName;
            } else {
              layerObject.group = 'Default';
            }
            mapData.push(layerObject);
          }
        } else {
          console.warn('resource ' + i + ' is not assiged to any Eu-GL step')
        }
      } else {
        console.warn('no tags for resource ' + resource.attributes.title + 'found, falling back to deprecated EU-GL context object');

        // DEPRECATED. SEE #28 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        if (resource.relationships.field_analysis_context != null && resource.relationships.field_analysis_context.data != null) {
          var analysisContext = this.getIncludedObject(resource.relationships.field_analysis_context.data.type, resource.relationships.field_analysis_context.data.id, originData.included);

          if (analysisContext != null) {
            if (analysisContext.relationships.field_field_eu_gl_methodology != null && analysisContext.relationships.field_field_eu_gl_methodology.data != null) {
              var methodologyData = this.getIncludedObject(analysisContext.relationships.field_field_eu_gl_methodology.data[0].type, analysisContext.relationships.field_field_eu_gl_methodology.data[0].id, originData.included);

              if (methodologyData.attributes.field_eu_gl_taxonomy_id.value === mapType) {
                if (resource.relationships.field_map_view != null && resource.relationships.field_map_view.data != null) {
                  mapView = this.getIncludedObject(resource.relationships.field_map_view.data.type, resource.relationships.field_map_view.data.id, originData.included);

                  if (mapView != null) {
                    if (analysisContext.relationships.field_hazard != null && analysisContext.relationships.field_hazard.data != null && analysisContext.relationships.field_hazard.data.length > 0) {
                      var hazard = this.getIncludedObject(analysisContext.relationships.field_hazard.data[0].type, analysisContext.relationships.field_hazard.data[0].id, originData.included);
                      if (hazard != null) {
                        layerObject = {};
                        layerObject.url = _this.processUrl(resource, mapView.attributes.field_url[0]);
                        layerObject.title = resource.attributes.title;
                        layerObject.group = hazard.attributes.name;

                        mapData.push(layerObject);
                      } 
                    }  
                  }  
                } 
              } 
            } 
          } 
        } 
      }
    }
    _this.finishMapExtraction(mapData, resourceLength);
  }

  /**
   * Method can be overriden in subclasses to support custom behaviour
   * 
   * @param {*} resource 
   * @param {*} url 
   */
  processUrl(resource, url) {
    return url;
  }

 
  /**
   * Drupal JSON API 'deeply' inlcudes objects, e.g. &include=field_references are provided onyl onace in a separate array name 'inlcuded'.
   * This method resolves the references and extracts the inlcuded  object.
   */
  getIncludedObject(type, id, includedArray) {
    if (type != null && id != null) {
      for (let i = 0; i < includedArray.length; ++i) {
        if (includedArray[i].type === type && includedArray[i].id === id) {
          return includedArray[i];
        }
      }
    }

    return null;
  }

  /**
   * Add the given overlay layers to the state
   *  
   * @param {Array} mapData the overlay layers
   * @param {Number} resourceLength the resource count of the current study
   */
  finishMapExtraction(mapData, resourceLength) {
      console.log(mapData.length + ' layers of ' + resourceLength + ' resources processed')
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
   * @param {Array} mapData 
   * @returns an arrray with all group names
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
    var styleParam = url.substring(url.toLowerCase().indexOf(styleParamName) + styleParamName.length)
    return (styleParam.indexOf('&') !== -1 ? styleParam.substring(0, styleParam.indexOf('&')) : styleParam);
  }

  /**
   * Returns the given url without parameters
   *  
   * @param {String} url 
   */
  extractUrl(url) {
    //remove the parameters, which will be set by leaflet 
    var parameterList = ['request', 'version', 'service', 'layers', 'bbox', 'width', 'height', 'srs', 'crs', 'format', 'styles', 'transparent', 'bgcolor', 'exceptions'];
    var baseUrl = (url.indexOf('?') !== -1 ? url.substring(0, url.indexOf('?')) : url);

    if (url.indexOf('?') != -1) {
      var urlParameter = url.substring(url.indexOf('?'));

      for (var index = 0; index < parameterList.length; ++index) {
        var parameter = parameterList[index];
        
        if (urlParameter.toLowerCase().indexOf(parameter) != -1) {
          var lastUrlPart = urlParameter.substring(urlParameter.toLowerCase().indexOf(parameter));
          urlParameter = urlParameter.substring(0, urlParameter.toLowerCase().indexOf(parameter));

          if (lastUrlPart.indexOf('&') != -1) {
            urlParameter = urlParameter + lastUrlPart.substring(lastUrlPart.indexOf('&'));
          }
        }
      }

      return baseUrl + urlParameter;
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
};
