import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, GeoJSON, WMSTileLayer } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl } from 'react-leaflet-grouped-layer-control';
import turf from 'turf';
import 'leaflet-loading'
import LegendComponent from './LegendComponent.js'


/**
 * Render a leaflet map with the given layers
 */
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

  /**
   * Creates the reportInfoElement
   */
  componentDidMount() {
    var mapElement = this.map.leafletElement;
    mapElement.invalidateSize();
    var element = document.getElementsByClassName("react-app-container");

    if (element != null && element.length > 0) {
      var infoDiv = this.htmlToElement('<div id="reportInfoElement" style="visibility: hidden;height: 0px"></div>');
      element[0].appendChild(infoDiv);
    }

    this.updateInfoElement();
  }

  /**
   * Adds the reportInfoElement (see https://github.com/clarity-h2020/map-component/issues/22)
   */
  updateInfoElement() {
    if (this.map != null) {
      var mapElement = this.map.leafletElement;
      var element = document.getElementById("reportInfoElement");

      if (element != null) {
        element.innerHTML = 'zoom level:' + mapElement.getZoom() + ' bounding box: ' + mapElement.getBounds().toBBoxString();
        var overlays = this.getOverlayForLegend(this.state.overlays)
        if (overlays != null && overlays.length > 0) {
          var layers = null;
          for (let i = 0; i < overlays.length; ++i) {
            if (layers == null) {
              layers = overlays[i].title;
            } else {
              layers += ', ' + overlays[i].title;
            }
          }

          element.innerHTML = element.innerHTML + ' layer: ' + layers;
        }
      }
    }
  }

  /**
   * Updates the reportInfoElement and prepares the layer groups so that they can be collapsed and expanded
   */
  componentDidUpdate() {
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
        var listener = function () { self.showHide(el) };
        this.hideListener.push(listener);
        el.addEventListener("click", listener)
      }
    }
    this.updateInfoElement();
  }

  /**
   * Creates a html element from the given html string
   * 
   * @param {String} html 
   */
  htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

  /**
   * This method prevents repaint problems, when a new overlay layer was selected
   * 
   * @param {Object} nextProps 
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.overlays !== this.props.overlays) {
      this.setState({ overlays: nextProps.overlays });
      const thisObj = this;
      setTimeout(function () {
        thisObj.setState({ overlays: nextProps.overlays });
      }, 100);
    }
  }

  /**
   * Returns the bounding box of the given polygon geometry
   * 
   * @param {Object} area 
   */
  getBoundsFromArea(area) {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }

  /**
   * Shows or hides a layer group. This method will be invoked, when the user clicks on the title of a layer group
   * 
   * @param {Object} el 
   */
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

  /**
   * Without an invocation of this method, the laflet map will not be rendered properly within drupal.
   * Some map tiles will not be loaded.
   */
  init() {
    this.map.leafletElement.invalidateSize();

    this.setState({
      init: true
    });
  }

  /**
   * Changes the base layer of the map.
   * This method will be invoked, when the user selects an other base layer. 
   * 
   * @param {String} baseTitle 
   */
  baseLayerChange(baseTitle) {
    if (baseTitle === this.state.checkedBaseLayer) { return false; }
    console.warn(baseTitle)
    this.tileLayerUrl = this.props.baseLayers.map((e, i) => { return (e.name === baseTitle) ? e.url : false }).filter(e => e !== false)[0] || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.setState({ checkedBaseLayer: baseTitle })
    this.setState({ count: this.state.count + 1 })
  }

  /**
   * Changes the overlay layer of the map.
   * This method will be invoked, when the user selects an other overlay layer. 
   * It is only one checked overlay layer allowed
   * 
   * @param {Array} newOverlays 
   */
  overlayChange(newOverlays) {
    if (this.state.oldOverlay != null) {
      for (var i = 0; i < newOverlays.length && i < this.state.oldOverlay.length; ++i) {
        if (this.state.oldOverlay[i].name === newOverlays[i].name && newOverlays[i].checked && this.state.oldOverlay[i].checked === newOverlays[i].checked) {
          newOverlays[i].checked = false;
        }
      }
    }

    this.setState({
      overlays: [...newOverlays],
      count: this.state.count + 1,
      oldOverlay: newOverlays
    })
  }

  /**
   * Extracts the url of the overlay layer with the given name.
   * 
   * @param {String} name  the name of the layer
   * @returns the url of the overlay layer with the given name.
   */
  getUrl(name) {
    for (var i = 0; i < this.props.overlays.length; i++) {
      if (this.props.overlays[i].name === name) {
        return this.props.overlays[i].url;
      }
    }

    return " ";
  }

  /**
   * Extracts the url of the base layer with the given name.
   * 
   * @param {String} name  the name of the layer
   * @returns the url of the base layer with the given name.
   */
  getBaseUrl(name) {
    for (var i = 0; i < this.props.baseLayers.length; i++) {
      if (this.props.baseLayers[i].name === name) {
        return this.props.baseLayers[i].url;
      }
    }

    return " ";
  }

  /**
   * Extracts the layer names of the overlay layer with the given name.
   * 
   * @param {String} name  the name of the layer
   * @returns the layer names of the overlay layer with the given name.
   */
  getLayers(name) {
    for (var i = 0; i < this.props.overlays.length; i++) {
      if (this.props.overlays[i].name === name) {
        return this.props.overlays[i].layers;
      }
    }

    return " ";
  }

  /**
   * Extracts the style name of the overlay layer with the given name.
   * 
   * @param {String} name  the name of the layer
   * @returns the style name of the overlay layer with the given name.
   */
  getStyle(name) {
    for (var i = 0; i < this.props.overlays.length; i++) {
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

  /**
   * Creates the jsx code for the overlay layers, that can be used in the render method
   * 
   * @param {Array} layers the array with all overlay layers
   * @returns the array with all overlay layers
   */
  createLayer(layers) {
    var layerArray = [];
    var opac = 0.5;

    for (var i = 0; i < layers.length; ++i) {
      var obj = layers[i];
      if (obj.checked) {
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

  /**
   * Returns an array with the overlay layers, which are selected and should be used to create the legend.
   * At the moment, only one overlay layer can be selected at the same time.
   * 
   * @param {Array} layers the array with all overlay layers
   */
  getOverlayForLegend(layers) {
    var layerArray = [];

    for (var i = 0; i < layers.length; ++i) {
      var obj = layers[i];
      if (obj.checked) {
        var url = this.getUrl(obj.name);
        if (url.indexOf('?') !== -1) {
          url = url.substring(0, url.indexOf('?'));
        }
        var checkedObj = {
          "checked": obj.checked,
          "style": this.getStyle(obj.name),
          "layers": this.getLayers(obj.name),
          "url": url,
          "title": obj.title
        };
        layerArray.push(checkedObj);
      }
    }

    return layerArray;
  }


  /**
   * Creates the jsx code for the base layers, that can be used in the render method
   * 
   * @param {Array} d the array with all base layers 
   * @returns the jsx code for the base layers
   */
  createBaseLayer(d) {
    var layerArray = [];

    for (var i = 0; i < d.length; ++i) {
      var obj = d[i];
      if (obj.checked) {
        layerArray.push(<WMSTileLayer
          url={this.getBaseUrl(obj.name)}
          noWrap={true}
        />);
      }
    }

    return layerArray;
  }

  /**
   * This method will be invoked by leaflet, when the user changes the bounding box of the map
   * 
   * @param {*} center 
   * @param {*} zoom 
   */
  onViewportChanged(center, zoom) {
    this.updateInfoElement();

    if (this.map != null) {
      var mapElement = this.map.leafletElement;
      mapElement.getBounds().toBBoxString();
      mapElement.getZoom();
    }
  }

  /**
   * Renders the map
   */
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
    var overlays = this.state.overlays;

    var mapElement = (
      <div>
        <Map style={{ height: "500px" }} ref={(comp) => this.map = comp}
          className="simpleMap"
          scrollWheelZoom={true}
          bounds={bbox}
          loadingControl={true}
          onViewportChanged={this.onViewportChanged.bind(this)}
          >
          {this.props.studyAreaPolygon != null &&
            <GeoJSON style={studyAreaStyle} data={this.props.studyAreaPolygon} />
          }
          <TileLayer noWrap={true} url={this.tileLayerUrl} />
          {
            this.createLayer(this.state.overlays)
          }
          <ReactLeafletGroupedLayerControl
            ref={(comp) => this.layerControl = comp}
            position="topright"
            baseLayers={this.props.baseLayers}
            checkedBaseLayer={this.state.checkedBaseLayer}
            overlays={overlays}
            onBaseLayerChange={this.baseLayerChange.bind(this)}
            onOverlayChange={this.overlayChange.bind(this)}
            exclusiveGroups={this.props.exclusiveGroups}
          />
        </Map>
        <LegendComponent layer={this.getOverlayForLegend(overlays)} />
      </div>
    )
    window.mapCom = this;
    return mapElement;
  }
};


MapComponent.propTypes = {
  loading: PropTypes.bool,
  bounds: PropTypes.array,
  baseLayers: PropTypes.array,
  exclusiveGroups: PropTypes.array,
  overlays: PropTypes.array,
  studyAreaPolygon: PropTypes.object
}
