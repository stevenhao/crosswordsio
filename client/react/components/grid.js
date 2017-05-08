import React, { Component } from 'react';
import { isInBounds, isWhite, getParent } from '../gameUtils';

import Cell from './cell';

/*
 * Summary of Grid component
 *
 * Props: { grid, size, selected, direction, onSetSelected, onChangeDirection }
 *
 * State: {}
 *
 * Children: [Cell x "n^2"]
 *
 * Potential parents (so far):
 * - Player, Editor
 * - Previewer (TODO)
 **/

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
    return !this.isSelected(r, c) && isWhite(grid, r, c) && (
      getParent(grid, selected.r, selected.c, direction)
      === getParent(grid, r, c, direction));
  }

  handleClick(r, c) {
    if (this.isSelected(r, c)) {
      this.props.onChangeDirection();
    } else {
      this.props.onSetSelected({r, c});
    }
  }

  render() {
    const size = this.props.size;
    return (
      <table
        style={{
          width: this.props.grid[0].length * this.props.size,
          height: this.props.grid.length * this.props.size
        }}
        className='grid'>
        <tbody>
          {
            this.props.grid.map((row, r) => (
              <tr key={r}>
                {
                  row.map((cell, c) => (
                    <td
                      key={r+'_'+c}
                      className='grid--cell'
                      style={{
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
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    )
  }
}


