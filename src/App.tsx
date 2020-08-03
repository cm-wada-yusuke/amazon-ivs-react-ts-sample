import React from 'react';
import logo from './logo.svg';
import './App.css';
import { unregister } from './serviceWorker';
import AmazonIVS from './AmazonIVS';
unregister();

function App() {
  return (
    <div className="App">
      <AmazonIVS stream={''} />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
