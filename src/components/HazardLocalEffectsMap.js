import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';


//const HazardLocalEffectsMap = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/HazardLocalEffects.png' />);
//};

export default class HazardLocalEffectsMap extends BasicMap {
    constructor(props) {
      super(props, 'eu-gl:hazard-characterization:local-effects');
      const corner1 = [39.853294, 13.305573];
      const corner2 = [41.853294, 15.305573];
      this.overlaysBackup = [
        {
          checked: false,
          groupTitle: 'Heat Wave',
          name: 'Heat_wave_temperature_historical_hight_hazard_Naples',
          title: 'Heat Wave Temperature Historical Hight Hazard Naples',
          layers: 'Heat_wave_temperature_historical_hight_hazard_Naples',
          url: 'https://clarity.meteogrid.com/geoserver/clarity/wms'
        },
        {
          checked: false,
          groupTitle: 'Heat Wave',
          name: 'Heat_wave_temperature_historical_low_hazard_Naples',
          title: 'Heat Wave Temperature Historical Low Hazard Naples',
          layers: 'Heat_wave_temperature_historical_low_hazard_Naples',
          url: 'https://clarity.meteogrid.com/geoserver/clarity/wms'
        },
        {
          checked: false,
          groupTitle: 'Heat Wave',
          name: 'Heat_wave_temperature_historical_medium_hazard_Naples',
          title: 'Heat Wave Temperature Historical Medium Hazard Naples',
          layers: 'Heat_wave_temperature_historical_medium_hazard_Naples',
          url: 'https://clarity.meteogrid.com/geoserver/clarity/wms'
        },
        {
          checked: false,
          groupTitle: "Heat Wave",
          name: "Heat_wave_temperature_historical_very_hight_hazard_Naples",
          title: "Heat Wave Temperature Historical Very Hight Hazard Naples",
          layers: "Heat_wave_temperature_historical_very_hight_hazard_Naples",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
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
            title: 'Open Topo Map',
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          }
          ],
          overlays: [],
          bounds: [corner1, corner2]
      };
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

//export default HazardLocalEffectsMap;

if (document.getElementById('hazardLocalEffects-map-container') != null) {
    ReactDOM.render(<HazardLocalEffectsMap />, document.getElementById('hazardLocalEffects-map-container'));
    document.getElementById('hazardLocalEffects-map-container').style.width = "100%";
    document.getElementById('hazardLocalEffects-map-container').style.height = "500px";
}