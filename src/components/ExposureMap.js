import GenericMap from './GenericMap';

export default class ExposureMap extends GenericMap {
	constructor(props) {
		super({ ...props, mapSelectionId: 'eu-gl:exposure-evaluation' });

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
