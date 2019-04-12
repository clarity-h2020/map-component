import 'babel-polyfill';
import 'es6-symbol/implement';
import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import App from './App';
// import "../node_modules/leaflet-loading/src/Control.Loading.js";
// import "../node_modules/leaflet-loading/src/Control.Loading.css";


const target = document.querySelector('.root');

if (target != null) {
    ReactDOM.render(
                <div>
                    <App />
                </div>,
                target
    );
}