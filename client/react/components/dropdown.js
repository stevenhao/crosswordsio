import './dropdown.css';

import React, { Component } from 'react';

export default class Dropdown extends Component {
  constructor(props) {
    super();
    this.state = {
      selected: props.options[0] || '',
      expanded: false,
    };
  }

  onSelect(i) {
    this.setState({
      selected: this.props.options[i],
      expanded: false
    });
    this.props.onSelect && this.props.onSelect(i);
  }

  onFocus() {
    this.setState({ expanded: true });
  }

  onBlur() {
    this.setState({ expanded: false});
  }

  render() {
    return (
      <div
        className={
        'dropdown' + (
          this.state.expanded
          ? ' expanded'
          : ''
        )}
        tabIndex="1"
        onFocus={() => this.onFocus()}
        onBlur={() => this.onBlur()} >
        <button
          className='dropdown--main'
          onClick={() => this.onClick()}>
          <div className='dropdon--main--label'>
            {this.state.selected}
          </div>
          <div className='dropdown--main--downarrow'>
            {'▼'}
          </div>
        </button>
        <div className='dropdown--options'>
          {this.props.options
              .map((option, i) => (
                <div
                  key={i}
                  className='dropdown--options--option'
                  onClick={() => this.onSelect(i)}
                >
                  {option}
                </div>
              ))
          }
        </div>
      </div>
    );
  }
}
