import React from "react";
import ReactDOM from 'react-dom';

const ExposureMap = () => {
    return (<img src='../../../../../../modules/custom/map-component/src/img/Exposure.png' />);
};


export default ExposureMap;

if (document.getElementById('exposure-map-container') != null) {
  ReactDOM.render(<ExposureMap />, document.getElementById('exposure-map-container'));
}