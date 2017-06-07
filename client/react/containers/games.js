import './games.css';

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import actions, { db } from '../actions';
import Upload from '../components/upload'

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
    this.setState({
      puzzleList: [
        {
          info: {
            type: 'Mini Puzzle',
            author: 'steve',
            title: 'monday'
          },
          pid: 1,
          private: false,
        },
        {},
      ]
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
      !puzzle.private
    ));
  }

  renderGameItem(game) {
    return (
      <div className='game-item'>
      </div>
    );
  }

  render() {
    return (
      <div className='games'>
        <div className='games--nav'>
          <div className='games--nav--left'>
            <div className='games--nav--title'>
              <Link to='/games'>
                DownForACross
              </Link>
            </div>
            <div className='games--nav--play'>
              <Link to='/games'>
                Play
              </Link>
            </div>
            <div className='games--nav--compose'>
              <Link to='/compose'>
                Compose
              </Link>
            </div>
          </div>

          <div className='games--nav--right'>
            <Link to='/games'>
              Log in/Sign up
            </Link>
          </div>
        </div>
        <div className='games--toolbar'>
          <div className='games--toolbar--quick-play'>
            <button>
              Quick Play
            </button>
          </div>
          <div className='games--toolbar--sort-by'>
            <select>
              <option>Newest Added</option>
            </select>
          </div>
          <div className='games--toolbar--search'>
            <input placeholder='Search'>
            </input>
          </div>
        </div>
        <div className='games--main'>
          <div className='games--main--left'>
            <!-- Filters -->
            <b>Source</b>
            <b>Size</b>
            <b>Difficulty</b>
            <b>Rating</b>
            <b>Solved?</b>
          </div>
          <div className='game--main--right'>
            { this.state.games.map(game => (
              this.renderGameItem(game)
            )) }
          </div>
        </div>
      </div>
    );
  }
}

