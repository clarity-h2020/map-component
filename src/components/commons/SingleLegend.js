import React from 'react';
import PropTypes from 'prop-types';
import WMSCapabilities from 'wms-capabilities';


export default class SingleLegend extends React.Component {
    constructor(props) {
        super(props);
        var baseUrl = this.props.layer.url;
        var lUrl = this.props.layer.url + "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" + this.props.layer.layers;

        this.state = {
            legendUrl: lUrl,
            title: this.props.layer.title
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.layer != null) {
            var lUrl = nextProps.layer.url + "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" + nextProps.layer.layers;

            this.setState({
                legendUrl: lUrl,
                title: nextProps.layer.title
            });
        }
      }

      extractUrl(url) {
        return (url.indexOf('?') !== -1 ? url.substring(0, url.indexOf('?')) : null);
    }


    render() {
        return (
            <div>
                {/* <div>{this.state.title}</div> */}
                <img alt="Legend" src={this.state.legendUrl} />
            </div>
        );
    }
};
