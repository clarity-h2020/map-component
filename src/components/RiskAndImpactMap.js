import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';
import Wkt from 'wicket';
import turf from 'turf';

//const RiskAndImpactMap = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/RiskAndImpact.png' />);
//};

export default class RiskAndImpactMap extends React.Component {
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
            groupTitle: 'Damage Level 1',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE1',
            title: 'Map impact results over all vulnerability classes DM1 event 1',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
            style: 'DamageLevel1Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 1',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE2',
            title: 'Map impact results over all vulnerability classes DM1 event 2',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
            style: 'DamageLevel1Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 1',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE3',
            title: 'Map impact results over all vulnerability classes DM1 event 3',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
            style: 'DamageLevel1Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 1',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE4',
            title: 'Map impact results over all vulnerability classes DM1 event 4',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
            style: 'DamageLevel1Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 2',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE1D2',
            title: 'Map impact results over all vulnerability classes DM2 event 1',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
            style: 'DamageLevel2Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 2',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE2D2',
            title: 'Map impact results over all vulnerability classes DM2 event 2',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
            style: 'DamageLevel2Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 2',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE3D2',
            title: 'Map impact results over all vulnerability classes DM2 event 3',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
            style: 'DamageLevel2Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 2',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE4D2',
            title: 'Map impact results over all vulnerability classes DM2 event 4',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
            style: 'DamageLevel2Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 3',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE1D3',
            title: 'Map impact results over all vulnerability classes DM3 event 1',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
            style: 'DamageLevel3Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 3',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE2D3',
            title: 'Map impact results over all vulnerability classes DM3 event 2',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
            style: 'DamageLevel3Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 3',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE3D3',
            title: 'Map impact results over all vulnerability classes DM3 event 3',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
            style: 'DamageLevel3Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 3',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE4D3',
            title: 'Map impact results over all vulnerability classes DM3 event 4',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
            style: 'DamageLevel3Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 4',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE1D4',
            title: 'Map impact results over all vulnerability classes DM4 event 1',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
            style: 'DamageLevel4Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 4',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE2D4',
            title: 'Map impact results over all vulnerability classes DM4 event 2',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
            style: 'DamageLevel4Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 4',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE3D4',
            title: 'Map impact results over all vulnerability classes DM4 event 3',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
            style: 'DamageLevel4Q'
          },
          {
            checked: false,
            groupTitle: 'Damage Level 4',
            name: 'vMapImpactResultOverAllVulnerabilityClassesE4D4',
            title: 'Map impact results over all vulnerability classes DM4 event 4',
            layers: 'clarity:vMapImpactResultsOverAllVulnerabilityClasses',
            url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
            style: 'DamageLevel4Q'
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
                    color: "black",
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
            bounds: this.getBoundsFromArea(JSON.parse(geome)),
            studyAreaPolygon: study
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

    print() {
      var callback = function (b) {
              prompt(b);
      }
      html2canvas(document.getElementById("riskAndImpact-map-container")).then(canvas => {
      canvas.toBlob(callback)});
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


//export default RiskAndImpactMap;

if (document.getElementById('riskAndImpact-map-container') != null) {
    ReactDOM.render(<RiskAndImpactMap />, document.getElementById('riskAndImpact-map-container'));
    document.getElementById('riskAndImpact-map-container').style.width = "100%";
    document.getElementById('riskAndImpact-map-container').style.height = "500px";
}