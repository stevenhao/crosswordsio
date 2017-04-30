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
        game: game.val()
      });
    });
  }

  stopClock() {
    db.ref(`game/${this.state.game.gid}/stopTime`).set(new Date().getTime());
  }

  checkIsSolved(game) {
    if (countMistakes(game.grid, game.solution) === 0) {
      game.solved = true;
      if (!game.stopTime) {
        game.stopTime = new Date().getTime();
      }
    } else {
      game.solved = false;
    }
    return game;
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

      this.checkIsSolved(game);
      return game;
    });
    this.startClock();
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

  startClock() {
    db.ref(`game/${this.state.game.gid}`).transaction(game => {
      if (game.stopTime) {
        return;
      }
      if (!game.startTime) {
        game.startTime = new Date().getTime();
      }
      return game;
    });
  }

  pauseClock() {
    db.ref(`game/${this.state.game.gid}`).transaction(game => {
      if (game.stopTime) {
        return;
      }
      if (game.startTime) {
        game.pausedTime = game.pausedTime || 0;
        game.pausedTime += new Date().getTime() - game.startTime;
        game.startTime = null;
      }
      return game;
    });
  }

  scope(s) {
    return {
      'square': () => this.refs.game.getSelectedSquares(),
      'word': () => this.refs.game.getSelectedAndHighlightedSquares(),
      'puzzle': () => this.refs.game.getAllSquares()
    }[s];
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

  check(scope) {
    scope().forEach(({r, c}) => {
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

  reveal(scope) {
    scope().forEach(({r, c}) => {
      this._revealSquare(r, c);
    });
    db.ref(`game/${this.state.game.gid}`)
      .transaction(game => this.checkIsSolved(game));
  }

  _resetSquare(r, c) {
    db.ref(`game/${this.state.game.gid}/grid/${r}/${c}`)
      .transaction(sq => {
        sq.value = '';
        sq.good = false;
        sq.bad = false;
        sq.helped = false;
        return sq;
      });
  }

  reset(scope) {
    scope().forEach(({r, c}) => {
      this._resetSquare(r, c);
    });
    db.ref(`game/${this.state.game.gid}`)
      .transaction(game => this.checkIsSolved(game));
  }

  resetClock() {
    db.ref(`game/${this.state.game.gid}`)
      .transaction(game => {
        game.startTime = null;
        game.stopTime = null;
        game.pausedTime = null;
        return game;
      });
  }

  resetPuzzleAndTimer() {
    this.reset(this.scope('puzzle'));
    this.resetClock();
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
                  {
                    this.state.game.info && this.state.game.info.title
                  }
                </a>
              )
              : (
                <div
                  className='room--info--title'>
                  {
                    this.state.game.info && this.state.game.info.title
                  }
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
          <div className='room--toolbar--timer'>
            <Clock
              startTime={this.state.game.startTime}
              stopTime={this.state.game.stopTime}
              pausedTime={this.state.game.pausedTime}
            />
          </div>
          {
            this.state.game.solved
              ? null
              : ( this.state.game.startTime
                ?(
                  <button
                    className='room--toolbar--btn pause'
                    onClick={this.pauseClock.bind(this)} >
                    Pause Clock
                  </button>
                )
                :(
                  <button
                    className='room--toolbar--btn start'
                    onClick={this.startClock.bind(this)} >
                    Start Clock
                  </button>
                )
              )
          }
          {
            this.state.game.solved
              ? null
              : (
                <div className='room--toolbar--menu check'>
                  <ActionMenu
                    label='Check'
                    actions={{
                      'Square': this.check.bind(this, this.scope('square')),
                      'Word': this.check.bind(this, this.scope('word')),
                      'Puzzle': this.check.bind(this, this.scope('puzzle')),
                    }} />

                </div>
              )
          }
          {
            this.state.game.solved
              ? null
              : (
                <div className='room--toolbar--menu reveal'>
                  <ActionMenu
                    label='Reveal'
                    actions={{
                      'Square': this.reveal.bind(this, this.scope('square')),
                      'Word': this.reveal.bind(this, this.scope('word')),
                      'Puzzle': this.reveal.bind(this, this.scope('puzzle')),
                    }} />
                </div>
              )
          }
          <div className='room--toolbar--menu reset'>
            <ActionMenu
              label='Reset'
              actions={{
                'Square': this.reset.bind(this, this.scope('square')),
                'Word': this.reset.bind(this, this.scope('word')),
                'Puzzle': this.reset.bind(this, this.scope('puzzle')),
                'Puzzle and Timer': this.resetPuzzleAndTimer.bind(this)
              }} />
          </div>
        </div>

        <div className='room--game-and-chat-wrapper'>
          <Game
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
          sendChatMessage={this.sendChatMessage.bind(this)} />
      </div>
    </div>
    );
  }
};
