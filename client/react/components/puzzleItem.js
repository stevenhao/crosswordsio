import './puzzleItem.css';
import { Link } from 'react-router-dom'

import React, { Component } from 'react';

class Rating extends Component {
  constructor() {
    super();
    this.state = {
      hovering: false,
      showMyRating: false
    };
  }

  onHover(i) {
    this.setState({
      hovering: true,
      hoverTarget: i + 1
    });
  }

  onBlur() {
    this.setState({ hovering: false });
  }

  onClick() {
    this.setState({ showMyRating: !this.state.showMyRating });
  }

  update() {
    this.props.onUpdate && this.props.onUpdate(this.state.hoverTarget);
  }

  render() {
    let five = [0, 1, 2, 3, 4];
    let rating = this.state.hovering
      ? this.state.hoverTarget
      : (this.state.showMyRating
        ? this.props.myRating
        : this.props.averageRating
      );
    return (
      <div className='rating'>
        <div
          className='rating--label'
          onClick={() => this.onClick()} >
        </div>
        <div
          className='rating--stars'
          onMouseEnter={() => this.onHover()}
          onMouseLeave={() => this.onBlur()}
          onBlur={() => this.onBlur()} >
          { five.map(i => (
            <div
              key={i}
              className=
              { 'fa ' + (rating >= i + 1
                  ? 'star'
                  : ((rating >= i + .5)
                    ? 'star-half-o'
                    : 'star-o'
                  )
              )}

              onMouseEnter={() => this.onHover(i)}
              onClick={() => this.update({
                stars: !this.props.favorited
              })} />
          )) }
        </div>
      </div>
    );
  }
}

export default class PuzzleItem extends Component {

  update(state) {
    this.props.onUpdate(state);
  }

  render() {
    return (
      <div className='puzzle-item'>
        <Link to={`/puzzle/${this.props.pid}`}>
          <div className='puzzle-item--top'>
            <div className='puzzle-item--top--info'>
              {this.props.dims.height} x {this.props.dims.width}
              {' | '}
              {this.props.author}
              {' | '}
              {this.props.date}
            </div>
            <div className='puzzle-item--top--favorite'>
              <span
                className={ this.props.favorited
                    ? 'fa fa-heart'
                    : 'fa fa-heart-o'
                }
                onClick={() => this.update({
                  favorited: !this.props.favorited
                })}>
              </span>
            </div>
          </div>
          <div className='puzzle-item--main'>
            <div className='puzzle-item--main--title'>
              { this.props.title }
            </div>
            <div className='puzzle-item--main--rating'>
              <Rating
                myRating={this.props.myRating}
                averageRating={this.props.averageRating}
                onUpdate={rating => this.onUpdate({myRating: rating})}
              />
            </div>
          </div>
        </Link>
      </div>
    );
  }
}
