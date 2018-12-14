import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';

//const ExposureMap = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/Exposure.png' />);
//};

const ExposureMap = () => {
  var baseLayers = [
    {
      name: 'tile-texture-1',
      title: 'OpenStreetMap'
    },
    {
      name: 'tile-texture-2',
      title: 'ThunderForest'
    }
  ];
  var checkedBaseLayer = 'tile-texture-1';
  var overlays = [
    {
      checked: true,
      groupTitle: 'Heats',
      name: 'heat-1',
      title: 'Heat'
    },
    {
      checked: false,
      groupTitle: "Grids",
      name: "grid-1",
      title: "Grid"
    },
    {
      checked: true,
      groupTitle: "Choropleths",
      name: "choropleth-1",
      title: "City Choropleth Layer"
    },
    {
      checked:false,
      groupTitle:"Choropleths",
      name:"choropleth-2",
      title:"District Choropleth Layer"
    },
    {
      checked:false,
      groupTitle:"Choropleths",
      name:"None",
      title:"None"
    },
    {
      checked:true,
      groupTitle:"Marker Clusters",
      name:"2g_sites",
      title:"2G-Sites"
    },
    {
      checked:false,
      groupTitle:"Marker Clusters",
      name:"3g_sites",
      title:"3G-Sites"
    },
    {
      checked:false,
      groupTitle:"Marker Clusters",
      name:"4.5g_sites",
      title:"4.5G-Sites"
    }
  ]
  const corner1 = [39.853294, 13.305573];
  const corner2 = [41.853294, 15.305573];
  var bounds = [corner1, corner2];

  return (
    <MapComponent 
      bounds={bounds}
      baseLayers={baseLayers}
      checkedBaseLayer={checkedBaseLayer}
      exclusiveGroups={{}}
      overlays={overlays} />
    );
};

export default ExposureMap;

if (document.getElementById('exposure-map-container') != null) {
  ReactDOM.render(<ExposureMap />, document.getElementById('exposure-map-container'));
}