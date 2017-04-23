import Grid from './grid';
import React, { Component } from 'react';

import { isGridFilled, getNextCell, getNextEmptyCell, getNextEmptyCellAfter, hasEmptyCells, isFilled, getCellByNumber, getOppositeDirection, getParent, isInBounds, isWhite, isStartOfClue } from '../gameUtils';

export default class Game extends Component {
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

  goToNextEmptyCell() {
    let { r, c } = this.state.selected;
    const nextEmptyCell = getNextEmptyCellAfter(this.props.grid, r, c, this.state.direction);
    if (nextEmptyCell) {
      this.setSelected(nextEmptyCell);
    } else {
      const nextCell = getNextCell(this.props.grid, r, c, this.state.direction);
      if (nextCell) {
        this.setSelected(nextCell);
        return nextCell;
      }
    }
  }

  goToPreviousCell() {
    let { r, c } = this.state.selected;
    const grid = this.props.grid;
    const step = () => {
      if (this.state.direction === 'across') {
        if (c > 0) {
          c--;
        } else {
          c = grid[0].length - 1;
          r--;
        }
      } else {
        if (r > 0) {
          r--;
        } else {
          r = grid.length - 1;
          c--;
        }
      }
    };
    const ok = () => {
      return isInBounds(grid, r, c) && isWhite(grid, r, c);
    };
    step();
    while (isInBounds(grid, r, c) && !ok()) {
      step();
    }
    if (ok()) {
      this.setSelected({ r, c });
      return { r, c };
    }
  }

  typeLetter(letter, isRebus) {
    const { r, c } = this.state.selected;
    const value = this.props.grid[r][c].value;
    this.props.updateGrid(r, c, isRebus ? ((value || '') + letter) : letter);
    if (!isRebus) {
      this.goToNextEmptyCell();
    }
  }

  backspace(shouldStay) {
    let { r, c } = this.state.selected;
    if (this.props.grid[r][c].value !== '') {
      this.props.updateGrid(r, c, '');
    } else {
      if (!shouldStay) {
        const cell = this.goToPreviousCell();
        if (cell) {
          this.props.updateGrid(cell.r, cell.c, '');
        }
      }
    }
  }

  changeDirection() {
    this.setDirection(getOppositeDirection(this.state.direction));
  }

  getSelectedClueNumber() {
    return getParent(this.props.grid, this.state.selected.r, this.state.selected.c, this.state.direction);
  }

  getHalfSelectedClueNumber() {
    return getParent(this.props.grid, this.state.selected.r, this.state.selected.c, getOppositeDirection(this.state.direction));
  }

  selectClue(direction, number) {
    this.setDirection(direction);
    const clueRoot = getCellByNumber(this.props.grid, number);
    const firstEmptyCell = getNextEmptyCell(this.props.grid, clueRoot.r, clueRoot.c, direction);
    this.setSelected(firstEmptyCell || clueRoot);
  }

  isWordFilled(direction, number) {
    const clueRoot = getCellByNumber(this.props.grid, number);
    return !hasEmptyCells(this.props.grid, clueRoot.r, clueRoot.c, direction);
  }

  isWordSelected(direction, number) {
    return direction === this.state.direction && number === this.getSelectedClueNumber();
  }

  isWordHalfSelected(direction, number) {
    return direction !== this.state.direction && number === this.getHalfSelectedClueNumber();
  }


  isGridFilled() {
    return isGridFilled(this.props.grid);
  }

  selectNextClue(backwards) {
    let clueNumber = this.getSelectedClueNumber();
    let direction = this.state.direction;
    const add = backwards ? -1 : 1;
    const start = () => backwards ? (this.props.clues[direction].length - 1) : 1;
    const step = () => {
      if (clueNumber + add < this.props.clues[direction].length && clueNumber + add >= 0) {
        clueNumber += add;
      } else {
        direction = getOppositeDirection(direction);
        clueNumber = start();
      }
    };
    const ok = () => {
      return this.props.clues[direction][clueNumber] && (this.isGridFilled() || !this.isWordFilled(direction, clueNumber));
    };
    step();
    while (!ok()) {
      step();
    }
    this.selectClue(direction, clueNumber);
  }


  getClueBarAbbreviation() {
    return this.getSelectedClueNumber() + this.state.direction.substr(0, 1).toUpperCase();
  }

  getClueBarText() {
    return this.props.clues[this.state.direction][this.getSelectedClueNumber()];
  }

  scrollToClue(dir, num, el) {
    if (el) {
      const parent = el.offsetParent;
      parent.scrollTop = el.offsetTop - (parent.offsetHeight * .4);
    }
  }

  handleKeyDown(ev) {
    const moveSelectedBy = (dr, dc) => () => {
      const { grid } = this.props;
      const { selected, direction } = this.state;
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
        this.setSelected({ r, c });
      }
    };

    const setDirection = (direction, cbk) => () => {
      if (this.state.direction !== direction) {
        this.setDirection(direction);
      } else {
        cbk();
      }
    }

    const movement = {
      'ArrowLeft': setDirection('across', moveSelectedBy(0, -1)),
      'ArrowUp': setDirection('down', moveSelectedBy(-1, 0)),
      'ArrowDown': setDirection('down', moveSelectedBy(1, 0)),
      'ArrowRight': setDirection('across', moveSelectedBy(0, 1)),
      'Backspace': this.backspace.bind(this),
      'Tab': this.selectNextClue.bind(this),
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
        if (!this.props.frozen) {
          this.typeLetter(letter, ev.shiftKey);
        }
      }
    }
  }

  render() {
    return (
      <div className='game--main--wrapper'
        tabIndex='1'
        onKeyDown={this.handleKeyDown.bind(this)} >
        <div className='game--main--cover'>
          out of focus
        </div>
        <div className='game--main'>
          <div className='game--main--left'>
            <div className='game--main--clue-bar'>
              <div className='game--main--clue-bar--number'>
                { this.getClueBarAbbreviation() }
              </div>
              <div className='game--main--clue-bar--text'>
                { this.getClueBarText() }
              </div>
            </div>

            <div
              className={'game--main--left--grid' + (this.props.frozen ? ' frozen' : '')}
              style={{
                width: this.props.grid.length * this.props.size,
                height: this.props.grid[0].length * this.props.size
              }}
            >
              <Grid
                size={this.props.size}
                grid={this.props.grid}
                selected={this.state.selected}
                direction={this.state.direction}
                setSelected={this.setSelected.bind(this)}
                changeDirection={this.changeDirection.bind(this)}
              >
              </Grid>
            </div>
          </div>

          <div className='game--main--clues'>
            {
              ['across', 'down'].map((dir, i) => (
                <div key={i} className='game--main--clues--list'>
                  <div className='game--main--clues--list--title'>
                    {dir.toUpperCase()}
                  </div>

                  <div
                    className={'game--main--clues--list--scroll ' + dir}
                    ref={'clues--list--'+dir}>
                    {
                      this.props.clues[dir].map((clue, i) => clue && (
                        <div key={i}
                          className= {
                            (this.isWordSelected(dir, i) ?
                              'selected '
                              : ' ')
                              + (this.isWordHalfSelected(dir, i) ?
                                'half-selected '
                                : ' ')
                              + (this.isWordFilled(dir, i)
                                ? 'complete '
                                : ' ')
                              + 'game--main--clues--list--scroll--clue'}
                              ref={
                                (this.isWordSelected(dir, i) || this.isWordHalfSelected(dir, i))
                                  ? this.scrollToClue.bind(this, dir, i)
                                  : null}
                                  onClick={this.selectClue.bind(this, dir, i)}>
                                  <div className='game--main--clues--list--scroll--clue--number'>
                                    {i}
                                  </div>
                                  <div className='game--main--clues--list--scroll--clue--text'>
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
      </div>
    );
  }
}
