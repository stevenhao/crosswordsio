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
      direction: 'across'
    };
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
    const edits = this.props.grid[r][c].edits;
    this.props.updateGrid(r, c, isRebus ? (((edits && edits.value) || '') + letter) : letter);
    if (!isRebus) {
      this.goToNextEmptyCell();
    }
  }

  backspace(shouldStay) {
    let { r, c } = this.state.selected;
    if (this.props.grid[r][c].edits && this.props.grid[r][c].edits.value !== '') {
      console.log('if', this.props.grid[r][c]);
      this.props.updateGrid(r, c, '');
    } else {
      console.log('else');
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
      return this.isGridFilled() || this.props.clues[direction][clueNumber] && !this.isWordFilled(direction, clueNumber);
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
      el.scrollTop = el.scrolLHeight;
    }
  }

  render() {
    return (
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
            className='game--main--left--grid'
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
              setDirection={this.setDirection.bind(this)}
              setSelected={this.setSelected.bind(this)}
              typeLetter={this.typeLetter.bind(this)}
              backspace={this.backspace.bind(this)}
              selectNextClue={this.selectNextClue.bind(this)}
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
                  ref={this.scrollToClue.bind(this, dir)}
                  className={'game--main--clues--list--scroll ' + dir}>
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
    );
  }
}
