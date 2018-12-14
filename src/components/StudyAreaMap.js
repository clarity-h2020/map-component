import React from "react";
import ReactDOM from 'react-dom';

const StudyAreaMap = () => {
    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/StudyArea.png' />);
};

export default StudyAreaMap;

if (document.getElementById('studyArea-map-container') != null) {
    ReactDOM.render(<StudyAreaMap />, document.getElementById('studyArea-map-container'));
}