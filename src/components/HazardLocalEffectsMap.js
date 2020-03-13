import GenericMap from './GenericMap';

export default class HazardLocalEffectsMap extends GenericMap {
	constructor(props) {
		super({ ...props, mapSelectionId: 'eu-gl:hazard-characterization:local-effects' });

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
