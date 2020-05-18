import GenericMap from './GenericMap';

export default class RiskAndImpactMap extends GenericMap {
	constructor(props) {
		super({
			...props,
			mapSelectionId: 'Risk and Impact Assessment', //deprecated
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
}