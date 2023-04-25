import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import Pong from './Pong';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Pong />
  </React.StrictMode>
);