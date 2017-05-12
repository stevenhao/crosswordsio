import './cell.css';

import React, { Component } from 'react';

/*
 * Summary of Cell component
 *
 * Props: { black, selected, highlighted, bad, good, helped,
 *          value, onClick }
 *  - edits is not currently used, except for backwards compat.
 *
 * State: {}
 *
 * Children: []
 *
 * Potential parents:
 * - Grid
 **/

export default class Cell extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    if(['black', 'selected', 'highlighted', 'bad', 'good', 'helped', 'value', 'number'].some(attr => this.props[attr] !== nextProps[attr])) {
      return true;
    }
    return false;
  }

  renderFlipButton() {
    if (this.props.canFlipColor) {
      return (
        <i
          className='cell--flip fa fa-small fa-sticky-note'
          onClick={(e) => {
            e.stopPropagation();
            this.props.onFlipColor();
          }}
        />
      );
    }
    return null;
  }

  render() {
    if (this.props.black) {
      return (
        <div className='cell black'>
          { this.renderFlipButton() }
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
        className={
          (this.props.selected
            ? 'selected '
            : ''
          ) + (this.props.highlighted
            ? 'highlighted '
            : ''
          ) + (this.props.bad
            ? 'bad '
            : ''
          ) + (this.props.good
            ? 'good '
            : ''
          ) + (this.props.helped
            ? 'helped '
            : ''
          ) + 'cell'
        }
        onClick={this.props.onClick}>
        <div className='cell--number'>
          { this.props.number }
        </div>
        { this.renderFlipButton() }
        <div className='cell--value'
          style={{
            fontSize: 350 / Math.sqrt(l) + '%',
            lineHeight: Math.sqrt(l) * 100 + '%'
          }}
        >
          { val }
        </div>
      </div>
    );
  }
}
