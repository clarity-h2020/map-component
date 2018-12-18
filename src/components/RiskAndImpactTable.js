import React from "react";
import ReactDOM from 'react-dom';

const RiskAndImpactTable = () => {
    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/05-RA-03-table.png' />);
};


export default RiskAndImpactMap;

if (document.getElementById('riskAndImpact-table-container') != null) {
    ReactDOM.render(<RiskAndImpactTable />, document.getElementById('riskAndImpact-table-container'));
}