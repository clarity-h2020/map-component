import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MapComp from './MapComp';
import CharacteriseHazardMap from './components/CharacteriseHazardMap';
import ExposureMap from './components/ExposureMap';
import HazardLocalEffectsMap from './components/HazardLocalEffectsMap';
import RiskAndImpactMap from './components/RiskAndImpact';
import StudyAreaMap from './components/StudyAreaMap';
import VulnerabilityMap from './components/VulnerabilityMap';
//import styledLayerControl from './styledLayerControl';
import registerServiceWorker from './registerServiceWorker';

//ReactDOM.render(<MapComp />, document.getElementById('root'));

if (document.getElementById('exposure-map-container') != null) {
    ReactDOM.render(<ExposureMap />, document.getElementById('exposure-map-container'));
}
if (document.getElementById('hazardLocalEffects-map-container') != null) {
    ReactDOM.render(<HazardLocalEffectsMap />, document.getElementById('hazardLocalEffects-map-container'));
}
if (document.getElementById('riskAndImpact-map-container') != null) {
    ReactDOM.render(<RiskAndImpactMap />, document.getElementById('riskAndImpact-map-container'));
}
if (document.getElementById('studyArea-map-container') != null) {
    ReactDOM.render(<StudyAreaMap />, document.getElementById('studyArea-map-container'));
}
if (document.getElementById('vulnerability-map-container') != null) {
    ReactDOM.render(<VulnerabilityMap />, document.getElementById('vulnerability-map-container'));
}
if (document.getElementById('characteriseHazard-map-container') != null) {
    ReactDOM.render(<CharacteriseHazardMap />, document.getElementById('characteriseHazard-map-container'));
}
registerServiceWorker();
