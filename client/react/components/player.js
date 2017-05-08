import './player.css';

import Grid from './grid';
import GridControls from './gridControls';
import React, { Component } from 'react';


import { isGridFilled, getNextCell, getNextEmptyCell, getNextEmptyCellAfter, hasEmptyCells, isFilled, getCellByNumber, getOppositeDirection, getParent, isInBounds, isWhite, isStartOfClue } from '../gameUtils';

/*
 * Summary of Player component
 *
 * Props: { grid, clues }
 *
 * State: { selected, direction }
 *
 * Children: [ GridControls, Grid, Clues ]
 * - GridControls.props:
 *   - attributes: { selected, direction, grid, clues }
 *   - callbacks: { setSelected, setDirection }
 * - Grid.props:
 *   - attributes: { grid, selected, direction }
 *   - callbacks: { setSelected, changeDirection }
 * - Clues.props:
 *   - attributes: { getClueList() }
 *   - callbacks: { selectClue }
 *
 * Potential parents (so far):
 * - Room
 * - SoloRoom
 **/

export default class Player extends Component {
  constructor() {
    super();
    this.state = {
      selected: {
        r: 0,
        c: 0
      },
      direction: 'across',
    };
  }

  componentWillReceiveProps(props) {
    let { r, c } = this.state.selected;
    if (!isWhite(props.grid, r, c)) {
      while (!isWhite(props.grid, r, c)) {
        if (c < props.grid[0].length) {
          c += 1;
        } else {
          r += 1;
          c = 0;
        }
      }
      this.setSelected({r, c});
    }
  }

  /* Callback fns, to be passed to child components */

  setDirection(direction) {
    this.setState({
      direction: direction
    });
  }

  setSelected(selected) {
    this.setState({
      selected: selected
    });
  }

  changeDirection() {
    this.setDirection(getOppositeDirection(this.state.direction));
  }

  selectClue(direction, number) {
    this.refs.gridControls.selectClue(direction, number);
  }

  /* Helper functions used when rendering */

  getClueBarAbbreviation() {
    return this.getSelectedClueNumber() + this.state.direction.substr(0, 1).toUpperCase();
  }

  getClueBarText() {
    return this.props.clues[this.state.direction][this.getSelectedClueNumber()];
  }

  getSelectedClueNumber() {
    return getParent(this.props.grid, this.state.selected.r, this.state.selected.c, this.state.direction);
  }

  getHalfSelectedClueNumber() {
    return getParent(this.props.grid, this.state.selected.r, this.state.selected.c, getOppositeDirection(this.state.direction));
  }

  isClueFilled(direction, number) {
    const clueRoot = getCellByNumber(this.props.grid, number);
    return !hasEmptyCells(this.props.grid, clueRoot.r, clueRoot.c, direction);
  }

  isClueSelected(direction, number) {
    return direction === this.state.direction && number === this.getSelectedClueNumber();
  }

  isClueHalfSelected(direction, number) {
    return direction !== this.state.direction && number === this.getHalfSelectedClueNumber();
  }

  isHighlighted(r, c) {
    return this.refs.grid.isHighlighted(r, c);
  }

  isSelected(r, c) {
    return this.refs.grid.isSelected(r, c);
  }

  /* Public functions, called by parent components */

  getAllSquares() {
    let result = [];
    this.props.grid.forEach((row, r) => {
      result = result.concat(row.map((cell, c) => ({
        r: r,
        c: c
      })));
    });
    return result;
  }

  getSelectedAndHighlightedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.isSelected(r, c) || this.isHighlighted(r, c));
  }

  getSelectedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.isSelected(r, c));
  }

  /* Misc functions */

  // Interacts directly with the DOM
  // Very slow -- use with care
  scrollToClue(dir, num, el) {
    if (el) {
      if (this.clueScroll === el.offsetTop) return;
      const parent = el.offsetParent;
      parent.scrollTop = el.offsetTop - (parent.offsetHeight * .4);
      this.clueScroll = el.offsetTop;
    }
  }


  /* Render */

  render() {
    return (
      <div className='player--main--wrapper'>
        <GridControls
          ref='gridControls'
          selected={this.state.selected}
          direction={this.state.direction}
          onSetDirection={this.setDirection.bind(this)}
          onSetSelected={this.setSelected.bind(this)}
          updateGrid={this.props.updateGrid}
          grid={this.props.grid}
          clues={this.props.clues}
        >
          <div className='player--main--cover'>
            out of focus
          </div>
          <div className='player--main'>
            <div className='player--main--left'>
              <div className='player--main--clue-bar'>
                <div className='player--main--clue-bar--number'>
                  { this.getClueBarAbbreviation() }
                </div>
                <div className='player--main--clue-bar--text'>
                  { this.getClueBarText() }
                </div>
              </div>

              <div
                className={'player--main--left--grid' + (this.props.frozen ? ' frozen' : '')}
              >
                <Grid
                  ref='grid'
                  size={this.props.size}
                  grid={this.props.grid}
                  selected={this.state.selected}
                  direction={this.state.direction}
                  onSetSelected={this.setSelected.bind(this)}
                  onChangeDirection={this.changeDirection.bind(this)}/>
              </div>
            </div>

            <div className='player--main--clues'>
              {
                // Clues component
                ['across', 'down'].map((dir, i) => (
                  <div key={i} className='player--main--clues--list'>
                    <div className='player--main--clues--list--title'>
                      {dir.toUpperCase()}
                    </div>

                    <div
                      className={'player--main--clues--list--scroll ' + dir}
                      ref={'clues--list--'+dir}>
                      {
                        this.props.clues[dir].map((clue, i) => clue && (
                          <div key={i}
                            className={
                              (this.isClueSelected(dir, i) ?
                                'selected '
                                : ' ')
                                + (this.isClueHalfSelected(dir, i) ?
                                  'half-selected '
                                  : ' ')
                                + (this.isClueFilled(dir, i)
                                  ? 'complete '
                                  : ' ')
                                + 'player--main--clues--list--scroll--clue'}
                                ref={
                                  (this.isClueSelected(dir, i))
                                    ? this.scrollToClue.bind(this, dir, i)
                                    : null}
                                    onClick={this.selectClue.bind(this, dir, i)}>
                                    <div className='player--main--clues--list--scroll--clue--number'>
                                      {i}
                                    </div>
                                    <div className='player--main--clues--list--scroll--clue--text'>
                                      {clue}
                                    </div>
                                  </div>
                        ))
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </GridControls>
      </div>
    );
  }
}
