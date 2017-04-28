import Welcome from './welcome/index';
import Room from './room/index';
import Compose from './compose/index';
import Upload from './upload/index';

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
      <Route path="/game/:gid" component={Room}/>
      <Route exact path="/upload" component={Upload}/>
      <Route exact path="/compose" component={Compose}/>
    </div>
  </Router>,
  document.getElementById('root')
);

