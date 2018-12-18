import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl} from 'react-leaflet-grouped-layer-control';
import turf from 'turf';
import StudyAreaMap from './commons/StudyAreaMap';


export default class StudyArea extends React.Component {
  constructor(props) {
    super(props);
    this.props.geometry = { "type": "Polygon",
      "coordinates": [
          [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
      ]
    };
    this.setState({
      countryPolygon: {
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
        "geometry": this.props.geometry
      }
    });
  }
  
  componentDidMount () {
    const map = this.refs.map.leafletElement
    map.invalidateSize();
  }

  componentDidUpdate () {
    const map = this.refs.map.leafletElement
    map.invalidateSize();
  }

  setStudyURL(id, hostName) {
    this.setState({
        studyId: id,
        hname: hostName
    });
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + id, {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {
      var wktVar = new Wkt.Wkt();
      if (data.data[0] != null) {
        this.setUUId(data.data[0].id)
      }
      if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
        wktVar.read(data.data[0].attributes.field_area.value);
        this.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
      }
      fetch(data.data[0].relationships.field_country.links.related, {credentials: 'include'})
      .then((resp) => resp.json())
      .then(function(data) {
          var wkt = new Wkt.Wkt();
          wkt.read(data.data.attributes.field_boundaries.value);
          this.setCountryGeom(JSON.stringify(wkt.toJson()));
      })
      .catch(function(error) {
        console.log(JSON.stringify(error));
      });
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
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

  setCountryGeom(geome) {
    var centroid = turf.centroid(JSON.parse(geome));
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
    }
    this.setState({
      lat: centroid.geometry.coordinates[0],
      lng: centroid.geometry.coordinates[1],
      countryPolygon: p
    });
  }

  setStudyAreaGeom(geome) {
    this.setState({
      studyGeom: null,
      studyGeomJson: null
    }); 
  
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
          studyAreaPolygon: study
        });
    }
  }

  init() {
    const map = this.refs.map.leafletElement
    map.invalidateSize();

    this.setState({
      init: true
    });
  }

  render() {
    return (
      <StudyAreaMap 
        countryPolygon={this.state.countryPolygon}
        studyAreaPolygon={this.state.studyAreaPolygon}
        hostname={this.state.hname}
      />
    );
  }
};

