import React from "react";
import Wkt from 'wicket';
import turf from 'turf';
import queryString from 'query-string';


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

    this.protocol = 'https://';

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
      if (values.id && values.id !== null && values.url && values.url !== null) {
        this.setStudyURL(values.id, values.url);
      }
    }
  }

  setStudyURL(id, hostName) {
    console.log('loading study ' + id + ' from ' + hostName);
    this.setState({
      studyId: id,
      hname: hostName
    });
    const _this = this;
    // get and render the study area
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + id, { credentials: 'include' })
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

          if (data.data[0] != null) {
            _this.setUUId(data.data[0].id)
          } else {
            console.warn("could not set UUID")
          }

          if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
            wktVar.read(data.data[0].attributes.field_area.value);
            _this.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
          } else {
            console.error('no study area in study ' + id);
          }

          // get and render the map layers
          _this.processStudyJson(data);


        } else {
          console.error('no data in study ' + id);
          console.debug(JSON.stringify(data));
        }



        // if (data.data[0].attributes.field_map_layer_ch != null) {

        //   var layer = JSON.parse( data.data[0].attributes.field_map_layer_ch );
        //   comp.setState({
        //     baseLayers: layer.baselayers,
        //     overlays: layer.overlays
        //   });
        // }
      })
      .catch(function (error) {
        console.error('could not load study area from ' + hostName, error);
      });


  }

  getTokenUrl() {
    return this.state.hname + '/rest/session/token';
  }

  setUUId(id) {
    this.setState({
      uuid: id
    });
  }

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

  processStudyJson(study) {
    const _this = this;
    if (study != null && study.data[0] != null && study.data[0].relationships.field_data_package.links.related != null) {
      // get the 1st available data package
      fetch(study.data[0].relationships.field_data_package.links.related.href.replace('http://', _this.protocol), { credentials: 'include' })
        .then((resp) => resp.json())
        .then(function (dataPackage) {
          if (dataPackage.data.relationships.field_resources.links.related != null) {
            
            //FIXME: #28
            var includes = 'include=field_resource_tags,field_map_view,field_analysis_context.field_field_eu_gl_methodology,field_analysis_context.field_hazard';

            // TODO: remove above line and uncomment line below when Data APckages have been updated in CSIS!
            //var includes = 'include=field_resource_tags,field_map_view';
            
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

  convertDataFromServer(originData, mapType, groupingCriteria) {
    this.mapData = [];
    var resourceArray = originData.data;
    const tmpMapData = this.mapData;
    const resourceLength = resourceArray.length;
    const _this = this;

    // iterate resources
    for (var i = 0; i < resourceArray.length; ++i) {
      const resource = resourceArray[i];

       // iterate resource tags
      if (resource.relationships.field_resource_tags != null && resource.relationships.field_resource_tags.data != null 
        && resource.relationships.field_resource_tags.data.length > 0) {
        console.debug('inspecting ' + resource.relationships.field_resource_tags.data.length + ' tags of resource #' + i + ': ' + resource.attributes.field_description);
        var euGlStep, groupName;

        for (var j = 0; j < resource.relationships.field_resource_tags.data.length; ++j) {
          // step one: extract relevant tags
          if (resource.relationships.field_resource_tags.data[j].type === 'taxonomy_term--eu_gl') {
            let tag = this.getInculdedObject(resource.relationships.field_resource_tags.data[j].type, resource.relationships.field_resource_tags.data[j].id, originData.included);
            euGlStep = tag.attributes.field_eu_gl_taxonomy_id.value;
          } else if (resource.relationships.field_resource_tags.data[j].type === groupingCriteria) {
            let tag = this.getInculdedObject(resource.relationships.field_resource_tags.data[j].type, resource.relationships.field_resource_tags.data[j].id, originData.included);
            groupName = tag.attributes.name;
          }
        }

        // step two: create map layers
        // e.g. mapType = eu-gl:risk-and-impact-assessment
        if (euGlStep !== null && euGlStep === mapType) {
          // FIXME: #29
          if (resource.relationships.field_map_view != null && resource.relationships.field_map_view.data != null) {
            var mapView = this.getInculdedObject(resource.relationships.field_map_view.data.type, resource.relationships.field_map_view.data.id, originData.included);

            if (mapView != null) {
              var layerObject = {};
              layerObject.url = mapView.attributes.field_url;
              layerObject.title = resource.attributes.field_title;
              // if no taxonomy term is avaible, use default group name.
              layerObject.group = groupName;
              tmpMapData.push(layerObject);
              _this.finishMapExtraction(tmpMapData, resourceLength);
            } else {
              // FIXME: this is madness
              console.debug('no map view object available for resource ' + i);
              _this.addEmptyMapDataElement(tmpMapData, resourceLength);
            }
          } else {
            // FIXME: this is madness
            console.debug('no map view property available for resource ' + i);
            _this.addEmptyMapDataElement(tmpMapData, resourceLength);
          }
        } else {
          // FIXME: this is madness
          console.warn('resource ' + i + ' is not assiged to any Eu-GL step')
          _this.addEmptyMapDataElement(tmpMapData, resourceLength);
        }
      } else {
        console.warn('no tags for  resource ' + resource.attributes.field_title + 'found, falling back to deprecated EU-GL context object');

        // DEPRECATED. SEE #28 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        if (resource.relationships.field_analysis_context != null && resource.relationships.field_analysis_context.data != null) {
          var analysisContext = this.getInculdedObject(resource.relationships.field_analysis_context.data.type, resource.relationships.field_analysis_context.data.id, originData.included);

          if (analysisContext != null) {
            if (analysisContext.relationships.field_field_eu_gl_methodology != null && analysisContext.relationships.field_field_eu_gl_methodology.data != null) {
              var methodologyData = this.getInculdedObject(analysisContext.relationships.field_field_eu_gl_methodology.data[0].type, analysisContext.relationships.field_field_eu_gl_methodology.data[0].id, originData.included);
              console.log(methodologyData.attributes.field_eu_gl_taxonomy_id.value);

              if (methodologyData.attributes.field_eu_gl_taxonomy_id.value === mapType) {
                if (resource.relationships.field_map_view != null && resource.relationships.field_map_view.data != null) {
                  mapView = this.getInculdedObject(resource.relationships.field_map_view.data.type, resource.relationships.field_map_view.data.id, originData.included);

                  if (mapView != null) {
                    if (analysisContext.relationships.field_hazard != null && analysisContext.relationships.field_hazard.data != null && analysisContext.relationships.field_hazard.data.length > 0) {
                      var hazard = this.getInculdedObject(analysisContext.relationships.field_hazard.data[0].type, analysisContext.relationships.field_hazard.data[0].id, originData.included);
                      if (hazard != null) {
                        layerObject = {};
                        layerObject.url = mapView.attributes.field_url;
                        layerObject.title = resource.attributes.field_title;
                        layerObject.group = hazard.attributes.name;

                        // if (resource.relationships.field_temporal_extent != null && resource.relationships.field_temporal_extent.data != null) {
                        //   var fieldTemporalExtent = this.getInculdedObject(resource.relationships.field_temporal_extent.data.type, resource.relationships.field_temporal_extent.data.id, originData.included);

                        //   if (fieldTemporalExtent != null) {
                        //     layerObject.startdate = fieldTemporalExtent.attributes.field_start_date;
                        //     layerObject.enddate = fieldTemporalExtent.attributes.field_start_date;
                        //   }
                        // }

                        // if (analysisContext.relationships.field_emissions_scenario != null && analysisContext.relationships.field_emissions_scenario.data != null) {
                        //   var emissionsScenario = this.getInculdedObject(analysisContext.relationships.field_emissions_scenario.data.type, analysisContext.relationships.field_emissions_scenario.data.id, originData.included);

                        //   if (emissionsScenario != null) {
                        //     layerObject.emissionsScenario = emissionsScenario.attributes.name;
                        //   }
                        // }

                        tmpMapData.push(layerObject);
                        _this.finishMapExtraction(tmpMapData, resourceLength);
                      } else {
                        _this.addEmptyMapDataElement(tmpMapData, resourceLength);
                      }
                    } else {
                      _this.addEmptyMapDataElement(tmpMapData, resourceLength);
                    }
                  } else {
                    _this.addEmptyMapDataElement(tmpMapData, resourceLength);
                  }
                } else {
                  _this.addEmptyMapDataElement(tmpMapData, resourceLength);
                }
              } else {
                _this.addEmptyMapDataElement(tmpMapData, resourceLength);
              }
            } else {
              _this.addEmptyMapDataElement(tmpMapData, resourceLength);
            }
          } else {
            _this.addEmptyMapDataElement(tmpMapData, resourceLength);
          }
        } else {
          _this.addEmptyMapDataElement(tmpMapData, resourceLength);
        }
      }
    }
  }


  getInculdedObject(type, id, includedArray) {
    if (type != null && id != null) {
      for (let i = 0; i < includedArray.length; ++i) {
        if (includedArray[i].type === type && includedArray[i].id === id) {
          return includedArray[i];
        }
      }
    }

    return null;
  }

  addEmptyMapDataElement(tmpMapData, resourceLength) {
    var layerObject = {};
    layerObject.url = null;
    tmpMapData.push(layerObject);
    this.finishMapExtraction(tmpMapData, resourceLength);
  }

  finishMapExtraction(mapData, resourceLength) {
    if (mapData.length === resourceLength) {
      console.log(resourceLength + ' resource layers processed')
      var mapModel = [];
      for (var i = 0; i < mapData.length; ++i) {
        if (mapData[i].url && mapData[i].url !== null) {
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
  }

  extractGroups(mapData) {
    var groups = [];
    for (var i = 0; i < mapData.length; ++i) {
      if (!groups.includes(mapData[i].groupTitle)) {
        groups.push(mapData[i].groupTitle);
      }
    }

    return groups;
  }

  print() {
    // var callback = function (b) {
    //         prompt(b);
    // }
    // html2canvas(document.getElementById("riskAndImpact-map-container")).then(canvas => {
    // canvas.toBlob(callback)});
  }

  titleToName(title) {
    return title.replace(' ', '_');
  }

  extractLayers(url) {
    var layerParam = url.substring(url.indexOf('layers=') + 'layers='.length)
    return (layerParam.indexOf('&') !== -1 ? layerParam.substring(0, layerParam.indexOf('&')) : layerParam);
  }

  extractStyle(url) {
    var layerParam = url.substring(url.indexOf('style=') + 'style='.length)
    return (layerParam.indexOf('&') !== -1 ? layerParam.substring(0, layerParam.indexOf('&')) : layerParam);
  }

  extractUrl(url) {
    return (url.indexOf('?') !== -1 ? url.substring(0, url.indexOf('?')) : null);
  }

  getBoundsFromArea(area) {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }
};
