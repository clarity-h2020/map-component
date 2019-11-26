import React from 'react';

/**
 * Renders a single legend
 */
export default class SingleLegend extends React.Component {
	constructor(props) {
		super(props);
		var styleParameter = this.props.layer.style != null ? '&style=' + this.props.layer.style : '';
		var lUrl =
			this.props.layer.url +
			'?service=WMS&request=GetLegendGraphic&version=1.1.0&format=image%2Fpng&width=20&height=20&layer=' +
			this.props.layer.layers +
			styleParameter;

		this.state = {
			legendUrl: lUrl,
			title: this.props.layer.title
		};
	}

	/**
     * Changes the legend url
     * 
     * @param {Object} nextProps 
     */
	componentWillReceiveProps(nextProps) {
		if (nextProps.layer != null) {
			var styleParameter = nextProps.layer.style != null ? '&style=' + nextProps.layer.style : '';
			var lUrl =
				nextProps.layer.url +
				'?service=WMS&request=GetLegendGraphic&version=1.1.0&format=image%2Fpng&width=20&height=20&layer=' +
				nextProps.layer.layers +
				styleParameter;

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
}
