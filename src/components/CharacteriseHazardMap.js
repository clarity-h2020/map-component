import React from 'react';
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';

export default class CharacteriseHazardMap extends BasicMap {
	constructor(props) {
		// FIXME: Warning: CharacteriseHazardMap(...): When calling super() in `CharacteriseHazardMap`,
		// make sure to pass up the same props that your component's constructor was passed.
		super({
			...props,
			mapSelectionId: 'eu-gl:hazard-characterization',
			groupingCriteria: 'taxonomy_term--hazards'
		});

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
   * Logs the url on the console
   *  
   * @param {String} resource 
   * @param {String} url 
   * @returns the given url
   */
	processUrl(resource, includedArray, url) {
		console.log('characteriseHazard-map -> process URL: ' + url);
		return super.processUrl(resource, includedArray, url);
	}

	/**
   * Render the map
   */
	render() {
		return (
			<MapComponent
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
