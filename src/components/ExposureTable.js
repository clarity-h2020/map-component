import React from "react";
import ReactDOM from 'react-dom';

const ExposureTable = () => {
    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/03-EE-03-table.png' />);
};


if (document.getElementById('exposure-table-container') != null) {
  ReactDOM.render(<ExposureTable />, document.getElementById('exposure-table-container'));
}