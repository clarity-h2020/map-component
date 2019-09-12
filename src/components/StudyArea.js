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
      cityPolygon: null,
      cityPolygonRequired: true
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
    var includes = 'include=field_study_type.field_study_calculation,field_city_region';
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + studyUuid + '&' + includes, {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {

      if (data != null && data.data[0] != null && data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
        var wkt = new Wkt.Wkt();
        wkt.read(data.data[0].attributes.field_area.value);
        _this.setStudyAreaGeom(JSON.stringify(wkt.toJson()));
      }
      const calculationMethod = 'taxonomy_term--calculation_methods';
      var calculationMethodInclude = _this.getIncludeByType(calculationMethod, data.included);
      var cityRequired = calculationMethodInclude != null && calculationMethodInclude.attributes.name === 'EMIKAT screening';
      var cityObject = _this.getIncludeByType('taxonomy_term--cities_regions', data.included);


      if (cityObject != null && cityObject.attributes.field_boundaries != null && cityObject.attributes.field_boundaries.value != null) {
        var wkt = new Wkt.Wkt();
        wkt.read(cityObject.attributes.field_boundaries.value);
        _this.setCityGeom(JSON.stringify(wkt.toJson()));
      } else {
        if (cityRequired) {
          alert("There is no city selected");
        }
      }
      if (!cityRequired) {
        _this.setState({cityPolygonRequired: cityRequired});
      }
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });         
  }

  /**
   * This method resolves the included references and extracts the inlcuded object.
   */
  getIncludeByType(type, includedArray) {
    if (type != null && includedArray != null) {
      for (let i = 0; i < includedArray.length; ++i) {
        if (includedArray[i].type === type) {
          return includedArray[i];
        }
      }
    }

    return null;
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
      "geometry": JSON.parse(geome)
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
        cityPolygonRequired={this.state.cityPolygonRequired}
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
