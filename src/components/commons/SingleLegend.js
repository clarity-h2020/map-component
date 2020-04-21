import React from 'react';

/**
 * Renders a single legend
 */
export default class SingleLegend extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			title: this.props.layer.title
		};
	}

	/**
     * renders a single legend
     */
	render() {
		var styleParameter = this.props.layer.style != null ? '&style=' + this.props.layer.style : '';
		var lUrl =
			this.props.layer.url +
			'?service=WMS&request=GetLegendGraphic&version=1.1.0&format=image%2Fpng&width=20&height=20&layer=' +
			this.props.layer.layers +
			styleParameter + '&legend_options=forceLabels:on';


		return (
			<div>
				{/* <div>{this.state.title}</div> */}
				<img alt="Legend" src={lUrl} />
			</div>
		);
	}
}
