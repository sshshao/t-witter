import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import Home from './Home/Home';
import Timeline from './Timeline/Timeline';
import NotFound from './NotFound/NotFound';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Twitter</h1>
        </header>
        
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/timeline" component={Timeline} />
            <Route exact path="/*" component={NotFound} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;