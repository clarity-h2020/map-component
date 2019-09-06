import React from "react";
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';


export default class HazardLocalEffectsMap extends BasicMap {
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
        exclusiveGroups={this.state.exclusiveGroups}
        studyAreaPolygon={this.state.studyAreaPolygon} />
    );
  }
};