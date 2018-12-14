import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl} from 'react-leaflet-grouped-layer-control';
import '../../MapComp.css';

//todo: finish the function
const MapComponent = ({ bounds, baseLayers, checkedBaseLayer, exclusiveGroups, overlays }) => {
  return (
    <Map touchExtend="false" bounds={bounds}>
    <TileLayer
      attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <ReactLeafletGroupedLayerControl
          position="topright"
          baseLayers={baseLayers}
          checkedBaseLayer={checkedBaseLayer}
//          exclusiveGroups={exclusiveGroups}
          overlays={overlays}
//          onBaseLayerChange={onBaseLayerChange}
//          onOverlayChange={onOverlayChange}
    />
    </Map>
  );
};

export default MapComponent;