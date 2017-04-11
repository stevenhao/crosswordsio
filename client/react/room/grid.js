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

    let l = 1;
    if (this.props.edits && this.props.edits.value) {
      l = Math.max(1, this.props.edits.value.length);
    }
    l = Math.sqrt(l);
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
        <div className='cell--edits'
          style={{
            fontSize: 350 / l + '%'
          }}
        >
          { (this.props.edits && this.props.edits.value) || '' }
        </div>
      </div>
    );
  }
}

export default class Grid extends Component {
  constructor() {
    super();
    this.state = {
      focused: false
    };
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

  handleKeyDown(ev) {
    const moveSelectedBy = (dr, dc) => () => {
      const { grid, selected, direction } = this.props;
      let { r, c } = selected;
      const step = () => {
        r += dr;
        c += dc;
      };
      step();
      while (isInBounds(grid, r, c)
        && !isWhite(grid, r, c)) {
          step();
      }
      if (isInBounds(grid, r, c)) {
        this.props.setSelected({ r, c });
      }
    };

    const setDirection = (direction, cbk) => () => {
      if (this.props.direction !== direction) {
        this.props.setDirection(direction);
      } else {
        cbk();
      }
    }

    const movement = {
      'ArrowLeft': setDirection('across', moveSelectedBy(0, -1)),
      'ArrowUp': setDirection('down', moveSelectedBy(-1, 0)),
      'ArrowDown': setDirection('down', moveSelectedBy(1, 0)),
      'ArrowRight': setDirection('across', moveSelectedBy(0, 1)),
      'Backspace': this.props.backspace,
      'Tab': this.props.selectNextClue,
    };

    if (ev.key in movement) {
      ev.preventDefault();
      ev.stopPropagation();
      movement[ev.key](ev.shiftKey);
    } else {
      const letter = ev.key.toUpperCase();
      if (!ev.metaKey && !ev.ctrlKey && letter.match(/^[A-Z0-9]$/)) {
        ev.preventDefault();
        ev.stopPropagation();
        this.props.typeLetter(letter, ev.shiftKey);
      }
    }
  }

  handleFocus(ev) {
    this.setState({ focus: true });
  }

  handleBlur(ev) {
    this.setState({ focus: false });
  }

  render() {
    const size = this.props.size;
    return (
      <div
        className='grid'
        tabIndex='1'
        onKeyDown={this.handleKeyDown.bind(this)}
        onFocus={this.handleFocus.bind(this)}
        onBlur={this.handleBlur.bind(this)}>
        {
          this.props.grid.map((row, r) => (
            row.map((cell, c) => (
              <div
                key={r+'_'+c}
                className='game--main--left--grid--cell'
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
                  onClick={this.props.setSelected.bind(this, {r, c})}
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


