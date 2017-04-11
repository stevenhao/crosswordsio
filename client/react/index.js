import Welcome from './welcome/index';
import Admin from './admin/index';
import Room from './room/index';

import ReactDOM from 'react-dom';
import React from 'react';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import './style.css';

ReactDOM.render(
  <Router>
    <div className='router-wrapper'>
      <Route exact path="/" component={Welcome}/>
      <Route path="/admin" component={Admin}/>
      <Route path="/game/:gid" component={Room}/>
    </div>
  </Router>,
  document.getElementById('root')
);

