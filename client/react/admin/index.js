import './style.css';
import actions, { db } from '../actions';

import React, { Component } from 'react';



export default class Admin extends Component {
  constructor() {
    super();
    this.state = {
      textbox: '',
      puzzleList: []
    };
    db.ref('puzzlelist').on('value', puzzleList => {
      this.setState({ puzzleList: puzzleList.val() || [] });
    });
  }

  prevent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  handleTextboxInput(ev) {
    this.setState({ textbox: ev.target.value }, () => {
      let puzzle;
      try {
        puzzle = JSON.parse(this.state.textbox);
        this.setState({ puzzle: puzzle });
      } catch(e) {
        try {
          eval(this.state.textbox);
          this.setState({ puzzle: puzzle });
        } catch(e) {
          console.error(e);
          this.setState({ puzzle: null });
        }
      }
    });
  }

  puzzleIsValid() {
    if (!this.state.puzzle) return false;
    // TODO more validation
    return true;
  }

  getPuzzle() {
    return this.state.puzzle;
  }

  handleGoClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    if (this.puzzleIsValid()) {
      console.log(this.getPuzzle());
      actions.createPuzzle(this.getPuzzle());
    }
  }

  render() {
    return (
      <div className='admin'>
        <div className='admin--create'>
          <div className='admin--create--title'>
            Upload a puzzle
          </div>

          <textarea
            className='admin--create--textbox'
            onInput={this.handleTextboxInput.bind(this)}
            value={this.state.textbox}
          />

        <button
          className='admin--create--go'
          onClick={this.handleGoClick.bind(this)}>
          Go!
        </button>
        <div className='admin--create--preview'>
          {this.puzzleIsValid() ? 'Valid!' : 'Invalid'}
        </div>
      </div>
    </div>
    );
  }
};
