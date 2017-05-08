import Welcome from './welcome/index';
import Room from './room/index';
import SoloGame from './solo/index';
import Compose from './compose/index';
import Upload from './upload/index';
import Puzzle from './puzzle/index';

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
      <Route exact path="/game/:gid" component={Room}/>
      <Route exact path="/game/solo/:pid" component={SoloGame}/>
      <Route path="/puzzle/:pid" component={Puzzle}/>
      <Route exact path="/upload" component={Upload}/>
      <Route exact path="/compose" component={Compose}/>
    </div>
  </Router>,
  document.getElementById('root')
);

