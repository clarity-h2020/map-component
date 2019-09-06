import React from "react";
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';


export default class Generic extends BasicMap {
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
   * Logs the url on the console
   *  
   * @param {String} resource 
   * @param {String} url 
   * @returns the given url
   */
  processUrl(resource, url) {
    return super.processUrl(resource, url);
  }

  /**
   * Render the map
   */
  render() {
    window.specificMapComponent = this;

    return (
      <MapComponent
        loading={this.state.loading}
        bounds={this.state.bounds}
        baseLayers={this.state.baseLayers}
        overlays={this.state.overlays}
        studyAreaPolygon={this.state.studyAreaPolygon}
        exclusiveGroups={this.state.exclusiveGroups} />
    );
  }
};