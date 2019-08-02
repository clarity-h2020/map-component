import React from 'react';

/**
 * Renders a single legend
 */
export default class SingleLegend extends React.Component {
    constructor(props) {
        super(props);
        var lUrl = this.props.layer.url + "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" + this.props.layer.layers;

        this.state = {
            legendUrl: lUrl,
            title: this.props.layer.title
        }
    }

    /**
     * Changes the legend url
     * 
     * @param {Object} nextProps 
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.layer != null) {
            var lUrl = nextProps.layer.url + "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" + nextProps.layer.layers;

            this.setState({
                legendUrl: lUrl,
                title: nextProps.layer.title
            });
        }
    }


    /**
     * renders a single legend
     */
    render() {
        return (
            <div>
                {/* <div>{this.state.title}</div> */}
                <img alt="Legend" src={this.state.legendUrl} />
            </div>
        );
    }
};
