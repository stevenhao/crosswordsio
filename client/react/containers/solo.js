import './solo.css';
import Room from './room';
import React, { Component } from 'react';
import { db } from '../actions';
import { makeGame } from '../gameUtils';

export default class Solo extends Room {
  constructor() {
    super();
  }

  componentDidMount() {
    db.ref('puzzle/' + this.props.match.params.pid).on('value', puzzle => {
      if (!this.state.loaded) {
        const game = makeGame(-1, '', puzzle.val());
        this.setState({
          loaded: true,
          game: game
        });
      } else {
        // TODO play while puzzle is being edited?
      }
    });
  }

  componentWillUnmount() {
    db.ref('puzzle/' + this.props.match.params.pid).off();
  }

  transaction(fn, cbk) {
    this.setState({
      game: fn(this.state.game)
    });
    if (cbk) cbk();
  }

  cellTransaction(r, c, fn, cbk) {
    this.transaction(game => {
      if (game && game.grid && game.grid[r] && game.grid[r][c]) {
        game.grid[r][c] = fn(game.grid[r][c]);
      }
      return game;
    }, cbk);
  }
};
