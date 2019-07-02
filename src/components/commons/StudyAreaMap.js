import React from 'react';
import ReactDOM from 'react-dom';
import { Map, TileLayer, GeoJSON, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import Wkt from 'wicket';
import turf from 'turf';
import turfWithin from '@turf/boolean-within';


export default class StudyAreaMap extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
    readOnly: true,
    canWrite: false,
    count: 1,
     studyAreaPolygon: props.studyAreaPolygon
    };
   this._onCreated.bind(this);
  }
  
  componentWillReceiveProps(nextProps){
    if (nextProps.studyAreaPolygon !== this.props.studyAreaPolygon) {
      this.setState({ studyAreaPolygon: nextProps.studyAreaPolygon })
    }
  }

  init() {
    const map = this.map.leafletElement
    map.invalidateSize();
    this.setState({count: this.state.count + 1})
  }

  _onEditResize(e) {
    var area = turf.area(e.layer.toGeoJSON());
    console.log(area);
  }

  _onCreated(e) {
    const qkmToQm = 1000000;
    const allowedSize = 500;
    var area = turf.area(e.layer.toGeoJSON());
    const comp = this;

    if (!turfWithin(e.layer.toGeoJSON(), this.props.cityPolygon)) {
      alert('The selected area is not within the selected city.');
      this.map.leafletElement.removeLayer(e.layer);
    } else if (area > (allowedSize * qkmToQm)) {
      //remove the layer, if it is too large
      alert('The selected area is too large. The allowed size is ' + allowedSize + ' km²');
      this.map.leafletElement.removeLayer(e.layer);
    } else {
      fetch(comp.getTokenUrl(), {credentials: 'include'})
      .then((resp) => resp.text())
      .then(function(key) {
          //set the new study area
          var wkt = new Wkt.Wkt();
          wkt.fromJson(e.layer.toGeoJSON());
          var data = '{"data": {"type": "group--study","id": "' + comp.props.uuid + '","attributes": {"field_area": {"value": "' + wkt.write() + '"}}}}';
          var mimeType = "application/vnd.api+json";      //hal+json
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open('PATCH', comp.props.hostname.substring(0, comp.props.hostname.length) + '/jsonapi/group/study/' + comp.props.uuid, true);  // true : asynchrone false: synchrone
          xmlHttp.setRequestHeader('Accept', 'application/vnd.api+json');  
          xmlHttp.setRequestHeader('Content-Type', mimeType);  
          xmlHttp.setRequestHeader('X-CSRF-Token', key);  
          xmlHttp.send(data);

          if (comp.state.newLayer != null) {
            comp.map.leafletElement.removeLayer(comp.state.newLayer);
          }
          comp.setState({
            studyAreaPolygon: null,
            newLayer: e.layer
          });
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

  setReadOnly(ro) {
    this.setState(
      {
        readOnly: ro
      }
    );
  }

  changeReadOnly() {
    this.setState(
      {
        readOnly: !this.state.readOnly
      }
    );
  }
  
  componentDidMount () {
    var mapElement = this.map.leafletElement;
    mapElement.setMinZoom(9);
//    mapElement.dragging.disable();
//    mapElement.touchZoom.disable();
//    mapElement.doubleClickZoom.disable();
//    mapElement.scrollWheelZoom.disable();
//    mapElement.boxZoom.disable();
//    mapElement.keyboard.disable();    
  }

  componentDidUpdate () {
    var mapElement = this.map.leafletElement;

    if (this.props.cityPolygon != null) {
      var cityGeom = this.props.cityPolygon.geometry;
      var bbox = turf.bbox(cityGeom);
      //calculate longest edge
      var pointX1 = turf.point([bbox[1], bbox[0]]);
      var pointX2 = turf.point([bbox[3], bbox[0]]);
      var width = turf.distance(pointX1, pointX2, "kilometers"); 
      var pointY1 = turf.point([bbox[1], bbox[0]]);
      var pointY2 = turf.point([bbox[1], bbox[2]]);
      var height = turf.distance(pointY1, pointY2, "kilometers");
      var longestEdge = (width > height ? width : height) * 1000;

      //calculate min zoom
      var CIRCUMFERENCE_EARTH = 40000000;
      var zoomfactor = Math.floor(Math.log2(CIRCUMFERENCE_EARTH / longestEdge) + 1);
      mapElement.setMinZoom(zoomfactor);
    }
//    mapElement.dragging.disable();
//    mapElement.touchZoom.disable();
//    mapElement.doubleClickZoom.disable();
//    mapElement.scrollWheelZoom.disable();
//    mapElement.boxZoom.disable();
//    mapElement.keyboard.disable();    
  }

  render() {
    var geometry = (this.props.cityPolygon != null ?  this.props.cityPolygon.geometry : (this.state.studyAreaPolygon != null ? this.state.studyAreaPolygon.geometry : null));

    if (geometry == null) {
      geometry = {
        "type": "Polygon",
        "coordinates": [[
            [-23.378906, 34.597042],
            [-23.378906, 69.534518],
            [48.691406, 69.534518],
            [48.691406, 34.597042],
            [-23.378906, 34.597042]
        ]]
      };
    }
    var studyAreaStyle = {
      "color": "#ff0000",
      "weight": 2,
      "opacity": 0.20
    };
    var cityStyle = {
      "color": "#0000ff",
      "weight": 6,
      "opacity": 0.10,
      "fillColor": "#0000ff",
      "fillOpacity": 0.1
};

    var mapElement = (
        <Map ref={(comp) => this.map = comp} zoomControl={true} touchExtend="false" bounds={this.getBoundsFromArea(geometry)}>
            <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {this.props.cityPolygon != null &&
              <GeoJSON style={cityStyle} data={this.props.cityPolygon} />
            }
            {this.state.studyAreaPolygon != null &&
              <GeoJSON style={studyAreaStyle} data={this.state.studyAreaPolygon} />
            }
            <FeatureGroup>
              { (this.state.readOnly == null || this.state.readOnly === false) &&
                <EditControl 
                    position='topright'
                    onCreated={this._onCreated.bind(this)}
                    draw={{
                      polygon: {
                        showArea: true,
                        metric: ['km', 'm'],
                      },
                      rectangle: {
                        showArea: true,
                        metric: ['km', 'm']
                      }
                  }}
                    onEditResize={this._onEditResize.bind(this)}
                />
              }
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
