import './style.css';
import nameGenerator from './nameGenerator';

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import actions, { db } from '../actions';

export default class Welcome extends Component {
  constructor() {
    super();
    this.state = {
      gameList: [],
      puzzleList: [],
      name: nameGenerator(),
    };
    this.gameListRef = db.ref('gamelist');
    this.puzzleListRef = db.ref('puzzlelist');
  }

  componentDidMount() {
    this.gameListRef.on('value', this.updateGameList.bind(this));
    this.puzzleListRef.on('value', this.updatePuzzleList.bind(this));
  }

  componentWillUnmount() {
    this.gameListRef.off();
    this.puzzleListRef.off();
  }

  updateGameList(gameList) {
    this.setState({ gameList: Object.values(gameList.val() || {} )});
  }

  updatePuzzleList(puzzleList) {
    this.setState({ puzzleList: Object.values(puzzleList.val() || {}) }, () => {
      if (!this.state.pid && this.state.puzzleList.length > 0) {
        this.setState({ pid: this.state.puzzleList[0].pid });
      }
    });
  }

  prevent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  handleNameChange(ev) {
    this.setState({ name: ev.target.value });
  }

  handleEmojiClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ name: nameGenerator() });
  }

  handleStartClick(ev) {
    if (!this.state.pid) return;
    actions.createGame({
      name: this.state.name,
      pid: this.state.pid
    });
  }

  handleSelectChange(ev) {
    console.log(ev.target.value);
    this.setState({ pid: ev.target.value });
  }

  render() {
    return (
      <div className='welcome'>
        <div className='welcome--join'>
          <div className='welcome--join--title'>
            Join a Game
          </div>
          <div className='welcome--join--gamelist'>
            {
              this.state.gameList.map((game, i) =>
                <Link key={i} to={'/game/' + game.gid} style={{ textDecoration: 'none', color: 'black' }}>
                  <div className='welcome--join--gamelist--game'>
                    <div>
                      {game.name}
                    </div>
                    <span> </span>
                  </div>
                </Link>
              )
            }
          </div>
        </div>
        <div className='welcome--create'>
          <div className='welcome--create--title'>
            Start a Game
          </div>

          <div className='welcome--create--options'>

            <div className='welcome--create--options--option'>
              <label>
                Select a puzzle {' '}
              </label>
              <select
                value={this.state.pid}
                onChange={this.handleSelectChange.bind(this)}>
                {
                  this.state.puzzleList.map((puzzle, i) => (
                    <option key={i} value={puzzle.pid}>
                      {puzzle.title}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className='welcome--create--options--option'>
              <label>
                Game name {' '}
              </label>
              <input
                className='welcome--create--options--option--name'
                value={this.state.name}
                onChange={this.handleNameChange.bind(this)}
              />
              <span
                className='emoji'
                onClick={this.handleEmojiClick.bind(this)}
                onMouseDown={this.prevent}>
                🔄
              </span>
            </div>
          </div>
          <button onClick={this.handleStartClick.bind(this)}>
            Go!
          </button>
        </div>
      </div>
    );
  }
}

