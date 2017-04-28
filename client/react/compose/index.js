import './style.css';
import actions, { db } from '../actions';
import React, { Component } from 'react';
import Game from '../room/game';

export default class Compose extends Component {
  constructor() {
    super();
    this.state = {
      clues: {
        across: [],
        down: [],
      },
      grid: [[{
        black: false,
        number: 1,
        edits: [],
        value: '',
        parents: {
          across: 1,
          down: 1
        }
      }]],
    };
  }

  updateGrid(r, c, value) {
    const grid = JSON.parse(JSON.stringify(this.state.grid));
    grid[r][c].value = value;
    this.setState({
      grid: grid
    });
  }

  render() {
    const size = 35 * 15 / this.state.grid.length;
    return (
      <Game
        size={size}
        grid={this.state.grid}
        clues={this.state.clues}
        frozen={false}
        updateGrid={this.updateGrid.bind(this)}
      />
    );
  }
};
