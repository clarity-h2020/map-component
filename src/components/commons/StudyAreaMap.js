import React from 'react';
import ReactDOM from 'react-dom';
import { Map, TileLayer, GeoJSON, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import Wkt from 'wicket';
import turf from 'turf';


export default class StudyAreaMap extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
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
    const map = this.refs.map.leafletElement
    map.invalidateSize();
    this.setState({count: ++this.state.count})
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

    if (area > (allowedSize * qkmToQm)) {
      //remove the layer, if it is too large
      alert('The selected area is too large. The allowed size is ' + allowedSize + ' km²');
      this.refs.map.leafletElement.removeLayer(e.layer);
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
            "geometry": wkt.toJson()
          };
          if (comp.state.newLayer != null) {
            comp.refs.map.leafletElement.removeLayer(comp.state.newLayer);
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

  componentDidMount () {
    const map = this.refs.map.leafletElement;
    map.bindTooltip
  }


  render() {
    var geometry = (this.props.countryPolygon != null ? this.props.countryPolygon.geometry : null);

    if (geometry == null) {
      geometry = {
        "type": "Polygon",
        "coordinates": [[
            [48.505, 2.09],
            [50.505, 2.09],
            [50.505, 4.09],
            [48.505, 4.09],
            [48.505, 2.09]
        ]]
      };
    }
    var area = true;
    var studyAreaStyle = {
      "color": "#ff0000",
      "weight": 2,
      "opacity": 0.20
    };

    var mapElement = (
        <Map ref='map' touchExtend="false" bounds={this.getBoundsFromArea(geometry)}>
            <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {this.props.countryPolygon != null &&
              <GeoJSON data={this.props.countryPolygon} />
            }
            {this.state.studyAreaPolygon != null &&
              <GeoJSON style={studyAreaStyle} data={this.state.studyAreaPolygon} />
            }
            <FeatureGroup>
              { (this.state.readOnly == null || this.state.readOnly == false) &&
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
