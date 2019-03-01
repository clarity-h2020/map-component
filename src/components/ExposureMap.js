import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';
import Wkt from 'wicket';
import turf from 'turf';

//const ExposureMap = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/Exposure.png' />);
//};


export default class ExposureMap extends React.Component {
    constructor(props) {
      super(props);
      const corner1 = [39.853294, 13.305573];
      const corner2 = [41.853294, 15.305573];
      this.state ={
        baseLayers: [
          {
            name: 'tile-texture-1',
            title: 'OpenStreetMap',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        ],
        overlays: [
          {
            checked: false,
            groupTitle: 'Population',
            name: 'pop-15-65',
            title: 'population 15-65',
            layers: 'clarity:Population_15to65_naples',
            url: 'https://clarity.meteogrid.com/geoserver/clarity/wms'
          },
          {
            checked: false,
            groupTitle: 'Population',
            name: 'pop-65',
            title: 'population >65',
            layers: 'clarity:Population_mayor65_naples',
            url: 'https://clarity.meteogrid.com/geoserver/clarity/wms'
          },
          {
            checked: false,
            groupTitle: 'Population',
            name: 'pop-15',
            title: 'population >15',
            layers: '	clarity:Population_men15_naples',
            url: 'https://clarity.meteogrid.com/geoserver/clarity/wms'
          }
        ],
        bounds: [corner1, corner2]
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
        if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
          wktVar.read(data.data[0].attributes.field_area.value);
          comp.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
        }
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

    setStudyAreaGeom(geome) {
      if (geome != null) {
          var study = {
            "type": "Feature",
            "properties": {
                "popupContent": "study",
                "style": {
                    weight: 2,
                    color: "red",
                    opacity: 0.3,
                    fillColor: "#ff0000",
                    fillOpacity: 0.1
                }
            },
            "geometry": JSON.parse(geome)
          };
          this.setState({
            studyAreaPolygon: null
          });
          this.setState({
            studyAreaPolygon: study,
            bounds: this.getBoundsFromArea(JSON.parse(geome))
          });
      }
    }

    getBoundsFromArea(area) {
      const bboxArray = turf.bbox(area);
      const corner1 = [bboxArray[1], bboxArray[0]];
      const corner2 = [bboxArray[3], bboxArray[2]];
      var bounds = [corner1, corner2];
  
      return bounds;
    }


    render() {
      window.specificMapComponent = this;

      return (
        <MapComponent 
        bounds={this.state.bounds}
        baseLayers={this.state.baseLayers}
        exclusiveGroups={{}}
        overlays={this.state.overlays}
        studyAreaPolygon={this.state.studyAreaPolygon} />
      );
    }
};

//export default ExposureMap;

if (document.getElementById('exposure-map-container') != null) {
  ReactDOM.render(<ExposureMap />, document.getElementById('exposure-map-container'));
  document.getElementById('exposure-map-container').style.width = "100%";
  document.getElementById('exposure-map-container').style.height = "500px";
}