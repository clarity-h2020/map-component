import GenericMap from './GenericMap';

/**
 * @deprecated
 */
export default class CharacteriseHazardMap extends GenericMap {
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
}
