import React from "react";
import ReactDOM from 'react-dom';

const RiskAndImpactMap = () => {
    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/RiskAndImpact.png' />);
};


export default RiskAndImpactMap;

if (document.getElementById('riskAndImpact-map-container') != null) {
    ReactDOM.render(<RiskAndImpactMap />, document.getElementById('riskAndImpact-map-container'));
}