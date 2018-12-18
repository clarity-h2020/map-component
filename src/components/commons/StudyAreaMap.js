import React from 'react';
import { Map, TileLayer, GeoJSON, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import Wkt from 'wicket';
import turf from 'turf';
import '../../MapComp.css';


export default class StudyAreaMap extends React.Component {
  constructor(props) {
    super(props);
  }
  
  init() {
    const map = this.refs.map.leafletElement
    map.invalidateSize();
  }

  _onCreated(e) {
    var qmToQkm = 1000000;
    var area = turf.area(e.layer.toGeoJSON());

    if (area > (100 * qmToQkm)) {
      //remove the layer, if it is too large
      alert('The selected area is too large');
      this.refs.map.leafletElement.removeLayer(layer);
    } else {
      fetch(this.getTokenUrl(), {credentials: 'include'})
      .then((resp) => resp.text())
      .then(function(key) {
          //set the new study area
          var hostWithoutProt = this.getHostnameWithoutProtocol();
          var wkt = new Wkt.Wkt();
          wkt.fromJson(e.layer.toGeoJSON());
          var data = '{"data": {"type": "group--study","id": "' + this.props.uuid + '","attributes": {"field_area": {"value": "' + wkt.write() + '"}}}}';
          var mimeType = "application/vnd.api+json";      //hal+json
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open('PATCH', this.props.hostname.substring(0, this.props.hostname.length) + '/jsonapi/group/study/' + this.props.uuid, true);  // true : asynchrone false: synchrone
          xmlHttp.setRequestHeader('Accept', 'application/vnd.api+json');  
          xmlHttp.setRequestHeader('Content-Type', mimeType);  
          xmlHttp.setRequestHeader('X-CSRF-Token', key);  
          xmlHttp.send(data);     
          window.mapCom.setStudyAreaGeom(JSON.stringify(wkt.toJson()));
      })
      .catch(function(error) {
        console.log(JSON.stringify(error));
      });
    }
  }

  getTokenUrl() {
    return this.props.hostname + '/rest/session/token';
  }

  getBoundsFromArea(area) {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }

  getHostnameWithoutProtocol() {
    return this.props.hostname.substring( this.props.hostname.indexOf(':') + 3);
  }

  render() {
    const country = this.props.countryPolygon;
    const study = this.props.studyAreaPolygon;

    var mapElement = (
        <Map ref='map' touchExtend="false" bounds={this.getBoundsFromArea(this.props.countryPolygon.geometry)}>
            <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            (country != null &&
            <GeoJSON data={country} />
            )
            (study != null &&
              <GeoJSON data={study} />
            )
            <FeatureGroup>
            <EditControl
                position='topright'
                onCreated={this._onCreated.bind(this)}
            />
            </FeatureGroup>                    
        </Map>
    )
    window.mapCom = this;
    return mapElement;
  }
};

if (document.getElementById('study_area-map-container') != null) {
    ReactDOM.render(<StudyAreaMap />, document.getElementById('study_area-map-container'));
    document.getElementById('study_area-map-container').style.width = "100%";
    document.getElementById('study_area-map-container').style.height = "500px";
}
