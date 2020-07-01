import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, GeoJSON, WMSTileLayer, withLeaflet, LeafletConsumer, ZoomControl } from 'react-leaflet';
import { ReactLeafletGroupedLayerControl as ReactLeafletGroupedLayerControlForLeafletv1 } from 'react-leaflet-grouped-layer-control';
import turf from 'turf';
import 'leaflet-loading';
import LegendComponent from './LegendComponent.js';
import WMSLayer from './WMSLayer.js';
import 'leaflet/dist/leaflet.css';
import log from 'loglevel';

log.enableAll();

// See https://github.com/mhasbie/react-leaflet-vectorgrid#usage-with-react-leaflet-v2
const ReactLeafletGroupedLayerControl = withLeaflet(ReactLeafletGroupedLayerControlForLeafletv1);

/**
 * Render a leaflet map with the given layers.
 * This is still not the actual leaflet component but yet another wrapper. :o
 */
export default class LeafletMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			studyAreaPolygon: props.studyAreaPolygon,
			loading: props.loading,
			bounds: props.bounds,
			checkedBaseLayer: props.baseLayers[0].name,
			overlays: props.overlays,
			exclusiveGroups: props.exclusiveGroups,
			mapId: props.mapId ? props.mapId : 'simpleMap'
		};

		this.baseLayers = props.baseLayers;
		this.tileLayerUrl = props.baseLayers[0].url;
		this.fly = props.fly ? true : false;
		// the leaflet instance, retrieved from the leaflet context
		// see https://stackoverflow.com/questions/51308835/how-to-use-react-leaflet-context

		/**
     * @type {Leaflet.Map}
     */
		this.leafletMapInstance = undefined;
	}

	/**
   * Creates the reportInfoElement
   * @deprecated See https://github.com/clarity-h2020/map-component/issues/22#issuecomment-524189978
   */
	componentDidMount() {
		if (this.leafletMapInstance) {
			this.leafletMapInstance.invalidateSize();
		}

		var appContainerElement = document.getElementsByClassName('react-app-container');

		if (appContainerElement != null && appContainerElement.length > 0) {
			var reportInfoElement = this.htmlToElement(
				'<div id="reportInfoElement" style="visibility: hidden;height: 0px"></div>'
			);
			appContainerElement[0].appendChild(reportInfoElement);
		}

		this.updateInfoElement();
	}

	/**
   * Adds the reportInfoElement (see https://github.com/clarity-h2020/map-component/issues/22)
   * @deprecated See https://github.com/clarity-h2020/map-component/issues/22#issuecomment-524189978
   */
	updateInfoElement() {
		if (this.leafletMapInstance) {
			var reportInfoElement = document.getElementById('reportInfoElement');

			if (reportInfoElement != null) {
				reportInfoElement.innerHTML =
					'zoom level:' +
					this.leafletMapInstance.getZoom() +
					' bounding box: ' +
					this.leafletMapInstance.getBounds().toBBoxString();
				var overlays = this.getOverlayForLegend(this.state.overlays);
				if (overlays != null && overlays.length > 0) {
					var layers = null;
					for (let i = 0; i < overlays.length; ++i) {
						if (layers == null) {
							layers = overlays[i].title;
						} else {
							layers += ', ' + overlays[i].title;
						}
					}

					reportInfoElement.innerHTML = reportInfoElement.innerHTML + ' layer: ' + layers;
				}
			}
		}
	}

	/**
   * Updates the reportInfoElement and prepares the layer groups so that they can be collapsed and expanded
   */
	componentDidUpdate() {
		/**
     * You can directly access the Leaflet element created by a component using 
     * this.leafletElement in the component. This leaflet element is usually created in componentWillMount() 
     * and therefore accessible in componentDidMount(), except for the Map component where it can 
     * only be created after the <div> container is rendered.
     */
		if (this.leafletMapInstance) {
			this.leafletMapInstance.invalidateSize();

			if (this.fly && this.props.studyAreaPolygon != null) {
				log.info('centering on study area');
				this.leafletMapInstance.flyToBounds(this.getBoundsFromArea(this.props.studyAreaPolygon), null);
				this.fly = false;
			}
		}

		if (this.layerControl != null) {
			var loader = document.getElementsByName('mapLoading');

			if (loader.length > 0 && loader[0].parentElement != null) {
				loader[0].parentElement.removeChild(loader[0]);
			}
			if (this.props.loading != null && this.props.loading) {
				let groupTitles = this.layerControl.leafletElement._container.getElementsByClassName(
					'rlglc-grouptitle'
				);
				if (groupTitles.length > 0 && groupTitles[0].parentElement != null) {
					var element = groupTitles[0].parentElement;
					var loadingEl = this.htmlToElement(
						'<div style="text-align: center"><div name="mapLoading" class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>'
					);
					element.parentNode.appendChild(loadingEl, element);
				}
			}

			var groupTitles = this.layerControl.leafletElement._container.getElementsByClassName('rlglc-grouptitle');
			const self = this;

			if (this.hideListener != null) {
				for (var ind = 0; ind < groupTitles.length; ++ind) {
					if (this.hideListener.length > ind) {
						groupTitles[ind].removeEventListener('click', this.hideListener[ind]);
					}
				}
			}
			this.hideListener = [];
			for (var i = 0; i < groupTitles.length; ++i) {
				const el = groupTitles[i];
				var listener = function () {
					self.showHide(el);
				};
				this.hideListener.push(listener);
				el.addEventListener('click', listener);
			}
		}
		this.updateInfoElement();
	}

	/**
   * Creates a html element from the given html string
   * 
   * @param {String} html 
   * @deprecated
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
   * @deprecated
   */
	UNSAFE_componentWillReceiveProps(nextProps) {
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
			parent.style.width = maxWidth + 10 + 'px';
		}
	}

	/**
   * Without an invocation of this method, the leaflet map will not be rendered properly within drupal.
   * Some map tiles will not be loaded.
   * 
   * @deprecated
   */
	init() {
		if (this.leafletMapInstance) {
			this.leafletMapInstance.invalidateSize();
		}

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
		if (baseTitle === this.state.checkedBaseLayer) {
			return false;
		}
		console.warn(baseTitle);
		this.tileLayerUrl =
			this.props.baseLayers
				.map((e, i) => {
					return e.name === baseTitle ? e.url : false;
				})
				.filter((e) => e !== false)[0] || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		this.setState({ checkedBaseLayer: baseTitle });
		this.setState({ count: this.state.count + 1 });
	}

	onOverlayChange(newOverlays) {
		log.debug('onOverlayChange: newOverlays=' + newOverlays.length);
		this.overlaysAllTogether = [...newOverlays];
		log.debug('onOverlayChange: overlaysAllTogether=' + newOverlays.length);
		this.setState({
			overlays: [...newOverlays],
			count: this.state.count + 1
		});
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

		return ' ';
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

		return ' ';
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

		return ' ';
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
				if (this.props.overlays[i].style && this.props.overlays[i].style != null) {
					return this.props.overlays[i].style;
				} else {
					return '';
				}
			}
		}

		return '';
	}

	/**
   * Extracts the style name of the overlay layer with the given name.
   * 
   * @param {String} name  the name of the layer
   * @returns the style name of the overlay layer with the given name.
   */
	getAttribution(name) {
		for (var i = 0; i < this.props.overlays.length; i++) {
			if (this.props.overlays[i].name === name) {
				if (this.props.overlays[i].attribution && this.props.overlays[i].attribution != null) {
					return this.props.overlays[i].attribution;
				} else {
					return '';
				}
			}
		}

		return '';
	}


	/**
   * Creates the jsx code for the **overlay** layers, that can be used in the render method
   * 
   * @param {Object[]} overlays the array with all overlay layers
   * @returns the array with all overlay layers
   */
	createLayers(overlays) {
		var layerArray = [];

		const selectedOverlays = overlays.filter(overlay => overlay.checked);
		log.info(`${selectedOverlays.length} overlays of total ${overlays.length}  selected`);

		for (var i = selectedOverlays.length - 1; i >= 0; i--) {
			var overlay = selectedOverlays[i];
			var j = 0;
			if (overlay.groupTitle === 'Backgrounds' || overlay.groupTitle === 'CLARITY Backgrounds') {
				// load background layers as tile layer and load them first 
				layerArray.push(
					<WMSTileLayer
						key={`Backgrounds_${overlay.name}`}
						layers={this.getLayers(overlay.name)}
						url={this.getUrl(overlay.name)}
						transparent="true"
						format="image/png"
						opacity="0.5"
						styles={this.getStyle(overlay.name)}
						tileSize={1536}
						attribution={this.getAttribution(overlay.name)}
					/>
				);
				j++;
				log.debug('Background layer ' + overlay.name + ' created');
			}
			else {
				// enable getFeatureInfo on the **last** selected layer
				// this does not work! previously created layers are not updated thanks to react Virtual DOM :(
				// const identify = (i - j) === (selectedOverlays.length - j - 1);
				const identify = true;
				layerArray.unshift(
					<WMSLayer
						key={overlay.name}
						layers={this.getLayers(overlay.name)}
						url={this.getUrl(overlay.name)}
						transparent="true"
						format="image/png"
						opacity="0.5"
						styles={this.getStyle(overlay.name)}
						tileSize={1536}
						attribution={this.getAttribution(overlay.name)}
						info_format="application/json"
						identify={identify}
					/>
				);
				log.debug(`Layer #${i} "${overlay.name}" created, getFeatureInfo: ${identify}`);
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
					key: obj.name,
					checked: obj.checked,
					style: this.getStyle(obj.name),
					layers: this.getLayers(obj.name),
					url: url,
					title: obj.title
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
   * @deprecated
   */
	createBaseLayer(d) {
		var layerArray = [];

		for (var i = 0; i < d.length; ++i) {
			var obj = d[i];
			if (obj.checked) {
				layerArray.push(<WMSTileLayer url={this.getBaseUrl(obj.name)} noWrap={true} />);
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

		if (this.leafletMapInstance) {
			this.leafletMapInstance.getBounds().toBBoxString();
			this.leafletMapInstance.getZoom();
		}
	}

	/**
   * Renders the map
   */
	render() {
		const studyAreaStyle = {
			color: '#ff0000',
			weight: 2,
			opacity: 0.2,
			fillOpacity: 0.0,
			dashArray: '4 1'
		};
		const overlays = this.state.overlays;
		const activeLayers = this.createLayers(overlays);
		log.info(activeLayers.length + ' of ' + overlays.length + ' layers activated');

		const mapElement = (
			<div>
				{/* 
          Refs provide a way to access DOM nodes or React elements created in the render method.
          https://reactjs.org/docs/forwarding-refs.html
          ref={(comp) => this.leafletMapInstance = comp.leafletElement}
        */}
				<Map
					id={'#' + this.state.mapId}
					className={this.state.mapId}
					scrollWheelZoom={true}
					bounds={this.state.bounds}
					loadingControl={false}
					onViewportChanged={this.onViewportChanged.bind(this)}
					zoomControl={false}

				>
					<ZoomControl
						position="topleft">
					</ZoomControl>
					<LeafletConsumer>
						{(context) => {
							this.leafletMapInstance = context.map;
						}}
					</LeafletConsumer>

					{this.props.studyAreaPolygon != null && (
						<GeoJSON style={studyAreaStyle} data={this.props.studyAreaPolygon} />
					)}
					<TileLayer noWrap={true} url={this.tileLayerUrl} />
					{activeLayers}
					<ReactLeafletGroupedLayerControl
						ref={(layerControl) => (this.layerControl = layerControl)}
						position="topright"
						baseLayers={this.props.baseLayers}
						checkedBaseLayer={this.state.checkedBaseLayer}
						overlays={overlays}
						onBaseLayerChange={this.baseLayerChange.bind(this)}
						onOverlayChange={this.onOverlayChange.bind(this)}
						exclusiveGroups={this.props.exclusiveGroups}
					/>
					<LegendComponent layer={this.getOverlayForLegend(overlays)} />
				</Map>
			</div>
		);
		//@deprecated
		window.mapCom = this;
		return mapElement;
	}
}

LeafletMap.propTypes = {
	loading: PropTypes.bool,
	bounds: PropTypes.array,
	baseLayers: PropTypes.array,
	exclusiveGroups: PropTypes.array,
	overlays: PropTypes.array,
	studyAreaPolygon: PropTypes.object
};
