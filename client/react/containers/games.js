import './games.css';

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import actions, { db } from '../actions';

function values(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

export default class Games extends Component {
  constructor() {
    super();
    this.state = {
      puzzleList: [],
      selected: null, // an element of state.puzzleList
      // todo: filters, sortby
    };
  }

  componentDidMount() {
    this.puzzleListRef = db.ref('puzzlelist');
    this.puzzleListRef.on('value', v => {
      this.setState({
        puzzleList: v.val()
      })
    });
  }

  componentWillUnmount() {
  }

  select(selected) {
    this.setState({
      selected: selected
    });
  }

  get puzzleList() {
    return this.state.puzzleList.filter(puzzle => (
      puzzle.private
    ));
  }

  render() {
    return (
      <div className='welcome'>
        <div className='welcome--browse'>
          <div className='welcome--browse--puzzlelist--wrapper'>
            <div className='welcome--browse--puzzlelist minis'>
              <div className='welcome--browse--title'>
                Mini Puzzles
              </div>
              {
                this.state.puzzleList.slice().reverse()
                  .filter(entry => (
                    entry.info && entry.info.type === 'Mini Puzzle'
                  ))
                  .map((entry, i) =>
                    <Link key={i} to={'/puzzle/' + entry.pid} style={{ textDecoration: 'none', color: 'black' }}>
                      <div className='welcome--browse--puzzlelist--entry'>
                        <div>
                          {entry.info.title + (entry.info.author ? (' by ' + entry.info.author) : '') }
                        </div>
                      </div>
                    </Link>
                  )
              }
            </div>
            <div className='welcome--browse--puzzlelist dailies'>
              <div className='welcome--browse--title'>
                Daily Puzzles
              </div>
              {
                this.state.puzzleList.slice().reverse()
                  .filter(entry => (
                    !entry.info || entry.info.type === 'Daily Puzzle'
                  ))
                  .map((entry, i) =>
                    <Link key={i} to={'/puzzle/' + entry.pid} style={{ textDecoration: 'none', color: 'black' }}>
                      <div className='welcome--browse--puzzlelist--entry'>
                        <div>
                          {entry.title + (entry.author ? (' by ' + entry.author) : '') }
                        </div>
                      </div>
                    </Link>
                  )
              }
            </div>
          </div>
        </div>
        <div className='welcome--upload'>
          <div className='welcome--upload--title'>
            Upload Puzzles
          </div>
          <Upload history={this.props.history}/>
        </div>
      </div>
    );
  }
}

