import './style.css';

import actions, { db } from '../actions';
import FileUploader from './fileUploader';

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

  setPuzzle(puzzle) {
    this.setState({puzzle, puzzle});
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
          <div className='admin--create--main'>
            <div className='admin--create--main--upload'>
              <div className='admin--create--main--upload--title'>
                Upload a .puz file here...
              </div>
              <FileUploader
                setPuzzle={this.setPuzzle.bind(this)}
              />
            </div>
            <div className='admin--create--main--paste'>
              <div className='admin--create--main--paste--title'>
                ... or paste a JSON here
              </div>
              <textarea
                placeholder='Type Here'
                className='admin--create--main--paste--textbox'
                onInput={this.handleTextboxInput.bind(this)}
                value={this.state.textbox}
              />
            </div>
          </div>

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
