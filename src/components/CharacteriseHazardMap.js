import React from "react";
import ReactDOM from 'react-dom';

const CharacteriseHazardMap = () => {
    return (<img width={1008} height={578} src='../../../../../../modules/custom/map-component/src/img/CharacteriseHazard.png' />);
};


export default CharacteriseHazardMap;

if (document.getElementById('characteriseHazard-map-container') != null) {
    ReactDOM.render(<CharacteriseHazardMap />, document.getElementById('characteriseHazard-map-container'));
}