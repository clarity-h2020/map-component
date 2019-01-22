import React from "react";
import ReactDOM from 'react-dom';

const HazardLocalEffectsTable = () => {
    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/04-VA-03-table.png' />);
};


export default HazardLocalEffectsTable;

if (document.getElementById('hazardLocalEffects-table-container') != null) {
    ReactDOM.render(<HazardLocalEffectsTable />, document.getElementById('hazardLocalEffects-table-container'));
}