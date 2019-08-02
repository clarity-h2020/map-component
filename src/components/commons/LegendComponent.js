import React from 'react';
import SingleLegend from './SingleLegend.js'

/**
 * Renders the legends
 */
export default class LegendComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layer: props.layer,
        }
        this.caps = {};
    }

    /**
     * Creates jsx code to render the legends
     * 
     * @param {Array} legends an array with the layer that should be used for the legend 
     */
    createLegend(legends) {
        var layerArray = [];

        for (var i = 0; i < legends.length; ++i) {
            if (legends[i].checked) {
                layerArray.push(<SingleLegend layer={legends[i]} caps={this.caps} />);
            }
        }

        return layerArray;
    }


    /**
     * Renders the legends
     */
    render() {
        return (
            <div style={{"display": "inline", "bottom": "50px", "position": "absolute", "zIndex": "1000", "left": "25px"}}>
                {this.createLegend(this.props.layer)}
            </div>
        );
    }
};
