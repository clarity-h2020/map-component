import React from 'react';
import { Map, TileLayer, GeoJSON, WMSTileLayer } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl} from 'react-leaflet-grouped-layer-control';
import '../../MapComp.css';


export default class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studyAreaPolygon: props.studyAreaPolygon,
      bounds: props.bounds,
      checkedBaseLayer: props.checkedBaseLayer,
      overlays: props.overlays
    }
    this.baseLayers = props.baseLayers;
    this.maps = props.maps;
    this.tileLayerUrl = props.tileLayerUrl;
  }
  
//  const MapComponent = ({ bounds, baseLayers, checkedBaseLayer, exclusiveGroups, overlays }) => {
  componentDidMount () {
    const map = this.refs.map.leafletElement
    map.invalidateSize();
  }

  componentDidUpdate () {
    const map = this.refs.map.leafletElement
    map.invalidateSize();
  }

  init() {
    const map = this.refs.map.leafletElement
    map.invalidateSize();

    this.setState({
      init: true
    });
  }

  baseLayerChange(baseTitle) {
    if (baseTitle === this.state.checkedBaseLayer) { return false; }
    console.warn(baseTitle)
    this.tileLayerUrl = this.props.maps[this.props.baseLayers.map((e, i) => { return (e.name === baseTitle) ? String(i) : false }).filter(e => e)[0] | 0] || this.props.maps[0];
//    this.checkedBaseLayer = baseTitle;
    this.setState({checkedBaseLayer: baseTitle})
    this.setState({count: ++this.state.count})
  }

  overlayChange(newOverlays) {
    this.state.overlays = [...newOverlays];
    this.setState({
      count: ++this.state.count
    })
  }

  getUrl(name) {
    for (var i = 0;i <  this.props.overlays.length; i++) {
      if (this.props.overlays[i].name == name) {
        return this.props.overlays[i].url;
      }
    }

    return " ";
  }

  getLayers(name) {
    for (var i = 0;i <  this.props.overlays.length; i++) {
      if (this.props.overlays[i].name == name) {
        return this.props.overlays[i].layers;
      }
    }

    return " ";
  }

  render() {
    var opac = 0.5;
    var mapElement = (
    <Map ref='map'
        className="simpleMap"
        scrollWheelZoom={false}
        bounds={this.props.bounds}
        >
      {this.props.studyAreaPolygon != null &&
        <GeoJSON data={this.props.studyAreaPolygon} />
      }
      <TileLayer noWrap={true} url={this.props.tileLayerUrl} />
      {
          this.state.overlays.filter(e => e.name === 'pop-1980')[0].checked ? 
            <WMSTileLayer
              layers={this.getLayers('pop-1980')}
              url={this.getUrl('pop-1980')}
              transparent="true"
              opacity={opac}
            /> : null
      }
      {
          this.state.overlays.filter(e => e.name === 'buildings_naple')[0].checked ? 
          <WMSTileLayer
            layers={this.getLayers('buildings_naple')}
            url={this.getUrl('buildings_naple')}
            transparent="true"
            opacity={opac}
          /> : null
      }
      {
          this.state.overlays.filter(e => e.name === 'streets_naple')[0].checked ? 
          <WMSTileLayer
            layers={this.getLayers('streets_naple')}
            url={this.getUrl('streets_naple')}
            transparent="true"
            opacity={opac}
          /> : null
      }
      <ReactLeafletGroupedLayerControl
        position="topright"
        baseLayers={this.props.baseLayers}
        checkedBaseLayer={this.state.checkedBaseLayer}
        overlays={this.state.overlays}
        onBaseLayerChange={this.baseLayerChange.bind(this)}
        onOverlayChange={this.overlayChange.bind(this)}
      />
    </Map>
   )
    window.mapCom = this;
    return mapElement;
  }
};

