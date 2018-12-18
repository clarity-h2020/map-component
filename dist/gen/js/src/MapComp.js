import React from 'react';
import ReactDOM from 'react-dom';
import { Map, Marker, Popup, TileLayer, WMSTileLayer, Polygon, MultiPolygon, FeatureGroup, Circle, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import { LayersControl } from 'leaflet-groupedlayercontrol';
import html2canvas from 'html2canvas';
import turf from 'turf';
import Wkt from 'wicket';
//import "leaflet/dist/leaflet.css"
//import "leaflet-draw/dist/leaflet-draw.css"
//import logo from './logo.svg';
import './MapComp.css';

export default class MapComp extends React.Component {
  constructor(props) {
    super(props);

    var dataPackage = {
      "basemaps": [{
        "name": "buildings",
        "server": "http://5.79.69.33:8080/geoserver/clarity/wms",
        "layer": "it003l3_napoli_ua2012_buildings",
        "type": "wms"
      }],
      "hazardmaps": [{
        "name": "hazard buildings",
        "server": "http://5.79.69.33:8080/geoserver/clarity/wms",
        "layer": "it003l3_napoli_ua2012_buildings",
        "type": "wms"
      }],
      "exposure": [{
        "name": "population",
        "type": "folder",
        "children": [{
          "name": "population 1758",
          "server": "https://service.emikat.at/geoserver/clarity/wms",
          "layer": "CLY_POPULATION_1758",
          "type": "wms"
        }]
      }, {
        "name": "infrastructure",
        "type": "folder",
        "children": [{
          "name": "buildings",
          "server": "http://5.79.69.33:8080/geoserver/clarity/wms",
          "layer": "it003l3_napoli_ua2012_buildings",
          "type": "wms"
        }, {
          "name": "railways",
          "server": "http://5.79.69.33:8080/geoserver/clarity/wms",
          "layer": "it003l3_napoli_ua2012_railways",
          "type": "wms"
        }]
      }]
    };

    this.state = {
      lat: 48.505,
      lng: 2.09,
      zoom: 4,
      geom: null,
      creationCallback: null,
      currentStep: null,
      data: dataPackage
    };
  }

  setView(la, ln, zo) {
    this.setState({
      lat: la,
      lng: ln,
      zoom: zo
    });
  }

  setStep(step) {
    this.setState({
      currentStep: step
    });
    if (step != null && Number.isInteger(Number(step))) {
      const map = this.refs.map.leafletElement;
      map.options.minZoom = 11;
    }
  }

  setCreationCallback(callbackfunc) {
    this.setState({
      creationCallback: callbackfunc
    });
  }

  setPolygonURL(url) {
    fetch(url, { credentials: 'include' }).then(resp => resp.json()).then(function (data) {
      var wkt = new Wkt.Wkt();
      wkt.read(data.field_boundaries[0].value);
      window.mapCom.setCountryGeom(JSON.stringify(wkt.toJson()));
    }).catch(function (error) {
      console.log(JSON.stringify(error));
    });
  }

  setUUId(id) {
    this.setState({
      uuid: id
    });
  }

  getUUId() {
    return this.state.uuid;
  }

  setStudyURL(id, hostName) {
    this.setState({
      studyId: id,
      hname: hostName
    });
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + id, { credentials: 'include' }).then(resp => resp.json()).then(function (data) {
      var wktVar = new Wkt.Wkt();
      if (data.data[0] != null) {
        window.mapCom.setUUId(data.data[0].id);
      }
      if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
        wktVar.read(data.data[0].attributes.field_area.value);
        window.mapCom.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
      }
      fetch(data.data[0].relationships.field_country.links.related, { credentials: 'include' }).then(resp => resp.json()).then(function (data) {
        var wkt = new Wkt.Wkt();
        wkt.read(data.data.attributes.field_boundaries.value);
        window.mapCom.setCountryGeom(JSON.stringify(wkt.toJson()));
      }).catch(function (error) {
        console.log(JSON.stringify(error));
      });
    }).catch(function (error) {
      console.log(JSON.stringify(error));
    });
  }

  invokeCallbackFunction(e) {
    if (this.state.creationCallback != null) {
      this.state.creationCallback(e);
    }
  }

  print() {
    var callback = function (b) {
      prompt(b);
    };
    html2canvas(document.getElementById("map-container")).then(canvas => {
      canvas.toBlob(callback);
    });
  }

  setPolygonName(name) {
    fetch('http://localhost:8080/selectedCountryNodes?_format=json', { credentials: 'include' }).then(resp => resp.json()).then(function (data) {
      for (var co in data) {
        if (data[co].field_country === name) {
          window.mapCom.setPolygonURL('http://localhost:8080/taxonomy/term/' + data[co].tid + '?_format=json', { credentials: 'include' });
        }
      }
    }).catch(function (error) {
      console.log(JSON.stringify(error));
    });
  }

  setCountryGeom(geome) {
    var centroid = turf.centroid(JSON.parse(geome));
    this.setState({
      lat: 0,
      lng: centroid.geometry.coordinates[0],
      zoom: 10
    });
    this.setState({
      lat: centroid.geometry.coordinates[0],
      lng: centroid.geometry.coordinates[1],
      geom: turf.flip(JSON.parse(geome)).coordinates,
      geomJson: turf.flip(JSON.parse(geome)),
      zoom: 5
    });
    var p = {
      "type": "Feature",
      "properties": {
        "popupContent": "country",
        "style": {
          weight: 2,
          color: "black",
          opacity: 0.3,
          fillColor: "#ff0000",
          fillOpacity: 0.1
        }
      },
      "geometry": turf.flip(JSON.parse(geome))
    };
  }

  setStudyAreaGeom(geome) {
    this.setState({
      studyGeom: null,
      studyGeomJson: null
    });

    if (geome != null) {
      this.setState({
        studyGeom: JSON.parse(geome).coordinates,
        studyGeomJson: JSON.parse(geome)
      });

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
      L.geoJSON(study).addTo(this.refs.map.leafletElement);
    }
  }

  getTokenUrl() {
    return this.state.hname + '/rest/session/token';
  }

  getHostname() {
    return this.state.hname;
  }

  getHostnameWithoutProtocol() {
    return this.state.hname.substring(this.state.hname.indexOf(':') + 3);
  }

  getStudyId() {
    return this.state.studyId;
  }

  _onCreated(e) {
    var qmToQkm = 1000000;
    var area = turf.area(e.layer.toGeoJSON());

    if (area > 100 * qmToQkm) {
      //remove the layer, if it is too large
      alert('The selected area is too large');
      window.mapCom.removeLayer(e.layer);
    } else {
      fetch(window.mapCom.getTokenUrl(), { credentials: 'include' }).then(resp => resp.text()).then(function (key) {
        var hostWithoutProt = window.mapCom.getHostnameWithoutProtocol();
        var wkt = new Wkt.Wkt();
        wkt.fromJson(e.layer.toGeoJSON());
        var data = '{"data": {"type": "group--study","id": "' + window.mapCom.getUUId() + '","attributes": {"field_area": {"value": "' + wkt.write() + '"}}}}';
        var mimeType = "application/vnd.api+json"; //hal+json
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('PATCH', window.mapCom.getHostname().substring(0, window.mapCom.getHostname().length) + '/jsonapi/group/study/' + window.mapCom.getUUId(), true); // true : asynchrone false: synchrone
        xmlHttp.setRequestHeader('Accept', 'application/vnd.api+json');
        xmlHttp.setRequestHeader('Content-Type', mimeType);
        xmlHttp.setRequestHeader('X-CSRF-Token', key);
        xmlHttp.send(data);
        window.mapCom.setStudyAreaGeom(JSON.stringify(wkt.toJson()));
        //      window.mapCom.invokeCallbackFunction(wkt.write());
      }).catch(function (error) {
        console.log(JSON.stringify(error));
      });
    }
  }
  _onFeatureGroupReady(reactFGref) {}
  componentDidMount() {
    const map = this.refs.map.leafletElement;
    map.invalidateSize();
    var layerControl = this.state.control;

    if (layerControl == null) {
      this.setLayerFromModel();
    }
  }

  componentDidUpdate() {
    const map = this.refs.map.leafletElement;
    map.invalidateSize();
    var layerControl = this.state.control;

    if (layerControl == null) {
      this.setLayerFromModel();
    }
  }

  //Add the layer to the map and considers the current step
  setLayerFromModel() {
    var basemaps = {};
    var groupedOverlays = {};
    var dataPackage = this.state.data;
    var options = {
      //      exclusiveGroups: ["Exposure"],
      // Show a checkbox next to non-exclusive group labels for toggling all
      groupCheckboxes: false
    };
    //todo: depends on the current step
    var usedDataSubSet = dataPackage.exposure;

    var layerControl = L.control.groupedLayers(basemaps, groupedOverlays, options);
    this.setState({
      control: layerControl
    });
    layerControl.addTo(this.refs.map.leafletElement);

    for (var i = 0; i < usedDataSubSet.length; ++i) {
      if (usedDataSubSet[i].type === 'wms') {
        var layer = new L.tileLayer.wms(usedDataSubSet[i].server, { layers: usedDataSubSet[i].layer });
        groupedOverlays.exposure[usedDataSubSet[i].name] = layer;
      } else if (usedDataSubSet[i].type === 'folder') {
        this.addFolderFromModel(usedDataSubSet[i], layerControl);
      }
    }
  }

  addFolderFromModel(folder, layerControl) {
    var layerFolder;
    var foldername = folder.name;

    for (var i = 0; i < folder.children.length; ++i) {
      var child = folder.children[i];

      if (child.type === 'wms') {
        var layer = new L.tileLayer.wms(child.server, { layers: child.layer, transparent: 'true', format: "image/png" });
        layerControl.addOverlay(layer, child.name, foldername);
      } else if (child.type === 'folder') {
        this.addFolderFromModel(folder, layerControl);
      }
    }
  }

  removeLayer(layer) {
    this.refs.map.leafletElement.removeLayer(layer);
  }

  init() {
    const map = this.refs.map.leafletElement;
    //    map.options.minZoom = 10;
    //    map.options.maxZoom = 15;
    map.invalidateSize();
  }

  countryPolygonStyle(feature) {
    return {
      weight: 2,
      opacity: 0.3,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.1,
      fillColor: '#ff0000'
    };
  }

  getBoundsFromArea(area) {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    var study = null;

    if (this.state.studyGeomJson != null) {
      study = {
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
        "geometry": this.state.studyGeomJson
      };
    }

    if (this.state.currentStep != null && Number.isInteger(Number(this.state.currentStep))) {
      if (this.state.studyGeomJson == null) {
        window.map = React.createElement(
          Map,
          { ref: 'map', touchExtend: 'false', center: position, zoom: this.state.zoom },
          React.createElement(
            LayersControl,
            { position: 'topright' },
            React.createElement(
              LayersControl.BaseLayer,
              { name: 'OpenStreetMap.Mapnik', checked: 'true' },
              React.createElement(TileLayer, {
                attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              })
            )
          )
        );
      } else {
        window.map = React.createElement(
          Map,
          { ref: 'map', touchExtend: 'false', bounds: this.getBoundsFromArea(this.state.studyGeomJson) },
          React.createElement(
            LayersControl,
            { position: 'topright' },
            React.createElement(
              LayersControl.BaseLayer,
              { name: 'OpenStreetMap.Mapnik', checked: 'true' },
              React.createElement(TileLayer, {
                attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              })
            ),
            React.createElement(GeoJSON, { data: study, style: this.countryPolygonStyle })
          )
        );
      }
    } else {
      const pol = this.state.geom;

      if (this.state.geomJson == null) {
        window.map = React.createElement(
          Map,
          { ref: 'map', touchExtend: 'false', center: position, zoom: this.state.zoom },
          React.createElement(TileLayer, {
            attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        );
      } else {
        var p = {
          "type": "Feature",
          "properties": {
            "popupContent": "country",
            "style": {
              weight: 2,
              color: "black",
              opacity: 0.3,
              fillColor: "#ff0000",
              fillOpacity: 0.1
            }
          },
          "geometry": this.state.geomJson
        };

        if (study != null) {
          window.map = React.createElement(
            Map,
            { ref: 'map', touchExtend: 'false', bounds: this.getBoundsFromArea(this.state.geomJson) },
            React.createElement(TileLayer, {
              attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }),
            React.createElement(GeoJSON, { data: p, style: this.countryPolygonStyle }),
            React.createElement(GeoJSON, { data: study, style: this.countryPolygonStyle }),
            React.createElement(
              FeatureGroup,
              null,
              React.createElement(EditControl, {
                position: 'topright',
                onCreated: this._onCreated
              })
            )
          );
        } else {
          window.map = React.createElement(
            Map,
            { ref: 'map', touchExtend: 'false', bounds: this.getBoundsFromArea(this.state.geomJson) },
            React.createElement(TileLayer, {
              attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }),
            React.createElement(GeoJSON, { data: p, style: this.countryPolygonStyle }),
            React.createElement(
              FeatureGroup,
              null,
              React.createElement(EditControl, {
                position: 'topright',
                onCreated: this._onCreated
              })
            )
          );
        }
      }
    }

    return window.map;
  }
}

if (document.getElementById('map-container') != null) {
  const ma = React.createElement(MapComp, null);

  const mapComp = ReactDOM.render(ma, document.getElementById('map-container'));
  window.mapCom = mapComp;
  window.mapCom.init();
  //document.getElementById('map-container').style.width = "600px";
  //document.getElementById('map-container').style.height = "500px";
  document.getElementById('map-container').style.width = "100%";
  document.getElementById('map-container').style.height = "500px";
  //document.getElementById('map-container').style.width = "800px";
  //document.getElementById('map-container').style.height = "400px";
}