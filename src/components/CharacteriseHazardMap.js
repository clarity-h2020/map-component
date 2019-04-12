import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';
import { runInThisContext } from "vm";


//const CharacteriseHazardMap = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/CharacteriseHazard.png' />);
//};

export default class CharacteriseHazardMap extends BasicMap {
  constructor(props) {
    super(props, 'eu-gl:hazard-characterization');
    const corner1 = [39.853294, 13.305573];
    const corner2 = [41.853294, 15.305573];
    this.overlaysBackup = [
      {
        checked: false,
        groupTitle: "Heat Wave",
        name: "Heat_Waves_1971_-_2001",
        title: "Heat Waves 1971 - 2001 RCP26",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_historical_r12i1p1_SMHI-RCA4_v1_day_19710101-20001231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2011_-_2040",
        title:"Heat Waves 2011 - 2040 RCP26",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp26_r12i1p1_SMHI-RCA4_v1_day_20110101-20401231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2041_-_2070",
        title:"Heat Waves 2041 - 2070 RCP26",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp26_r12i1p1_SMHI-RCA4_v1_day_20410101-20701231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2071_-_2100",
        title:"Heat Waves 2071 - 2100 RCP26",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp26_r12i1p1_SMHI-RCA4_v1_day_20710101-21001231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2011_-_2040_rcp_45",
        title:"Heat_Waves 2011 - 2040 RCP45",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp45_r12i1p1_SMHI-RCA4_v1_day_20110101-20401231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2041_-_2070_rcp_45",
        title:"Heat_Waves 2041 - 2070 RCP45",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp45_r12i1p1_SMHI-RCA4_v1_day_20410101-20701231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2071_-_2100_rcp_45",
        title:"Heat_Waves 2071 - 2100 RCP45",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp45_r12i1p1_SMHI-RCA4_v1_day_20710101-21001231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2011_-_2040_rcp_85",
        title:"Heat_Waves 2011 - 2040 RCP85",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp85_r12i1p1_SMHI-RCA4_v1_day_20110101-20401231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2041_-_2070_rcp_85",
        title:"Heat_Waves 2041 - 2070 RCP85",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp85_r12i1p1_SMHI-RCA4_v1_day_20410101-20701231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      },
      {
        checked:false,
        groupTitle:"Heat Wave",
        name:"Heat_Waves_2071_-_2100_rcp_85",
        title:"Heat_Waves 2071 - 2100 RCP85",
        layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp85_r12i1p1_SMHI-RCA4_v1_day_20710101-21001231_netcdf3",
        url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
      }
    ];    
    var overlays = [];
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
      overlays: overlays,
      exclusiveGroups: this.extractGroups(overlays),
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
      exclusiveGroups={{}}
      overlays={this.state.overlays}
      studyAreaPolygon={this.state.studyAreaPolygon}
      exclusiveGroups={this.state.exclusiveGroups} />
    );
  }
};
  
//export default CharacteriseHazardMap;

if (document.getElementById('characteriseHazard-map-container') != null) {
    ReactDOM.render(<CharacteriseHazardMap />, document.getElementById('characteriseHazard-map-container'));
    document.getElementById('characteriseHazard-map-container').style.width = "100%";
    document.getElementById('characteriseHazard-map-container').style.height = "500px";
  }