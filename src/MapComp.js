import React from 'react';
import ReactDOM from 'react-dom';
import { Map, Marker, Popup, TileLayer, WMSTileLayer, Polygon, MultiPolygon, FeatureGroup, Circle } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import html2canvas from 'html2canvas';
import turf from 'turf';
import Wkt from 'wicket'
//import "leaflet/dist/leaflet.css"
//import "leaflet-draw/dist/leaflet-draw.css"
//import logo from './logo.svg';
import './MapComp.css';

export default class MapComp extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      lat: 48.505,
      lng: 2.09,
      zoom: 4,
      geom: null,
      creationCallback: null
    }
  }
  
  setView(la, ln, zo) {
      this.setState({
        lat: 0,
        lng: ln,
        zoom: zo
    });
      this.setState({
        lat: la,
        lng: ln,
        zoom: zo
    });
  }
  
  setCreationCallback(callbackfunc) {
      this.setState({
        creationCallback: callbackfunc
    });
  }
  
  setPolygonURL(url) {
    fetch(url, {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {
        var wkt = new Wkt.Wkt();
        wkt.read(data.field_boundaries[0].value);
        window.mapCom.setGeom(JSON.stringify(wkt.toJson()));
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });         
  }

  
  setStudyURL(id, hostName) {
    this.setState({
        studyId: id,
        hname: hostName
    });
    fetch(hostName + '/study/' + id + '?_format=json', {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {
      fetch(hostName + data.field_country[0].url + '?_format=json', {credentials: 'include'})
      .then((resp) => resp.json())
      .then(function(data) {
          var wkt = new Wkt.Wkt();
          wkt.read(data.field_boundaries[0].value);
          window.mapCom.setGeom(JSON.stringify(wkt.toJson()));
      })
      .catch(function(error) {
        console.log(JSON.stringify(error));
      });
    })
    .catch(function(error) {
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
    }
    html2canvas(document.getElementById("map-container")).then(canvas => {
    canvas.toBlob(callback)});
  }
  
  setPolygonName(name) {
    fetch('http://localhost:8080/selectedCountryNodes?_format=json', {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {
        for (var co in data) {
              if (data[co].field_country == name) {
                  window.mapCom.setPolygonURL('http://localhost:8080/taxonomy/term/' + data[co].tid + '?_format=json', {credentials: 'include'});
              }
        }
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });         
  }

  setGeom(geome) {
        var centroid = turf.centroid(JSON.parse(geome));
      this.setState({
        lat: 0,
        lng: centroid.geometry.coordinates[0],
        zoom: 10
    });        
        this.setState({
          lat: centroid.geometry.coordinates[0],
          lng: centroid.geometry.coordinates[1],
          geom: JSON.parse(geome).coordinates,
          zoom: 5
      });
//      prompt(turf.centroid(JSON.parse(geome)));
//      prompt(JSON.parse(geome).getBounds().getCenter());
  }
  

//  _onEdited = (e) => {

//    let numEdited = 0;
//    e.layers.eachLayer( (layer) => {
//      numEdited += 1;
//    })
//    console.log(`_onEdited: edited ${numEdited} layers`, e);
//
//    this._onChange();
//  }

  getTokenUrl() {
    return this.state.hname + '/rest/session/token';
  }

  getHostname() {
    return this.state.hname;
  }

  getStudyId() {
    return this.state.studyId;
  }

  _onCreated(e) {
//    prompt(e.layer);
//    prompt);
//    window.mapCom.invokeCallbackFunction(JSON.stringify(e.layer.toGeoJSON()));
//    fetch('http://localhost:8080/rest/session/token', {credentials: 'include'})
//    .then((resp) => resp.text())
//    .then(function(key) {
//        var data = '{"_links":{"type":{"href":"http://localhost:8080/rest/type/node/article"}}, "TextTest":[{"value":"MULTIPOLYGON (((47.052715301514 9.4778022766113, 47.06640625 9.4737567901611, 47.094188690185 9.5233325958251, 47.181838989258 9.4864015579223, 47.052715301514 9.4778022766113)))"}],"type":[{"target_id":"article"}]}';
//        var mimeType = "application/hal+json";      //hal+json
//        var xmlHttp = new XMLHttpRequest();
//        xmlHttp.open('PATCH', 'http://localhost:8080/node/13?_format=hal_json', true);  // true : asynchrone false: synchrone
//        xmlHttp.setRequestHeader('Content-Type', mimeType);  
//       xmlHttp.setRequestHeader('X-CSRF-Token', key);  
//        xmlHttp.send(data);     
//    })
//    .catch(function(error) {
//      console.log(JSON.stringify(error));
//    });         
    
//    fetch('http://localhost:8080/rest/session/token', {credentials: 'include'})
//    .then((resp) => resp.text())
//    .then(function(key) {
//        var data = '{"_links":{"type":{"href":"http://localhost:8080/rest/type/node/article"}}, "texttest":[{"value":"MULTIPOLYGON (((47.052715301514 9.4778022766113, 47.06640625 9.4737567901611, 47.094188690185 9.5233325958251, 47.181838989258 9.4864015579223, 47.052715301514 9.4778022766113)))"}],"type":[{"target_id":"article"}]}';
//        var mimeType = "application/hal+json";      //hal+json
//        var xmlHttp = new XMLHttpRequest();
//        xmlHttp.open('PATCH', 'http://localhost:8080/node/13?_format=hal_json', true);  // true : asynchrone false: synchrone
//        xmlHttp.setRequestHeader('Content-Type', mimeType);  
//        xmlHttp.setRequestHeader('X-CSRF-Token', key);  
//        xmlHttp.send(data);     
//   })
//    .catch(function(error) {
//      console.log(JSON.stringify(error));
//    });         
//  }

  fetch(window.mapCom.getTokenUrl(), {credentials: 'include'})
  .then((resp) => resp.text())
  .then(function(key) {
      var wkt = new Wkt.Wkt();
      wkt.fromJson(e.layer.toGeoJSON());
      var data = '{"_links":{"type":{"href":"' + window.mapCom.getHostname() + '/rest/type/group/study"}}, "field_area":[{"value":"' + wkt.write() + '"}],"type":[{"target_id":"study"}]}';
//      var data = '{"_links":{"type":{"href":"http://localhost:8080/rest/type/group/study"}}, "field_area":[{"value":"MULTIPOLYGON (((47.052715301514 9.4778022766113, 47.06640625 9.4737567901611, 47.094188690185 9.5233325958251, 47.181838989258 9.4864015579223, 47.052715301514 9.4778022766113)))"}],"type":[{"target_id":"study"}]}';
      var mimeType = "application/hal+json";      //hal+json
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open('PATCH', window.mapCom.getHostname() + '/study/' + window.mapCom.getStudyId() + '?_format=hal_json', true);  // true : asynchrone false: synchrone
      xmlHttp.setRequestHeader('Content-Type', mimeType);  
      xmlHttp.setRequestHeader('X-CSRF-Token', key);  
      xmlHttp.send(data);     
      window.mapCom.invokeCallbackFunction(wkt.write());
  })
  .catch(function(error) {
    console.log(JSON.stringify(error));
  });         
}
_onFeatureGroupReady(reactFGref) {

 }
  componentDidMount () {
    const map = this.refs.map.leafletElement
    map.invalidateSize();
  }
  
  init() {
    const map = this.refs.map.leafletElement
    map.invalidateSize();
  }
  
  render() {
    const position = [this.state.lat, this.state.lng]
    
    if (this.state.geom == null) {
//        window.map = (
//          <Map ref='map'  center={position} zoom={this.state.zoom}>
//            <TileLayer
//              attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
//              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//            />
//            <Marker position={position}>
//              <Popup>
//                A pretty CSS3 popup. <br /> Easily customizable.
//              </Popup>
//            </Marker>
//          </Map>
//        )
    window.map =  (
      <Map ref='map' touchExtend="false" center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <WMSTileLayer
          layers="clarity:CLY_POPULATION_1758"
          url="https://service.emikat.at/geoserver/clarity/wms"
          transparent="true"
          opacity="0.5"
          />
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_water"
          url="http://5.79.69.33:8080/geoserver/clarity/wms"
          transparent="true"
          opacity="0.5"
          />
      </Map>
    )
  } else {
        const pol = this.state.geom;
        window.map =  (
          <Map ref='map' touchExtend="false" center={position} zoom={this.state.zoom}>
            <Polygon positions={pol} color="blue" />
            <TileLayer
              attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <WMSTileLayer
              layers="clarity:CLY_POPULATION_1758"
              url="https://service.emikat.at/geoserver/clarity/wms"
              transparent="true"
              opacity="0.5"
            />
            <WMSTileLayer
              layers="it003l3_napoli_ua2012_water"
              url="http://5.79.69.33:8080/geoserver/clarity/wms"
              transparent="true"
              opacity="0.5"
            />
            <FeatureGroup>
              <EditControl
                position='topright'
                onCreated={this._onCreated}
                draw={{
                  rectangle: false
                }}
              />
            </FeatureGroup>                    
          </Map>
      )
    }
    
    return window.map;
  }
}


const ma = <MapComp />;

const mapComp = ReactDOM.render(ma, document.getElementById('map-container'));
window.mapCom = mapComp;
document.getElementById('map-container').style.width = "600px";
document.getElementById('map-container').style.height = "500px";