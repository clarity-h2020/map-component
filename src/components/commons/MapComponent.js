import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl} from 'react-leaflet-grouped-layer-control';
import '../../MapComp.css';


export default class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bounds: props.bounds,
      checkedBaseLayer: props.checkedBaseLayer,
      overlays: props.overlays
    }
    this.baseLayers = props.baseLayers;
    this.bounds = props.bounds;
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

  render() {
    var mapElement = (
    <Map ref='map'
        className="simpleMap"
        scrollWheelZoom={false}
        bounds={this.state.bounds}
        >
      <TileLayer noWrap={true} url={this.props.tileLayerUrl} />
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

