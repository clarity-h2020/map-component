import React from 'react';
import ReactDOM from 'react-dom';
import turf from 'turf';
import Wkt from 'wicket';
import StudyAreaMap from './commons/StudyAreaMap';


export default class StudyArea extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      cityPolygon: null
    };
  }
  
  setStudyURL(id, hostName) {
    this.setState({
        studyId: id,
        hname: hostName
    });
    const comp = this;
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + id, {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {
      var wktVar = new Wkt.Wkt();
      if (data.data[0] != null) {
        comp.setUUId(data.data[0].id)
      }
      // if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
      //   wktVar.read(data.data[0].attributes.field_area.value);
      //   comp.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
      // }

      fetch(hostName + "/rest/study/" + data.data[0].attributes.drupal_internal__id + "/area?_format=json", {credentials: 'include'})
      .then((resp) => resp.json())
      .then(function(data) {
        var wkt = new Wkt.Wkt();
        wkt.read(data[0].field_area);
        comp.setStudyAreaGeom(JSON.stringify(wkt.toJson()));
      })
      .catch(function(error) {
        console.log(JSON.stringify(error));
      });

     fetch(data.data[0].relationships.field_city_region.links.related.href.replace('http:', 'http:'), {credentials: 'include'})
      .then((resp) => resp.json())
      .then(function(data) {
          var wkt = new Wkt.Wkt();
          wkt.read(data.data.attributes.field_boundaries.value);
          comp.setCityGeom(JSON.stringify(wkt.toJson()));
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

  setCityGeom(geome) {
    var p = {
      "type": "Feature",
      "properties": {
          "popupContent": "country",
          "style": {
              weight: 2,
              color: "black",
              opacity: 0.3,
              fillColor: "#0000ff",
              fillOpacity: 0.0
          }
      },
      "geometry": turf.flip(JSON.parse(geome))
    }
    this.setState({
            cityPolygon: null
          });
    this.setState({
      cityPolygon: p
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
                  opacity: 1,
                  fillColor: "#ff0000",
                  fillOpacity: 0.10
              }
          },
          "geometry": JSON.parse(geome)
        };
        this.setState({
          studyAreaPolygon: null
        });
        this.setState({
          studyAreaPolygon: study
        });
    }
  }

  init() {
    this.setState({
      init: true
    });
  }

  render() {
    window.studyArea = this;

    return (
      <StudyAreaMap 
        cityPolygon={this.state.cityPolygon}
        studyAreaPolygon={this.state.studyAreaPolygon}
        hostname={this.state.hname}
        uuid={this.state.uuid}
      />
    );
  }
};

if (document.getElementById('study-area-map-container') != null) {
  ReactDOM.render(<StudyArea />, document.getElementById('study-area-map-container'));
  document.getElementById('study-area-map-container').style.width = "100%";
  document.getElementById('study-area-map-container').style.height = "500px";
}
