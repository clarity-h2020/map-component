import React from 'react';
import ReactDOM from 'react-dom';
import { Map, Marker, Popup, TileLayer, WMSTileLayer, Polygon, MultiPolygon, FeatureGroup, Circle, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import { LayersControl } from 'leaflet-groupedlayercontrol';
import html2canvas from 'html2canvas';
import turf from 'turf';
import Wkt from 'wicket'
import '../../MapComp.css';

//todo: finish the function
const MapComponent = ({ bounds }) => {
  return (
    <Map ref='map' touchExtend="false" bounds={bounds}>
    <TileLayer
      attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <GeoJSON data={p} style={this.countryPolygonStyle}/>
    <FeatureGroup>
      <EditControl
        position='topright'
        onCreated={this._onCreated}
      />
    </FeatureGroup>                    
    </Map>
  );
};

