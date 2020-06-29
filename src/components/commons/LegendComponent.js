import React from 'react';
import SingleLegend from './SingleLegend.js';

/**
 * Renders the legends
 */
export default class LegendComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			layer: props.layer
		};
		this.caps = {};
	}

	/**
     * Creates jsx code to render the legends
     * 
     * @param {Array} layers an array with the layer that should be used for the legend 
     */
	createLegend(layers) {
		var legends = [];

		for (var i = 0; i < layers.length; ++i) {
			if (layers[i].checked) {
				legends.push(<SingleLegend key={layers[i].title} layer={layers[i]} caps={this.caps} />);
			}
		}

		return legends;
	}

	/**
     * Renders the legends
     */
	render() {
		return (
			<div style={{ display: 'inline', bottom: '50px', position: 'absolute', zIndex: '500', left: '25px' }}>
				{this.createLegend(this.props.layer)}
			</div>
		);
	}
}
