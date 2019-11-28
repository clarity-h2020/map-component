import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

const target = document.querySelector('.root');

if (target != null) {
	ReactDOM.render(
		<div>
			<App />
		</div>,
		target
	);
}
