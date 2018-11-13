import React from 'react';
import ReactDOM from 'react-dom';
import { Map, Marker, Popup, TileLayer, WMSTileLayer, Polygon, MultiPolygon, FeatureGroup, Circle, LayersControl, GeoJSON } from 'react-leaflet';
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
      creationCallback: null,
      currentStep: null
    }
  }
  
  setView(la, ln, zo) {
      this.setState({
        lat: la,
        lng: ln,
        zoom: zo
    });
  }
  
  setLayers(urls, layers) { 
    this.setState({
      layer: layers,
      url: urls,
    });
  }

  setLayers2(urls, layers) { 
    this.setState({
      layer2: layers,
      url2: urls,
    });
  }

  setStep(step) { 
    this.setState({
      currentStep: step
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
        window.mapCom.setCountryGeom(JSON.stringify(wkt.toJson()));
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
      var wktVar = new Wkt.Wkt();
      if (data.field_area != null && data.field_area[0] != null && data.field_area[0].value != null) {
        wktVar.read(data.field_area[0].value);
        window.mapCom.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
      }
      fetch(hostName + data.field_country[0].url + '?_format=json', {credentials: 'include'})
      .then((resp) => resp.json())
      .then(function(data) {
          var wkt = new Wkt.Wkt();
          wkt.read(data.field_boundaries[0].value);
          window.mapCom.setCountryGeom(JSON.stringify(wkt.toJson()));
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
    }
  }

  getTokenUrl() {
    return this.state.hname + '/rest/session/token';
  }

  getHostname() {
    return this.state.hname;
  }

  getHostnameWithoutProtocol() {
    return this.state.hname.substring( this.state.hname.indexOf(':') + 3);
  }

  getStudyId() {
    return this.state.studyId;
  }

  _onCreated(e) {
    fetch(window.mapCom.getTokenUrl(), {credentials: 'include'})
    .then((resp) => resp.text())
    .then(function(key) {
        var hostWithoutProt = window.mapCom.getHostnameWithoutProtocol();
        var wkt = new Wkt.Wkt();
        wkt.fromJson(e.layer.toGeoJSON());
        var data = '{"_links":{"type":{"href":"' + 'http://' + hostWithoutProt.substring(0, hostWithoutProt.length) + '/rest/type/group/study"}}, "field_area":[{"value":"' + wkt.write() + '"}],"type":[{"target_id":"study"}]}';
        var mimeType = "application/hal+json";      //hal+json
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('PATCH', window.mapCom.getHostname().substring(0, window.mapCom.getHostname().length) + '/study/' + window.mapCom.getStudyId() + '?_format=hal_json', true);  // true : asynchrone false: synchrone
        xmlHttp.setRequestHeader('Content-Type', mimeType);  
        xmlHttp.setRequestHeader('X-CSRF-Token', key);  
        xmlHttp.send(data);     
        window.mapCom.setStudyAreaGeom(JSON.stringify(wkt.toJson()));
  //      window.mapCom.invokeCallbackFunction(wkt.write());
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
    const position = [this.state.lat, this.state.lng] 
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
    var allLayers = null;

    if (this.state.currentStep != null && Number.isInteger(Number(this.state.currentStep))) {
      if (!((this.state.layer == null || this.state.layer2 == null)  || this.state.currentStep != '83')) {
        allLayers =  (
        <React.Fragment>
        <LayersControl.Overlay name="agricultural areas" checked="true">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_agricultural_areas"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="buildings" checked="true">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_biuldings"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="dense urban fabric" checked="false">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_dense_urban_fabric"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="low urban fabric" checked="false">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_low_urban_fabric"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="medium urban fabric" checked="false">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_medium_urban_fabric"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="public military industrial" checked="false">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_public_military_industrial"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="railways" checked="true">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_railways"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="roads" checked="true">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_roads"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="trees" checked="false">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_trees"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="vegetation" checked="true">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_vegetation"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      <LayersControl.Overlay name="water" checked="false">    
        <WMSTileLayer
          layers="it003l3_napoli_ua2012_water"
          url={this.state.url2}
          transparent="true"
          opacity="0.5"
        />
      </LayersControl.Overlay>
      </React.Fragment>
      )
    }
  }  
//    if (this.state.geom == null || this.state.layer != null) {
    if (this.state.currentStep != null && Number.isInteger(Number(this.state.currentStep))) {
      if ((this.state.layer == null || this.state.layer2 == null) || this.state.currentStep != '83') {
        if (this.state.studyGeomJson != null) {
          window.map =  (
            <Map ref='map' touchExtend="false" bounds={this.getBoundsFromArea(this.state.studyGeomJson)}>
              <TileLayer
                attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON data={study} style={this.countryPolygonStyle} />
            </Map>
          )
        } else {
          window.map =  (
            <Map ref='map' touchExtend="false" center={position} zoom={this.state.zoom}>
              <TileLayer
                attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </Map>
          )
        }
      } else {
        if (this.state.studyGeomJson == null) {
          window.map =  (
            <Map ref='map' touchExtend="false" center={position} zoom={this.state.zoom}>
            <LayersControl position="topright"> 
              <LayersControl.BaseLayer name="OpenStreetMap.Mapnik" checked="true">    
                <TileLayer
                  attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.Overlay name="agricultural areas" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_agricultural_areas"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="buildings" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_biuldings"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="dense urban fabric" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_dense_urban_fabric"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="low urban fabric" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_low_urban_fabric"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="medium urban fabric" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_medium_urban_fabric"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="public military industrial" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_public_military_industrial"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="railways" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_railways"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="roads" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_roads"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="trees" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_trees"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="vegetation" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_vegetation"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="water" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_water"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Population Density" checked="true">    
                <WMSTileLayer
                  layers={this.state.layer}
                  url={this.state.url}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
            </LayersControl>
            </Map>
          )
        } else {
          window.map =  (
            <Map ref='map' touchExtend="false" bounds={this.getBoundsFromArea(this.state.studyGeomJson)}>
            <LayersControl position="topright"> 
              <LayersControl.BaseLayer name="OpenStreetMap.Mapnik" checked="true">    
                <TileLayer
                  attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.Overlay name="agricultural areas" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_agricultural_areas"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="buildings" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_biuldings"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="dense urban fabric" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_dense_urban_fabric"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="low urban fabric" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_low_urban_fabric"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="medium urban fabric" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_medium_urban_fabric"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="public military industrial" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_public_military_industrial"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="railways" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_railways"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="roads" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_roads"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="trees" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_trees"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="vegetation" checked="true">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_vegetation"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="water" checked="false">    
                <WMSTileLayer
                  layers="it003l3_napoli_ua2012_water"
                  url={this.state.url2}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Population Density" checked="true">    
                <WMSTileLayer
                  layers={this.state.layer}
                  url={this.state.url}
                  transparent="true"
                  opacity="0.5"
                />
              </LayersControl.Overlay>
              <GeoJSON data={study} style={this.countryPolygonStyle} />
            </LayersControl>
            </Map>
          )
        } 
      }
    } else {
        const pol = this.state.geom;
//        var st = {
//          weight: 2,
//          opacity: 1,
//          color: 'white',
//          dashArray: '3',
//          fillOpacity: 0.1,
//          fillColor: '#FF0000'
//      };

//      <Polygon positions={pol} setStyle={this.countryPolygonStyle}/>
     if (this.state.geomJson == null) {
      window.map =  (
        <Map ref='map' touchExtend="false" center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </Map>
      )
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
      }

  //    <Map ref='map' touchExtend="false" center={position} zoom={zoom}>
      if (study != null) {
        window.map =  (
              <Map ref='map' touchExtend="false" bounds={this.getBoundsFromArea(this.state.geomJson)}>
                <TileLayer
                  attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON data={p} style={this.countryPolygonStyle}/>
                <GeoJSON data={study} style={this.countryPolygonStyle} />
                <FeatureGroup>
                  <EditControl
                    position='topright'
                    onCreated={this._onCreated}
                  />
                </FeatureGroup>                    
              </Map>
          )
        } else {
          window.map =  (
            <Map ref='map' touchExtend="false" bounds={this.getBoundsFromArea(this.state.geomJson)}>
              <TileLayer
                attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON data={p} style={this.countryPolygonStyle}/>
              <FeatureGroup>
                <EditControl
                  position='topright'
                  onCreated={this._onCreated}
                />
              </FeatureGroup>                    
            </Map>
        )
        }
      }
    }
//    draw={{
//      rectangle: false
//    }}

    return window.map;
  }
}


const ma = <MapComp />;

const mapComp = ReactDOM.render(ma, document.getElementById('map-container'));
window.mapCom = mapComp;
//document.getElementById('map-container').style.width = "600px";
//document.getElementById('map-container').style.height = "500px";
document.getElementById('map-container').style.width = "100%";
document.getElementById('map-container').style.height = "500px";
//document.getElementById('map-container').style.width = "800px";
//document.getElementById('map-container').style.height = "400px";
