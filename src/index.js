import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Dashboard from './Dashboard';

import reportWebVitals from './reportWebVitals';
import {
  Web3ReactProvider,
  useWeb3React,
  UnsupportedChainIdError
} from "@web3-react/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Web3Provider } from "@ethersproject/providers";

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;
  return library;
}

function MyApp() {
  return (
    <Router>
    <div>
<Web3ReactProvider getLibrary={getLibrary}>
<Switch>  
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/">
            <App />
          </Route>
        </Switch>
    </Web3ReactProvider>
    </div>
    </Router>

  );
}


ReactDOM.render(<MyApp />, document.getElementById("root"));