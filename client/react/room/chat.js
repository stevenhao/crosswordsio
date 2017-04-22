import './style.css';

import React, { Component } from 'react';

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      message: '',
      username: 'anonymous'
    };
  }

  onKeyPress(ev) {
    if (ev.key === 'Enter') {
      ev.stopPropagation();
      ev.preventDefault();
      this.props.sendChatMessage(this.state.username, this.state.message);
      this.setState({message: ''});
    }
  }

  onChange(ev) {
    this.setState({message: ev.target.value});
  }

  onChangeUsername(ev) {
    this.setState({username: ev.target.value});
  }

  render() {
    return (
      <div className='chat'>
        <div className='chat--header'>
          <div className='chat--title'>
            Chat
          </div>
          <div className='chat--username'>
            Your username:
            <input
              className='chat--username--input'
              value={this.state.username}
              onChange={this.onChangeUsername.bind(this)} />
          </div>
        </div>

        <div className='chat--messages'>
        {
          this.props.chat.messages.map((message, i) => (
            <div key={i} className='chat--message'>
              <div className='chat--message--sender'>{message.sender}</div>
              {':'}
              <div className='chat--message--text'>{message.text}</div>
            </div>
          ))
        }
      </div>

        <div className='chat--bar'>
          <input
            className='chat--bar--input'
            placeholder='Send a message'
            value={this.state.message}
            onChange={this.onChange.bind(this)}
            onKeyPress={this.onKeyPress.bind(this)}
          />
        </div>
      </div>
    );
  }
};
