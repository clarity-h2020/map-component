import React from 'react';
import { Map, TileLayer, GeoJSON, WMSTileLayer } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl} from 'react-leaflet-grouped-layer-control';
import turf from 'turf';
import '../../MapComp.css';


export default class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studyAreaPolygon: props.studyAreaPolygon,
      bounds: props.bounds,
      checkedBaseLayer: props.checkedBaseLayer,
      overlays: props.overlays,
      fly: true
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
    var zoom = this.getLastZoom();
    if ((zoom == null || zoom == 0) && (this.props.studyAreaPolygon != null)) {
      map.flyToBounds(this.getBoundsFromArea(this.props.studyAreaPolygon), null);
    }
    var groupTitles = document.getElementsByClassName("rlglc-grouptitle");
    const self = this;

    for (var i = 0; i < groupTitles.length; ++i) {
      const el = groupTitles[i];
      groupTitles[i].addEventListener("click", function() {self.showHide(el)})
    }
  }

  getBoundsFromArea(area) {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }

  showHide(el) {
    var parent = el.parentElement;
    var sibling = el.nextElementSibling

    if (parent != null) {
      if (parent.classList.contains('hiddenGroupHeader')) {
        parent.classList.remove('hiddenGroupHeader');
      } else {
        parent.classList.add('hiddenGroupHeader');
      }
    }

    while (sibling != null) {
      if (sibling.classList.contains('hiddenGroup')) {
        sibling.classList.remove('hiddenGroup');
      } else {
        sibling.classList.add('hiddenGroup');
      }

      sibling = sibling.nextElementSibling;
    }
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
      if (this.props.overlays[i].name === name) {
        return this.props.overlays[i].url;
      }
    }

    return " ";
  }

  getLayers(name) {
    for (var i = 0;i <  this.props.overlays.length; i++) {
      if (this.props.overlays[i].name === name) {
        return this.props.overlays[i].layers;
      }
    }

    return " ";
  }

  createLayer(d) {
    var layerArray = [];
    var opac = 0.5;

    for (var i = 0; i < d.length; ++i) {
      var obj = d[i];
      if ( obj.checked ) {
        layerArray.push(<WMSTileLayer
          layers={this.getLayers(obj.name)}
          url={this.getUrl(obj.name)}
          transparent="true"
          opacity={opac}
          styles={obj.style != null ? obj.style : ""}
        />);
      }
    }

    return layerArray;
  }

  getLastBounds() {
    if (this.refs != null && this.refs.map != null) {
      const map = this.refs.map.leafletElement

      if (map != null) {
        return map.getBounds();
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getLastZoom() {
    if (this.refs != null && this.refs.map != null) {
      const map = this.refs.map.leafletElement

      if (map != null) {
        return map.getZoom();
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  render() {
    const corner1 = [35.746512, -30.234375];
    const corner2 = [71.187754, 39.199219];
    var bbox = [corner1, corner2];
    var studyAreaStyle = {
      "color": "#ff0000",
      "weight": 2,
      "opacity": 0.2,
      "fillOpacity": 0.0,
      "dashArray": "4 1"
    };

    var mapElement = (
    <Map ref='map'
        className="simpleMap"
        scrollWheelZoom={true}
        bounds={bbox}
        >
      {this.props.studyAreaPolygon != null &&
        <GeoJSON style={studyAreaStyle} data={this.props.studyAreaPolygon} />
      }
      <TileLayer noWrap={true} url={this.props.tileLayerUrl} />
      {
        this.createLayer(this.state.overlays)
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
