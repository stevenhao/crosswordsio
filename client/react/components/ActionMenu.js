import React, { Component } from 'react';
import './actionMenu.css';

export default class ActionMenu extends Component {
  constructor() {
    super();
    this.state = {
      active: false
    };
  }

  onClick() {
    this.setState({active: !this.state.active});
  }

  onBlur() {
    this.setState({active: false});
  }

  render() {
    return (
      <div
        className={ (this.state.active ? 'active ' : '') + 'action-menu'}
        onBlur={this.onBlur.bind(this)}>
        <button
          className='action-menu--button'
          onClick={this.onClick.bind(this)} >
          {this.props.label}
        </button>
        <div className='action-menu--list'>
          {Object.keys(this.props.actions).map((key, i) => (
              <div
                key={i}
                className='action-menu--list--action'
                onClick={
                  this.props.actions[key]
                } >
                <span> {key} </span>
              </div>
          ))}
        </div>
      </div>
    );
  }
};
