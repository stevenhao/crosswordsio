import './style.css';
import actions, { db } from '../actions';
import request from 'superagent';

import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

export default class Upload extends Component {
  constructor() {
    super();
    this.state = {
      file: null,
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

  puzzleIsValid() {
    if (!this.state.puzzle) return false;
    // TODO more validation
    return true;
  }

  getPuzzle() {
    return this.state.puzzle;
  }

  onDrop(acceptedFiles) {
    this.setState({
      file: acceptedFiles[0]
    });
    const req = request.post('/upload');
    req.attach('puz', acceptedFiles[0]);
    req.end((err, res) => {
      if (res.body.error) {
        this.setState({
          puzzle: null
        });
        return;
      }
      this.setState({
        puzzle: res.body.puzzle
      }, () => {
        if (this.puzzleIsValid()) {
          actions.createPuzzle(this.getPuzzle());
        }
      });
      window.URL.revokeObjectURL(acceptedFiles[0].preview);
    });
  }

  render() {
    return (
      <div className='admin'>
        <div className='admin--create'>
          <div className='admin--create--title'>
            Upload a puzzle
          </div>

        <br />
        <Dropzone onDrop={this.onDrop.bind(this)}>
          {
            this.state.file ? 'Uploaded ' + this.state.file.name : 'Drag or click to upload .puz'
          }
        </Dropzone>

        <div className='admin--create--preview'>
          {this.puzzleIsValid() ? 'Valid!' : 'Invalid'}
        </div>
      </div>
    </div>
    );
  }
};
