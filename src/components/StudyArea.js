import React from 'react';
import ReactDOM from 'react-dom';
import turf from 'turf';
import Wkt from 'wicket';
import StudyAreaMap from './commons/StudyAreaMap';

/**
 * This class is used by drupal to show the study area
 */
export default class StudyArea extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      cityPolygon: null
    };

    /**
     * The protocol that is used by the server. The protocol of the server is https://, but for local testing it can be changed to http://
     */
    this.protocol = 'https://';
  }
  
  /**
   * Starts the loading of the selected city and the study area and render them on the map
   * 
   * @param {Number} studyUuid 
   * @param {String} hostName 
   */
  setStudyURL(studyUuid, hostName) {
    this.setState({
        studyUuid: studyUuid,
        hname: hostName
    });
    const _this = this;
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + studyUuid, {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {

      fetch(hostName + "/rest/study/" + data.data[0].attributes.drupal_internal__id + "/area?_format=json", {credentials: 'include'})
      .then((resp) => resp.json())
      .then(function(data) {
        var wkt = new Wkt.Wkt();
        wkt.read(data[0].field_area);
        _this.setStudyAreaGeom(JSON.stringify(wkt.toJson()));
      })
      .catch(function(error) {
        console.log(JSON.stringify(error));
      });

     fetch(data.data[0].relationships.field_city_region.links.related.href.replace('http:', _this.protocol), {credentials: 'include'})
      .then((resp) => resp.json())
      .then(function(data) {
          var wkt = new Wkt.Wkt();
          wkt.read(data.data.attributes.field_boundaries.value);
          _this.setCityGeom(JSON.stringify(wkt.toJson()));
      })
      .catch(function(error) {
        console.log(JSON.stringify(error));
      });
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });         
  }

  /**
   * Set the city geometry and render it on the map
   * 
   * @param {Object} geome 
   */
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

  /**
   * Set the study area geometry and render it on the map
   * 
   * @param {Object} geome 
   */
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

  /**
   * Renders the study area
   */
  render() {
    window.studyArea = this;

    return (
      <StudyAreaMap 
        cityPolygon={this.state.cityPolygon}
        studyAreaPolygon={this.state.studyAreaPolygon}
        hostname={this.state.hname}
        uuid={this.state.studyUuid}
      />
    );
  }
};

if (document.getElementById('study-area-map-container') != null) {
  ReactDOM.render(<StudyArea />, document.getElementById('study-area-map-container'));
  document.getElementById('study-area-map-container').style.width = "100%";
  document.getElementById('study-area-map-container').style.height = "500px";
}
