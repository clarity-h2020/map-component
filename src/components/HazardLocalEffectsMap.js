import React from "react";
import ReactDOM from 'react-dom';

const HazardLocalEffectsMap = () => {
    return (<img src='../../../../../../modules/custom/map-component/src/img/HazardLocalEffects.png' />);
};


export default HazardLocalEffectsMap;

if (document.getElementById('hazardLocalEffects-map-container') != null) {
    ReactDOM.render(<HazardLocalEffectsMap />, document.getElementById('hazardLocalEffects-map-container'));
}