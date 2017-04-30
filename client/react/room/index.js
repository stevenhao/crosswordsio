import './style.css';
import actions, { db } from '../actions';
import Game from './game';
import ActionMenu from '../components/ActionMenu';
import Chat from './chat';
import Clock from './clock';
import { countMistakes } from '../gameUtils';
import React, { Component } from 'react';

function toArr(a) {
  if (Array.isArray(a)) return a;
  const ret = [];
  Object.keys(a).forEach(i => {
    ret[i] = a[i];
  });
  return ret;
}

export default class Room extends Component {
  constructor() {
    super();
    this.state = {
      uid: 0,
      game: {
        gid: undefined,
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
        createTime: undefined,
        startTime: undefined,
        chat: {
          users: [],
          messages: [],
        },
      }
    };
  }

  componentDidMount() {
    db.ref('game/' + this.props.match.params.gid).on('value', game => {
      this.setState({
        game: Object.assign(this.state.game, game.val())
      });
    });
  }

  startClock() {
    db.ref(`game/${this.state.game.gid}/startTime`).transaction(startTime => startTime ? startTime : new Date().getTime());
  }

  stopClock() {
    db.ref(`game/${this.state.game.gid}/stopTime`).set(new Date().getTime());
  }

  checkIfSolved() {
    if (countMistakes(this.state.game.grid, this.state.game.solution) === 0) {
      this.stopClock();
      db.ref(`game/${this.state.game.gid}/solved`).set(true);
    }
  }

  updateGrid(r, c, value) {
    db.ref(`game/${this.state.game.gid}`).transaction(game => {
      if (!(game.solved || game.grid[r][c].good)) {
        game.grid[r][c].edits = [
          ...(game.grid[r][c].edits || []), {
            time: new Date().getTime(),
            value: value
          }];
        game.grid[r][c].value = value;
        game.grid[r][c].bad = false;
        game.grid[r][c].good = false;
      }
      return game;
    });
    this.startClock();
    this.checkIfSolved();
  }

  sendChatMessage(sender, text) {
    db.ref(`game/${this.state.game.gid}/chat/messages`).transaction(messages => {
      if (!messages) messages = [];
      messages.push({
        sender: sender,
        text: text
      });
      return messages;
    });
  }

  pauseClock() {
  }

  isMistake(r, c) {
    return this.props.game.grid[r][c].value !== this.props.game.solution[r][c];
  }

  getAllSquares() {
    let result = [];
    this.state.game.grid.forEach((row, r) => {
      result = result.concat(row.map((cell, c) => ({
        r: r,
        c: c
      })));
    });
    return result;
  }

  getSelectedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.refs.game.isSelected(r, c));
  }

  getSelectedAndHighlightedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.refs.game.isSelected(r, c) || this.refs.game.isHighlighted(r, c));
  }

  _checkSquare(r, c) {
    const solution = this.state.game.solution;
    db.ref(`game/${this.state.game.gid}/grid/${r}/${c}`)
      .transaction(sq => {
        if (sq.value !== '') {
          if (sq.value === solution[r][c]) {
            sq.good = true;
          } else {
            sq.bad = true;
            sq.helped = true;
          }
        }
        return sq;
      });
  }

  checkSquare() {
    this.getSelectedSquares().forEach(({r, c}) => {
      this._checkSquare(r, c);
    });
  }

  checkWord() {
    this.getSelectedAndHighlightedSquares().forEach(({r, c}) => {
      this._checkSquare(r, c);
    });
  }

  checkPuzzle() {
    this.getAllSquares().forEach(({r, c}) => {
      this._checkSquare(r, c);
    });
  }

  _revealSquare(r, c) {
    const solution = this.state.game.solution;
    db.ref(`game/${this.state.game.gid}/grid/${r}/${c}`)
      .transaction(sq => {
        if (sq.value !== solution[r][c]) {
          sq.value = solution[r][c];
          sq.helped = true;
        }
        sq.good = true;
        return sq;
      });
  }

  revealSquare() {
    this.getSelectedSquares().forEach(({r, c}) => {
      this._revealSquare(r, c);
    });
  }

  revealWord() {
    this.getSelectedAndHighlightedSquares().forEach(({r, c}) => {
      this._revealSquare(r, c);
    });
  }

  revealPuzzle() {
    this.getAllSquares().forEach(({r, c}) => {
      this._revealSquare(r, c);
    });
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
          <button
            className='room--toolbar--btn pause'
            onClick={this.pauseClock.bind(this)} >
            Pause Clock
          </button>
          <div className='room--toolbar--menu check'>
            <ActionMenu
              label='Check'
              actions={{
                'Square': this.checkSquare.bind(this),
                'Word': this.checkWord.bind(this),
                'Puzzle': this.checkPuzzle.bind(this)
              }} />

          </div>
          <div className='room--toolbar--menu reveal'>
            <ActionMenu
              label='Reveal'
              actions={{
                'Square': this.revealSquare.bind(this),
                'Word': this.revealWord.bind(this),
                'Puzzle': this.revealPuzzle.bind(this)
              }} />
          </div>
        </div>

        <div className='room--game-and-chat-wrapper'>
          <Game
            ref='game'
            size={size}
            grid={this.state.game.grid}
            solution={this.state.game.solution}
            clues={{
              across: toArr(this.state.game.clues.across),
              down: toArr(this.state.game.clues.down)
            }}
            frozen={this.state.game.solved}
            updateGrid={this.updateGrid.bind(this)}
          />

        <Chat
          chat={this.state.game.chat}
          sendChatMessage={this.sendChatMessage.bind(this)} />
      </div>
    </div>
    );
  }
};
