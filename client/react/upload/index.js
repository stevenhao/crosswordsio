import './style.css';

import actions, { db } from '../actions';
import FileUploader from './fileUploader';

import React, { Component } from 'react';



export default class Upload extends Component {
  constructor() {
    super();
    this.state = {
      uploaded: false,
      textbox: '',
      puzzle: null
    };
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
    this.setState({
      puzzle: puzzle,
      uploaded: true
    });
  }

  failUpload() {
    this.setState({
      uploaded: true
    });
  }

  handleGoClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    if (this.puzzleIsValid()) {
      actions.createPuzzle(this.getPuzzle(), pid => {
        this.props.history.push(`/puzzle/${pid}`);

      });
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
                failUpload={this.failUpload.bind(this)}
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

          {
            (this.state.textbox || this.state.uploaded)
              ? (<div className='admin--create--preview'>
                Uploaded puzzle is <b>{this.puzzleIsValid() ? 'valid!' : 'invalid'}</b>
              </div>)
              : null
          }
          <button
            className='admin--create--go'
            onClick={this.handleGoClick.bind(this)}>
            Create Puzzle
          </button>
        </div>
      </div>
    );
  }
};
