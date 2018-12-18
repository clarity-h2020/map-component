import React from "react";
import ReactDOM from 'react-dom';

const CharacteriseHazardTable = () => {
    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/01-HC-03-Table.png' />);
};


export default CharacteriseHazardTable;

if (document.getElementById('characteriseHazard-table-container') != null) {
    ReactDOM.render(<CharacteriseHazardTable />, document.getElementById('characteriseHazard-table-container'));
}