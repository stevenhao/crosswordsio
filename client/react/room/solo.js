import './style.css';
import actions, { db } from '../actions';
import Game from './game';
import Clock from './clock';
import { countMistakes } from '../gameUtils';
import React, { Component } from 'react';
import { makeGame } from '../gameUtils';

function toArr(a) {
  if (Array.isArray(a)) return a;
  const ret = [];
  Object.keys(a).forEach(i => {
    ret[i] = a[i];
  });
  return ret;
}

export default class SoloGame extends Component {
  constructor() {
    super();
    this.state = {
      uid: 0,
      loaded: false,
      game: {
        name: undefined,
        info: undefined,
        clues: {
          across: [],
          down: [],
        },
        solution: [['']],
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
        startTime: undefined,
        chat: {
          users: [],
          messages: [],
        },
      }
    };
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

  startClock() {
    if (!this.state.startTime) {
      this.setState({game: Object.assign(this.state.game, {
        startTime: new Date().getTime()
      })});
    }
  }

  stopClock() {
    this.setState({game: Object.assign(this.state.game, {
      stopTime: new Date().getTime()
    })});
  }

  checkIfSolved() {
    if (countMistakes(this.state.game.grid, this.state.game.solution) === 0) {
      this.stopClock();
      this.setState({game: Object.assign(this.state.game, {
        solved: true
      })});
    }
  }

  updateGrid(r, c, value) {
    let grid = JSON.parse(JSON.stringify(this.state.game.grid));
    grid[r][c].edits.push({
      time: new Date().getTime(),
      value: value});
    grid[r][c].value = value;

    this.setState({game: Object.assign(this.state.game, {
      grid: grid
    })});

    this.startClock();
    this.checkIfSolved();
  }

  render() {
    const size = 35 * 15 / this.state.game.grid.length;
    return (
      <div className='room'>
        <div className='room--info'>
          <div className='room--info--title'>
            {
              this.state.game.info && this.state.game.info.title
            }
          </div>
          <div className='room--info--subtitle'>
            {
              this.state.game.info && (
                this.state.game.info.type + ' | '
                + 'By ' + this.state.game.info.author
              )
            }
          </div>
        </div>

        <div className='room--toolbar'>
          <div className='room--toolbar--timer'>
            <Clock
              startTime={this.state.game.startTime}
              stopTime={this.state.game.stopTime}
            />
          </div>
        </div>

        <div className='room--game-and-chat-wrapper'>
          <Game
            size={size}
            grid={this.state.game.grid}
            clues={{
              across: toArr(this.state.game.clues.across),
              down: toArr(this.state.game.clues.down)
            }}
            frozen={this.state.game.solved}
            updateGrid={this.updateGrid.bind(this)}
          />
        </div>
      </div>
    );
  }
};
