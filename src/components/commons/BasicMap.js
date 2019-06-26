import React from "react";
import Wkt from 'wicket';
import turf from 'turf';


export default class BasicMap extends React.Component {
  constructor(props, mapSelectionId) {
    super(props);
    this.mapSelectionId = mapSelectionId;
    this.protocol = 'https://';
  }

  setStudyURL(id, hostName) {
    this.setState({
      studyId: id,
      hname: hostName
    });
    const comp = this;
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + id, { credentials: 'include' })
      .then((resp) => resp.json())
      .then(function (data) {
        var wktVar = new Wkt.Wkt();
        if (data.data[0] != null) {
          comp.setUUId(data.data[0].id)
        }
        if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
          wktVar.read(data.data[0].attributes.field_area.value);
          comp.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
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
        console.log(JSON.stringify(error));
      });

    this.loadDataFromServer(hostName, id);
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

  loadDataFromServer(server, id) {
    const obj = this;
    // get the study
    fetch(server + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + id, { credentials: 'include' })
      .then((resp) => resp.json())
      .then(function (data) {
        if (data != null && data.data[0] != null && data.data[0].relationships.field_data_package.links.related != null) {
          fetch(data.data[0].relationships.field_data_package.links.related.href.replace('http://', obj.protocol), { credentials: 'include' })
            .then((resp) => resp.json())
            .then(function (data) {
              if (data.data.relationships.field_resources.links.related != null) {
                var includes = 'include=field_analysis_context.field_field_eu_gl_methodology,field_map_view,field_analysis_context.field_hazard,field_temporal_extent,field_analysis_context.field_emissions_scenario';
                var separator = (data.data.relationships.field_resources.links.related.href.indexOf('?') === - 1 ? '?' : '&');

                fetch(data.data.relationships.field_resources.links.related.href.replace('http://', obj.protocol) + separator + includes, { credentials: 'include' })
                  .then((resp) => resp.json())
                  .then(function (data) {
                    obj.convertDataFromServer(data, obj.mapSelectionId);
                  })
                  .catch(function (error) {
                    console.log(JSON.stringify(error));
                  });
              } else {
                log.error('no resources in study ' + id);
              }
            })
            .catch(function (error) {
              console.log(JSON.stringify(error));
            });
        } else {
          log.error('no data in study ' + id);
        }
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
      });
  }

  convertDataFromServer(originData, mapType) {
    this.mapData = [];
    var resourceArray = originData.data;
    const tmpMapData = this.mapData;
    const resourceLength = resourceArray.length;
    const thisObj = this;

    for (var i = 0; i < resourceArray.length; ++i) {
      const resource = resourceArray[i];

      if (resource.relationships.field_analysis_context != null && resource.relationships.field_analysis_context.data != null) {
        var analysisContext = this.getInculdedObject(resource.relationships.field_analysis_context.data.type, resource.relationships.field_analysis_context.data.id, originData.included);

        if (analysisContext != null) {
          if (analysisContext.relationships.field_field_eu_gl_methodology != null && analysisContext.relationships.field_field_eu_gl_methodology.data != null) {
            var methodologyData = this.getInculdedObject(analysisContext.relationships.field_field_eu_gl_methodology.data[0].type, analysisContext.relationships.field_field_eu_gl_methodology.data[0].id, originData.included);
            console.log(methodologyData.attributes.field_eu_gl_taxonomy_id.value);

            if (methodologyData.attributes.field_eu_gl_taxonomy_id.value === mapType) {
              if (resource.relationships.field_map_view != null && resource.relationships.field_map_view.data != null) {
                var mapView = this.getInculdedObject(resource.relationships.field_map_view.data.type, resource.relationships.field_map_view.data.id, originData.included);

                if (mapView != null) {
                  if (analysisContext.relationships.field_hazard != null && analysisContext.relationships.field_hazard.data != null && analysisContext.relationships.field_hazard.data.length > 0) {
                    var hazard = this.getInculdedObject(analysisContext.relationships.field_hazard.data[0].type, analysisContext.relationships.field_hazard.data[0].id, originData.included);
                    if (hazard != null) {
                      var refObj = {};
                      refObj.url = mapView.attributes.field_url;
                      refObj.title = resource.attributes.field_title;
                      refObj.group = hazard.attributes.name;

                      // if (resource.relationships.field_temporal_extent != null && resource.relationships.field_temporal_extent.data != null) {
                      //   var fieldTemporalExtent = this.getInculdedObject(resource.relationships.field_temporal_extent.data.type, resource.relationships.field_temporal_extent.data.id, originData.included);

                      //   if (fieldTemporalExtent != null) {
                      //     refObj.startdate = fieldTemporalExtent.attributes.field_start_date;
                      //     refObj.enddate = fieldTemporalExtent.attributes.field_start_date;
                      //   }
                      // }

                      // if (analysisContext.relationships.field_emissions_scenario != null && analysisContext.relationships.field_emissions_scenario.data != null) {
                      //   var emissionsScenario = this.getInculdedObject(analysisContext.relationships.field_emissions_scenario.data.type, analysisContext.relationships.field_emissions_scenario.data.id, originData.included);

                      //   if (emissionsScenario != null) {
                      //     refObj.emissionsScenario = emissionsScenario.attributes.name;
                      //   }
                      // }

                      tmpMapData.push(refObj);
                      thisObj.finishMapExtraction(tmpMapData, resourceLength);
                    } else {
                      thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
                    }
                  } else {
                    thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
                  }
                } else {
                  thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
                }
              } else {
                thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
              }
            } else {
              thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
            }
          } else {
            thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
          }
        } else {
          thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
        }
      } else {
        thisObj.addEmptyMapDataElement(tmpMapData, resourceLength);
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
    var refObj = {};
    refObj.url = null;
    tmpMapData.push(refObj);
    this.finishMapExtraction(tmpMapData, resourceLength);
  }

  finishMapExtraction(mapData, resourceLength) {
    if (mapData.length === resourceLength) {
      var mapModel = [];
      for (var i = 0; i < mapData.length; ++i) {
        if (mapData[i].url != null) {
          var obj = {};
          obj.checked = false;
          obj.groupTitle = (mapData[i].group == null ? 'relevant layer' : mapData[i].group);
          obj.name = this.titleToName(mapData[i].title);
          obj.title = mapData[i].title;
          obj.layers = this.extractLayers(mapData[i].url);
          obj.url = this.extractUrl(mapData[i].url);
          mapModel.push(obj);
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
