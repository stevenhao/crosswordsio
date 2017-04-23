import React, { Component } from 'react';
import { isInBounds, isWhite, getParent } from '../gameUtils';

class Cell extends Component {
  render() {
    if (this.props.black) {
      return (
        <div className='cell black'>
        </div>
      );
    }

    let val = this.props.value;
    // TODO remove backwards compat
    if (val === undefined) {
      if (this.props.edits && this.props.edits.value) { // backwards compat.
        val = this.props.edits.value;
      } else {
        val = '';
      }
    }

    let l = Math.max(1, val.length);
    return (
      <div
        className={this.props.selected
            ? 'cell selected'
            : (this.props.highlighted
              ? 'cell highlighted' 
              : 'cell')}
        onClick={this.props.onClick}>
        <div className='cell--number'>
          { this.props.number }
        </div>
        <div
          className='cell--tag'
          title='Hello'
        >
        </div>
        <div className='cell--value'
          style={{
            fontSize: 350 / Math.sqrt(l) + '%'
          }}
        >
          { val }
        </div>
      </div>
    );
  }
}

export default class Grid extends Component {
  constructor() {
    super();
  }

  isSelected(r, c) {
    const { grid, selected, direction } = this.props;
    return r === selected.r && c === selected.c;
  }

  isHighlighted(r, c) {
    const { grid, selected, direction } = this.props;
    return isWhite(grid, r, c) && (
      getParent(grid, selected.r, selected.c, direction)
      === getParent(grid, r, c, direction));
  }

  handleClick(r, c) {
    if (this.isSelected(r, c)) {
      this.props.changeDirection();
    } else {
      this.props.setSelected({r, c});
    }
  }

  render() {
    const size = this.props.size;
    return (
      <div className='grid'>
        {
          this.props.grid.map((row, r) => (
            row.map((cell, c) => (
              <div
                key={r+'_'+c}
                className='grid--cell'
                style={{
                  top: r * size,
                  left: c * size,
                  width: size,
                  height: size,
                  fontSize: size * .15 + 'px',
                }}
              >
                <Cell
                  {...cell}
                  onClick={this.handleClick.bind(this, r, c)}
                  selected={this.isSelected(r, c)}
                  highlighted={this.isHighlighted(r, c)}
                />
              </div>
            ))
          ))
        }
      </div>
    )
  }
}


