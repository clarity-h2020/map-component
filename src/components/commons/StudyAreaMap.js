import React from 'react';
import ReactDOM from 'react-dom';
import { Map, TileLayer, GeoJSON, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import Wkt from 'wicket';
import turf from 'turf';
import booleanIntersects from '@turf/boolean-intersects';

/**
 * The main purpose is to render the map with the study area and the city. This class also allows to create a new study area. 
 * This component will be used by the class components/StudyArea
 */
export default class StudyAreaMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			readOnly: true,
			studyAreaPolygon: props.studyAreaPolygon
		};
		this.newGeometry = props.studyAreaPolygon;
		this.savedGeometry = props.studyAreaPolygon;
		this._onCreated.bind(this);
	}

	/**
   * This method solves some repaint problems
   * 
   * @param {Object} nextProps 
   */
	componentWillReceiveProps(nextProps) {
		if (nextProps.studyAreaPolygon !== this.props.studyAreaPolygon) {
			this.setState({ studyAreaPolygon: nextProps.studyAreaPolygon });
			this.savedGeometry = nextProps.studyAreaPolygon;
		}
	}

	/**
   * Without an invocation of this method, the laflet map will not be rendered properly within drupal.
   * Some map tiles will not be loaded.
   */
	init() {
		const map = this.map.leafletElement;
		map.invalidateSize();
	}

	/**
   * Creates a new study area and upload it to the drupal system. 
   * This method will be invoked by the EditControl component
   * 
   * @param {Object} e 
   */
	_onCreated(e) {
		const qkmToQm = 1000000;
		const allowedSize = 500;
		var area = turf.area(e.layer.toGeoJSON());

		if (this.props.cityPolygonRequired && !booleanIntersects(e.layer.toGeoJSON(), this.props.cityPolygon)) {
			alert('The selected area is not within the selected city.');
			this.map.leafletElement.removeLayer(e.layer);
		} else if (area > allowedSize * qkmToQm) {
			//remove the layer, if it is too large
			alert('The selected area is too large. The allowed size is ' + allowedSize + ' km²');
			this.map.leafletElement.removeLayer(e.layer);
		} else {
			//set the new study area
			var wkt = new Wkt.Wkt();
			wkt.fromJson(e.layer.toGeoJSON());
			this.newGeometry = wkt.write();
			if (this.state.newLayer != null) {
				this.map.leafletElement.removeLayer(this.state.newLayer);
			}
			this.setState({
				studyAreaPolygon: null,
				newLayer: e.layer
			});
		}
	}

	/**
	 * Revert changes
	 */
	cancelEdit() {
		if (this.state.newLayer != null) {
			this.map.leafletElement.removeLayer(this.state.newLayer);
		}
		var wkt = new Wkt.Wkt();
		wkt.read(this.savedGeometry);
		var study = {
			type: 'Feature',
			properties: {
				popupContent: 'study',
				style: {
					weight: 2,
					color: 'black',
					opacity: 1,
					fillColor: '#ff0000',
					fillOpacity: 0.1
				}
			},
			geometry: wkt.toJson()
		};
		this.setState({
			studyAreaPolygon: study,
			newLayer: null
		});
		this.newGeometry = this.savedGeometry;
	}

	/**
	 * Save the current study area and reset the view
	 */
	saveChanges() {
		if (this.newGeometry != null) {
			const _this = this;

			fetch(_this.getTokenUrl(), { credentials: 'include' })
				.then((resp) => resp.text())
				.then(function(key) {
					var data =
						'{"type": [{"target_id": "study", "target_type":"group_type"}], "field_area": [{"value": "' +
						_this.newGeometry +
						'"}]}';
					var mimeType = 'application/json'; //hal+json
					var xmlHttp = new XMLHttpRequest();
					xmlHttp.open(
						'PATCH',
						_this.props.hostname.substring(0, _this.props.hostname.length) +
							'/group/' +
							_this.props.id +
							'?_format=json',
						true
					); // true : asynchrone false: synchrone
					xmlHttp.setRequestHeader('Accept', 'application/json');
					xmlHttp.setRequestHeader('Content-Type', mimeType);
					xmlHttp.setRequestHeader('X-CSRF-Token', key);
					xmlHttp.send(data);

					if (_this.state.newLayer != null) {
						_this.map.leafletElement.removeLayer(_this.state.newLayer);
					}
					_this.savedGeometry = _this.newGeometry;
					_this.newGeometry = null;
					var wkt = new Wkt.Wkt();
					wkt.read(_this.savedGeometry);
					var study = {
						type: 'Feature',
						properties: {
							popupContent: 'study',
							style: {
								weight: 2,
								color: 'black',
								opacity: 1,
								fillColor: '#ff0000',
								fillOpacity: 0.1
							}
						},
						geometry: wkt.toJson()
					};

					_this.setState({
						studyAreaPolygon: study,
						newLayer: null
					});
				})
				.catch(function(error) {
					console.log(JSON.stringify(error));
				});
		}
	}

	/**
   * @returns the URL to retrieve the session token. This token is required to upload data to drupal
   */
	getTokenUrl() {
		return this.props.hostname + '/rest/session/token';
	}

	/**
   * Determines the bounding box of the given polygon geometry
   * 
   * @param {Object} area 
   * @returns the bounding box of the given polygon geometry
   */
	getBoundsFromArea(area) {
		const bboxArray = turf.bbox(area);
		const corner1 = [ bboxArray[1], bboxArray[0] ];
		const corner2 = [ bboxArray[3], bboxArray[2] ];
		var bounds = [ corner1, corner2 ];

		return bounds;
	}

	/**
   * Set the read only status of the component
   * 
   * @param {Boolean} ro 
   */
	setReadOnly(ro) {
		if (!ro && this.props.cityPolygonRequired && this.props.cityPolygon == null) {
			alert('You cannot create a study area before you select a city');
		} else {
			this.setState({
				readOnly: ro
			});
		}
	}

	/**
   * Set the read only status of the component
   * 
   * @param {Boolean} ro 
   */
	isReadOnly() {
		return this.state.readOnly;
	}

	/**
   * Inverts the read only status of the component
   * 
   */
	changeReadOnly() {
		if (this.state.readOnly && this.props.cityPolygonRequired && this.props.cityPolygon == null) {
			alert('You cannot create a study area before you select a city');
		} else {
			this.setState({
				readOnly: !this.state.readOnly
			});
		}
	}

	componentDidMount() {
		var mapElement = this.map.leafletElement;
		mapElement.setMinZoom(3);
	}

	/**
   * Set the allowed min zoom factor of the map
   */
	componentDidUpdate() {
		var mapElement = this.map.leafletElement;

		if (this.props.cityPolygon != null) {
			var cityGeom = this.props.cityPolygon.geometry;
			var bbox = turf.bbox(cityGeom);
			//calculate longest edge
			var pointX1 = turf.point([ bbox[1], bbox[0] ]);
			var pointX2 = turf.point([ bbox[3], bbox[0] ]);
			var width = turf.distance(pointX1, pointX2, 'kilometers');
			var pointY1 = turf.point([ bbox[1], bbox[0] ]);
			var pointY2 = turf.point([ bbox[1], bbox[2] ]);
			var height = turf.distance(pointY1, pointY2, 'kilometers');
			var longestEdge = (width > height ? width : height) * 1000;

			//calculate min zoom
			var CIRCUMFERENCE_EARTH = 40000000;
			var zoomfactor = Math.floor(Math.log2(CIRCUMFERENCE_EARTH / longestEdge) + 1);
			mapElement.setMinZoom(zoomfactor);
		}
	}

	/**
   * Renders the map
   */
	render() {
		var geometry =
			this.props.cityPolygon != null
				? this.props.cityPolygon.geometry
				: this.state.studyAreaPolygon != null ? this.state.studyAreaPolygon.geometry : null;

		if (geometry == null) {
			geometry = {
				type: 'Polygon',
				coordinates: [
					[
						[ -23.378906, 34.597042 ],
						[ -23.378906, 69.534518 ],
						[ 48.691406, 69.534518 ],
						[ 48.691406, 34.597042 ],
						[ -23.378906, 34.597042 ]
					]
				]
			};
		}
		var studyAreaStyle = {
			color: '#ff0000',
			weight: 2,
			opacity: 0.2
		};
		var cityStyle = {
			color: '#0000ff',
			weight: 6,
			opacity: 0.1,
			fillColor: '#0000ff',
			fillOpacity: 0.1
		};

		var mapElement = (
			<Map
				ref={(comp) => (this.map = comp)}
				zoomControl={true}
				touchExtend="false"
				bounds={this.getBoundsFromArea(geometry)}
			>
				<TileLayer
					attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{this.props.cityPolygon != null && <GeoJSON style={cityStyle} data={this.props.cityPolygon} />}
				{this.state.studyAreaPolygon != null && (
					<GeoJSON style={studyAreaStyle} data={this.state.studyAreaPolygon} />
				)}
				<FeatureGroup>
					{(this.state.readOnly == null || this.state.readOnly === false) && (
						<EditControl
							position="topright"
							onCreated={this._onCreated.bind(this)}
							draw={{
								polygon: false,
								circle: false,
								marker: false,
								polyline: false,
								circlemarker: false,
								rectangle: {
									showArea: true,
									metric: [ 'km', 'm' ]
								}
							}}
							edit={{
								edit: false,
								remove: false
							}}
							// onEditResize={this._onEditResize.bind(this)}
						/>
					)}
				</FeatureGroup>
			</Map>
		);
		window.mapCom = this;
		return mapElement;
	}
}

if (document.getElementById('study_area-map-container') != null) {
	ReactDOM.render(<StudyAreaMap />, document.getElementById('study_area-map-container'));
	document.getElementById('study_area-map-container').style.width = '100%';
	document.getElementById('study_area-map-container').style.height = '500px';
}
