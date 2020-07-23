import React from 'react';
import log from 'loglevel';

import LeafletMap from './commons/LeafletMap';
import BasicMap from "./commons/BasicMap";

// yes, order of imports do matter
import 'leaflet.sync';

/**
 * Generic Map Base class.
 */
export default class GenericMap extends BasicMap {
	constructor(props) {
		super(props);

		var overlays = [];
		this.state = {
			baseLayers: this.baseLayers,
			overlays: overlays,
			exclusiveGroups: [],
			bounds: this.initialBounds,
			loading: true
		};
	}

	/**
	 * Synchronised Maps. See https://github.com/jieter/Leaflet.Sync
	 */
	componentDidUpdate() {
		if (this.mapComponentA && this.mapComponentA.leafletMapInstance && this.mapComponentB && this.mapComponentB.leafletMapInstance) {
			this.mapComponentA.leafletMapInstance.sync(this.mapComponentB.leafletMapInstance);
			// WARNING: flyTo will not work if we apply it to both maps!
			this.mapComponentB.leafletMapInstance.sync(this.mapComponentA.leafletMapInstance,
				{
					noInitialSync: true
				});
			log.debug('Map Components synchronised');
		}
	}

	/**
   * Logs the url on the console
   *  
   * @param {String} resource 
   * @param {String} url 
   * @returns the given url
   */
	processUrl(resource, includedArray, url) {
		return super.processUrl(resource, includedArray, url);
	}

	/**
   * Render the map
   */
	render() {
		if (
			!this.queryParams ||
			(!this.queryParams.study_uuid && !this.queryParams.resource_uuid && !this.queryParams.datapackage_uuid)
		) {
			// renders an error message
			return super.render();
		}

		if (this.props.isSynchronised === true) {
			log.info('rendering two sychronised maps: ' + this.props.isSynchronised);
			
			return (<>
				<LeafletMap
					loading={this.state.loading}
					bounds={this.state.bounds}
					baseLayers={this.state.baseLayers}
					overlays={this.state.overlays}
					studyAreaPolygon={this.state.studyAreaPolygon}
					exclusiveGroups={this.state.exclusiveGroups}
					mapId={'synchronisedMapA'}
					ref={(mapComponent) => (this.mapComponentA = mapComponent)}
					fly={true}
					showAdaptationScenario={false}
				/>
				<LeafletMap
					loading={this.state.loading}
					bounds={this.state.bounds}
					baseLayers={this.state.baseLayers}
					overlays={this.state.overlays}
					studyAreaPolygon={this.state.studyAreaPolygon}
					exclusiveGroups={this.state.exclusiveGroups}
					mapId={'synchronisedMapB'}
					ref={(mapComponent) => (this.mapComponentB = mapComponent)}
					fly={false}
					showAdaptationScenario={true}
				/>
			</>);
		} else {
			log.info('rendering one simple map: ' + this.props.isSynchronised);
			return (
				<LeafletMap
					loading={this.state.loading}
					bounds={this.state.bounds}
					baseLayers={this.state.baseLayers}
					overlays={this.state.overlays}
					studyAreaPolygon={this.state.studyAreaPolygon}
					exclusiveGroups={this.state.exclusiveGroups}
				/>
			);
		}


	}
}
