import React from "react";
import MapComponent from './commons/MapComponent';
import BasicMap from './commons/BasicMap';


export default class Generic extends BasicMap {
  constructor(props) {
    super(props);
    const corner1 = [39.853294, 13.305573];
    const corner2 = [41.853294, 15.305573];
    this.overlaysBackup = [];
    var overlays = [];
    this.state = {
      baseLayers: [
        {
          name: 'tile-texture-1',
          title: 'OpenStreetMap',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        },
        {
          name: 'tile-texture-2',
          title: 'Open Topo Map',
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        }
      ],
      overlays: overlays,
      exclusiveGroups: this.extractGroups(overlays),
      bounds: [corner1, corner2],
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