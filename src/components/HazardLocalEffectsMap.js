import GenericMap from './GenericMap';

export default class HazardLocalEffectsMap extends GenericMap {
	constructor(props) {
		super({ ...props, mapSelectionId: 'Hazard Characterization - Local Effects' }); // deprecated

		var overlays = [];
		this.state = {
			baseLayers: this.baseLayers,
			overlays: overlays,
			exclusiveGroups: [],
			bounds: this.initialBounds,
			loading: true
		};
	}
}
