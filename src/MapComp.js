import React from 'react';
import ReactDOM from 'react-dom';
import { Map, Marker, Popup, TileLayer, WMSTileLayer, Polygon, MultiPolygon, FeatureGroup, Circle } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import html2canvas from 'html2canvas';
import turf from 'turf';
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
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
        window.mapCom.setGeom(data.field_study_area[0].value);
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
    fetch('http://localhost:8080/selectedCountryNodes?_format=json')
    .then((resp) => resp.json())
    .then(function(data) {
        for (var co in data) {
              if (data[co].field_country == name) {
                  window.mapCom.setPolygonURL('http://localhost:8080/taxonomy/term/' + data[co].tid + '?_format=json');
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

  _onCreated(e) {
    window.mapCom.invokeCallbackFunction(JSON.stringify(e.layer.toGeoJSON()));
//    fetch('http://localhost:8080/rest/session/token')
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
    
    fetch('http://localhost:8080/rest/session/token')
    .then((resp) => resp.text())
    .then(function(key) {
        var data = '{"_links":{"type":{"href":"http://localhost:8080/rest/type/node/article"}}, "texttest":{"value":"MULTIPOLYGON (((47.052715301514 9.4778022766113, 47.06640625 9.4737567901611, 47.094188690185 9.5233325958251, 47.181838989258 9.4864015579223, 47.052715301514 9.4778022766113)))"}],"type":[{"target_id":"article"}}';
        var mimeType = "application/hal+json";      //hal+json
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('PATCH', 'http://localhost:8080/node/13?_format=hal_json', true);  // true : asynchrone false: synchrone
        xmlHttp.setRequestHeader('Content-Type', mimeType);  
        xmlHttp.setRequestHeader('X-CSRF-Token', key);  
        xmlHttp.send(data);     
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });         
  }

  _onFeatureGroupReady(reactFGref) {

 }
  componentDidMount () {
    const map = this.refs.map.leafletElement
//    map.invalidateSize();
  }
  
  
  render() {
    const position = [this.state.lat, this.state.lng]
    
    if (this.state.geom == null) {
        window.map = (
          <Map ref='map'  center={position} zoom={this.state.zoom}>
            <TileLayer
              attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
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