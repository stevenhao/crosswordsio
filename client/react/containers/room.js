import './room.css';
import actions, { db } from '../actions';
import Player from '../components/player';
import Chat from '../components/chat';
import Toolbar from '../components/toolbar';
import { isSolved } from '../gameUtils';
import { toArr } from '../jsUtils';

import React, { Component } from 'react';

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
        game: game.val()
      });
    });
  }

  componentWillUnmount() {
    db.ref('game/' + this.props.match.params.gid).off();
  }

  transaction(fn, cbk) {
    db.ref('game/' + this.props.match.params.gid).transaction(fn, cbk);
  }

  cellTransaction(r, c, fn, cbk) {
    db.ref('game/' + this.props.match.params.gid + '/grid/' + r + '/' + c).transaction(fn, cbk);
  }

  checkIsSolved() {
    if (isSolved(this.state.game.grid, this.state.game.solution)) {
      this.transaction(game => (
        Object.assign(game, {
          solved: true,
          stopTime: game.stopTime || new Date().getTime()
        })
      ));
      return true;
    } else {
        /*this.transaction(game => (
        Object.assign(game, {
          solved: false
        })
      ));*/
      return false;
    }
  }

  updateGrid(r, c, value) {
    if (this.checkIsSolved()) {
      return;
    }

    function takeLast(num, ar) {
      return ar.length > num ? ar.slice(ar.length - num) : ar;
    }

    this.cellTransaction(r, c, cell => (
      Object.assign(cell, {
        edits: takeLast(10, [...(cell.edits || []), {
          time: new Date().getTime(),
          value: value
        }]),
        value: value,
        bad: false,
        good: false,
      })
    ), () => {
      this.checkIsSolved();
    });

    this.startClock();
  }

  sendChatMessage(sender, text) {
    this.transaction(game => (
      Object.assign(game, {
        chat: Object.assign(game.chat, {
          messages: (game.chat.messages || []).concat([
            {
              sender: sender,
              text: text
            }
          ])
        })
      })
    ));
  }

  startClock() {
    if (this.state.game.startTime || this.state.game.stopTime) return;
    this.transaction(game => (
      Object.assign(game, {
        startTime: Math.max(game.startTime || 0,
          new Date().getTime())
      }))
    );
  }

  pauseClock() {
    if (this.state.game.startTime || this.state.game.stopTime) return;
    this.transaction(game => (
      Object.assign(game, {
        startTime: game.stopTime
        ? null
        : Math.max(game.startTime || 0,
          new Date().getTime())
      }))
    );
  }

  stopClock() {
    this.transaction(game => (
      Object.assign(game, {
        stopTime: new Date().getTime()
      })
    ));
  }

  resetClock() {
    this.transaction(game => {
      game.startTime = null;
      game.stopTime = null;
      game.pausedTime = null;
      return game;
    });
  }

  scope(s) {
    if (s === 'square') {
      return this.refs.game.getSelectedSquares();
    } else if (s === 'word') {
      return this.refs.game.getSelectedAndHighlightedSquares();
    } else if (s === 'puzzle') {
      return this.refs.game.getAllSquares();
    } else {
      return [];
    }
  }

  _checkSquare(r, c) {
    const solution = this.state.game.solution;
    this.cellTransaction(r, c, cell => (
      Object.assign(cell, {
        good: cell.value !== '' && cell.value === solution[r][c],
        bad: cell.value !== '' && cell.value !== solution[r][c],
        helped: cell.value !== '' && cell.vaule !== solution[r][c]
      })
    ));
  }

  check(scopeString) {
    this.scope(scopeString).forEach(({r, c}) => {
      this._checkSquare(r, c);
    });
  }

  _revealSquare(r, c) {
    const solution = this.state.game.solution;
    this.cellTransaction(r, c, cell => (
      Object.assign(cell, {
        value: solution[r][c],
        good: cell.value !== '',
        helped: cell.value !== '' && cell.vaule !== solution[r][c]
      })
    ));
  }

  reveal(scopeString) {
    this.scope(scopeString).forEach(({r, c}) => {
      this._revealSquare(r, c);
    });
    this.checkIsSolved();
  }

  _resetSquare(r, c) {
    this.cellTransaction(r, c, cell => (
      Object.assign(cell, {
        value: '',
        good: false,
        bad: false,
        helped: false
      })
    ));
  }

  reset(scopeString) {
    this.scope(scopeString).forEach(({r, c}) => {
      this._resetSquare(r, c);
    });
    this.checkIsSolved();
  }

  render() {
    const size = 35 * 15 / this.state.game.grid.length;
    return (
      <div className='room'>
        <div className='room--info'>
          {
            this.state.game.pid
              ? (
                <a
                  href={`/puzzle/${this.state.game.pid}`}
                  className='room--info--title'>
                  { this.state.game.info && this.state.game.info.title }
                </a>
              )
              : (
                <div
                  className='room--info--title'>
                  { this.state.game.info && this.state.game.info.title }
                </div>
              )
          }
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
          <Toolbar
            startTime={this.state.game.startTime}
            stopTime={this.state.game.stopTime}
            pausedTime={this.state.game.pausedTime}
            solved={this.state.game.solved}
            onPauseClock={this.pauseClock.bind(this)}
            onStartClock={this.startClock.bind(this)}
            onCheck={this.check.bind(this)}
            onReveal={this.reveal.bind(this)}
            onReset={this.reset.bind(this)}
            onResetClock={this.resetClock.bind(this)}
          />
        </div>

        <div className='room--game-and-chat-wrapper'>
          <Player
            ref='game'
            size={size}
            grid={this.state.game.grid}
            clues={{
              across: toArr(this.state.game.clues.across),
              down: toArr(this.state.game.clues.down)
            }}
            frozen={this.state.game.solved}
            updateGrid={this.updateGrid.bind(this)}
          />

        <Chat
          chat={this.state.game.chat || {messages: [], users: []}}
          onSendChatMessage={this.sendChatMessage.bind(this)} />
      </div>
    </div>
    );
  }
};
