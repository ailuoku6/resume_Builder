import React from 'react';
import ReactDOM from 'react-dom';

import App from './app/App';
import './app/styles/global.css';

const globalScope = globalThis as typeof globalThis & {
  global?: typeof globalThis;
};

if (!globalScope.global) {
  globalScope.global = globalThis;
}

ReactDOM.render(<App />, document.getElementById('root'));
