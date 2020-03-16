import GenericMap from './GenericMap';

export default class RiskAndImpactMap extends GenericMap {
	constructor(props) {
		super({
			...props,
			mapSelectionId: 'eu-gl:risk-and-impact-assessment',
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