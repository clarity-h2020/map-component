import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';



export default class ExposureMap extends BasicMap {
    constructor(props) {
      super(props, 'eu-gl:exposure-evaluation');
      const corner1 = [39.853294, 13.305573];
      const corner2 = [41.853294, 15.305573];
      this.overlaysBackup = [
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

    /**
     * Render the map
     */
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


if (document.getElementById('exposure-map-container') != null) {
  ReactDOM.render(<ExposureMap />, document.getElementById('exposure-map-container'));
  document.getElementById('exposure-map-container').style.width = "100%";
  document.getElementById('exposure-map-container').style.height = "500px";
}