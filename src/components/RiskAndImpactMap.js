import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';


//const RiskAndImpactMap = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/RiskAndImpact.png' />);
//};

export default class RiskAndImpactMap extends BasicMap {
    constructor(props) {
      super(props, 'eu-gl:risk-and-impact-assessment');
      const corner1 = [39.853294, 13.305573];
      const corner2 = [41.853294, 15.305573];
      this.overlaysBackup = [
        {
          checked: false,
          groupTitle: 'Damage Level 1',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE1',
          title: 'Map impact results over all vulnerability classes DM1 Temperature 28°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
          style: 'DamageLevel1Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 1',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE2',
          title: 'Map impact results over all vulnerability classes DM1 Temperature 30°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
          style: 'DamageLevel1Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 1',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE3',
          title: 'Map impact results over all vulnerability classes DM1 Temperature 32°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
          style: 'DamageLevel1Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 1',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE4',
          title: 'Map impact results over all vulnerability classes DM1 Temperature 34°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
          style: 'DamageLevel1Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 2',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE1D2',
          title: 'Map impact results over all vulnerability classes DM2 Temperature 28°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
          style: 'DamageLevel2Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 2',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE2D2',
          title: 'Map impact results over all vulnerability classes DM2 Temperature 30°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
          style: 'DamageLevel2Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 2',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE3D2',
          title: 'Map impact results over all vulnerability classes DM2 Temperature 32°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
          style: 'DamageLevel2Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 2',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE4D2',
          title: 'Map impact results over all vulnerability classes DM2 Temperature 34°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
          style: 'DamageLevel2Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 3',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE1D3',
          title: 'Map impact results over all vulnerability classes DM3 Temperature 28°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
          style: 'DamageLevel3Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 3',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE2D3',
          title: 'Map impact results over all vulnerability classes DM3 Temperature 30°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
          style: 'DamageLevel3Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 3',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE3D3',
          title: 'Map impact results over all vulnerability classes DM3 Temperature 32°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
          style: 'DamageLevel3Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 3',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE4D3',
          title: 'Map impact results over all vulnerability classes DM3 Temperature 34°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
          style: 'DamageLevel3Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 4',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE1D4',
          title: 'Map impact results over all vulnerability classes DM4 Temperature 28°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=1',
          style: 'DamageLevel4Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 4',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE2D4',
          title: 'Map impact results over all vulnerability classes DM4 Temperature 30°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=2',
          style: 'DamageLevel4Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 4',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE3D4',
          title: 'Map impact results over all vulnerability classes DM4 Temperature 32°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=3',
          style: 'DamageLevel4Q'
        },
        {
          checked: false,
          groupTitle: 'Damage Level 4',
          name: 'vMapImpactResultOverAllVulnerabilityClassesE4D4',
          title: 'Map impact results over all vulnerability classes DM4 Temperature 34°C, 6 days',
          layers: 'clarity:view.2813',
          url: 'https://service.emikat.at/geoserver/clarity/wms?cql_filter=HAZARD_EVENT_ID=4',
          style: 'DamageLevel4Q'
        }
      ];
      this.state ={
        baseLayers: [
          {
            name: 'tile-texture-1',
            title: 'OpenStreetMap',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          },
          {
            name: 'tile-texture-2',
            title: 'OpenTopoMap',
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          }
          ],
          overlays: [],
          exclusiveGroups: this.extractGroups([]),
          bounds: [corner1, corner2],
          loading: true
      };
    }


    render() {
      window.specificMapComponent = this;

      return (
        <MapComponent 
        loading={this.state.loading}
        bounds={this.state.bounds}
        baseLayers={this.state.baseLayers}
        overlays={this.state.overlays}
        exclusiveGroups={this.state.exclusiveGroups}
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