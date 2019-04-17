import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, GeoJSON, WMSTileLayer } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl} from 'react-leaflet-grouped-layer-control';
import 'leaflet-fullscreen'
import 'react-leaflet-fullscreen-control'
import turf from 'turf';
import 'leaflet-loading'



export default class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studyAreaPolygon: props.studyAreaPolygon,
      loading: props.loading,
      bounds: props.bounds,
      checkedBaseLayer: props.baseLayers[0].name,
      overlays: props.overlays,
      exclusiveGroups: props.exclusiveGroups,
      oldOverlay: []
    }
    this.baseLayers = props.baseLayers;
    this.tileLayerUrl = props.baseLayers[0].url;
    this.fly = true;
  }
  
  componentDidMount () {
    this.map.leafletElement.invalidateSize();
  }

  componentDidUpdate () {
    const map = this.map.leafletElement;
    map.invalidateSize();

    if (this.fly && (this.props.studyAreaPolygon != null)) {
        map.flyToBounds(this.getBoundsFromArea(this.props.studyAreaPolygon), null);
        this.fly = false;
    }

    if (this.layerControl != null) {
      var loader = document.getElementsByName("mapLoading");

      if (loader.length > 0 && loader[0].parentElement != null) {
        loader[0].parentElement.removeChild(loader[0]);
      }
      if (this.props.loading != null && this.props.loading) {
        let groupTitles = this.layerControl.leafletElement._container.getElementsByClassName("rlglc-grouptitle");
        if (groupTitles.length > 0 && groupTitles[0].parentElement != null) {
          var element = groupTitles[0].parentElement;
          var loadingEl = this.htmlToElement('<div style="text-align: center"><div name="mapLoading" class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>');
          element.parentNode.appendChild(loadingEl, element);
        }
      }

      var groupTitles = this.layerControl.leafletElement._container.getElementsByClassName("rlglc-grouptitle");
      const self = this;

      if (this.hideListener != null) {
        for (var ind = 0; ind < groupTitles.length; ++ind) {
          if (this.hideListener.length > ind) {
            groupTitles[ind].removeEventListener("click", this.hideListener[ind])
          }
        }
      }
      this.hideListener = [];
      for (var i = 0; i < groupTitles.length; ++i) {
        const el = groupTitles[i];
        var listener = function() {self.showHide(el)};
        this.hideListener.push(listener);
        el.addEventListener("click", listener)
      }
    }
  }

  htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }  

  componentWillReceiveProps(nextProps) {
    if (nextProps.overlays !== this.props.overlays) {
      this.setState({ overlays: nextProps.overlays });
      const thisObj = this;
      setTimeout(function() {
        thisObj.setState({ overlays: nextProps.overlays });
      }, 100);
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
    var sibling = el.nextElementSibling;
    var maxWidth = 0;

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
        if (sibling.offsetWidth > maxWidth) {
          maxWidth = sibling.offsetWidth;
        }
        sibling.classList.add('hiddenGroup');
      }

      sibling = sibling.nextElementSibling;
    }

    if (maxWidth > 0) {
      parent.style.width = (maxWidth + 10) + "px";
    }
  }

  init() {
    this.map.leafletElement.invalidateSize();

    this.setState({
      init: true
    });
  }

  baseLayerChange(baseTitle) {
    if (baseTitle === this.state.checkedBaseLayer) { return false; }
    console.warn(baseTitle)
    this.tileLayerUrl = this.props.baseLayers.map((e, i) => { return (e.name === baseTitle) ? e.url : false }).filter(e => e !== false)[0] || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
//    this.tileLayerUrl = this.props.maps[this.props.baseLayers.map((e, i) => { return (e.name === baseTitle) ? String(i) : false }).filter(e => e)[0] | 0] || this.props.maps[0];
    this.setState({checkedBaseLayer: baseTitle})
    this.setState({count: this.state.count + 1})
  }

  // only one checked overlay layer is allowed
  overlayChange(newOverlays) {
    if (this.state.oldOverlay != null) {
      for (var i = 0; i < newOverlays.length && i < this.state.oldOverlay.length; ++i) {
        if (this.state.oldOverlay[i].name === newOverlays[i].name && newOverlays[i].checked && this.state.oldOverlay[i].checked === newOverlays[i].checked) {
          newOverlays[i].checked = false;
        }
      }
    }

    // this.state.overlays = [...newOverlays];

    this.setState({
      overlays: [...newOverlays],
      count: this.state.count + 1,
      oldOverlay: newOverlays
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

  getBaseUrl(name) {
    for (var i = 0;i <  this.props.baseLayers.length; i++) {
      if (this.props.baseLayers[i].name === name) {
        return this.props.baseLayers[i].url;
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

  getStyle(name) {
    for (var i = 0;i <  this.props.overlays.length; i++) {
      if (this.props.overlays[i].name === name) {
        if (this.props.overlays[i].style != null) {
          return this.props.overlays[i].style;
        } else {
          return "";
        }
      }
    }

    return "";
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
          format='image/png'
          opacity={opac}
          styles={this.getStyle(obj.name)}
          tileSize={1536}
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

  createBaseLayer(d) {
    var layerArray = [];

    for (var i = 0; i < d.length; ++i) {
      var obj = d[i];
      if ( obj.checked ) {
        layerArray.push(<WMSTileLayer
          url={this.getBaseUrl(obj.name)}
          noWrap={true}
        />);
      }
    }

    return layerArray;
  }


  render() {
//    console.log("this.layerControl", this.layerControl);
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
    var overlays = this.state.overlays;

    // if (this.state.loading != null && this.state.loading) {
    //   overlays = [{
    //     checked: false,
    //     groupTitle: "loading",
    //     name: "",
    //     title: "",
    //     layers: "",
    //     url: ""
    //   }];
    // }

    var mapElement = (
    <Map style={{height: "500px"}} ref={(comp)=>this.map=comp}
        className="simpleMap"
        scrollWheelZoom={true}
        bounds={bbox}
        loadingControl= {true}
        fullscreenControl
        >
      {this.props.studyAreaPolygon != null &&
        <GeoJSON style={studyAreaStyle} data={this.props.studyAreaPolygon} />
      }
      <TileLayer noWrap={true} url={this.tileLayerUrl} />
      {
        this.createLayer(this.state.overlays)
      }
      <ReactLeafletGroupedLayerControl 
        ref={(comp)=>this.layerControl=comp}
        position="topright"
        baseLayers={this.props.baseLayers}
        checkedBaseLayer={this.state.checkedBaseLayer}
        overlays={overlays}
        onBaseLayerChange={this.baseLayerChange.bind(this)}
        onOverlayChange={this.overlayChange.bind(this)}
        exclusiveGroups={this.props.exclusiveGroups}
      />
    </Map>
   )
    window.mapCom = this;
    return mapElement;
  }
};


MapComponent.propTypes = {
  loading: PropTypes.bool,
  bounds: PropTypes.object,
  baseLayers: PropTypes.array,
  exclusiveGroups: PropTypes.array,
  overlays: PropTypes.array,
  exclusiveGroups: PropTypes.array,
  studyAreaPolygon: PropTypes.object
}
