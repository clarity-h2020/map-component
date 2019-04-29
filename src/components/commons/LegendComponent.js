import React from 'react';
import PropTypes from 'prop-types';
import SingleLegend from './SingleLegend.js'


export default class LegendComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layer: props.layer,
        }
        this.caps = {};
    }

    extractUrl(url) {
        return (url.indexOf('?') !== -1 ? url.substring(0, url.indexOf('?')) : null);
    }

    createLegend(legends) {
        var layerArray = [];

        for (var i = 0; i < legends.length; ++i) {
            if (legends[i].checked) {
                layerArray.push(<SingleLegend layer={legends[i]} caps={this.caps} />);
            }
        }

        return layerArray;
    }


    render() {
        return (
            <div style={{"display": "inline", "bottom": "50px", "position": "absolute", "zIndex": "10000", "left": "25px"}}>
                {this.createLegend(this.props.layer)}
            </div>
        );
    }
};
