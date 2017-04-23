import './style.css';
import actions, { db } from '../actions';
import Game from './game';
import Chat from './chat';
import Clock from './clock';
import { countMistakes } from '../gameUtils';
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
    db.ref(`game/${this.state.game.gid}/grid/${r}/${c}/value`)
      .set(value);
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
            clues={this.state.game.clues}
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
