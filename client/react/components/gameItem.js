import './gameItem.css';

import React, { Component } from 'react';

class Rating extends Component {
  constructor() {
    super();
    this.state = {
      hovering: false
    };
  }

  onHover() {
    this.setState({ hovering: true });
  }

  onBlur() {
    this.setState({ hovering: false });
  }

  render() {
    let five = [0, 1, 2, 3, 4];
    let rating = this.state.hovering
      ? this.props.myRating
      : this.props.avgerageRating;
    return (
      <div className='rating'>
        <div className='rating--label'>
          { this.state.hovering
              ? 'Average Rating'
              : 'Your Rating'
          }
        </div>
        <div
          className='rating--stars'
          onHover={() => this.onHover()}
          onBlur={() => this.onBlur()} >
          { five.map({i} => (
            <div key=i className=
              { 'star' + (
                rating >= i + 1
                ? ' filled'
                : ( rating >= i + 0.5
                  ?  ' half-filled'
                  : ''))
              }
              onClick={() => this.update({
                stars: !this.props.favorited
              })} />
          )) }
        </div>
      </div>
    );
  }
}

export default class GameItem extends Component {

  renderStars() {
  }

  update(state) {
    this.props.onUpdate(state);
  }

  render() {
    return (
      <div className='game-item'>
        <div className='game-item--top'>
          <div className='game-item--top--info'>
            {this.props.dims.height} x {this.props.dims.width}
            |
            {this.props.author}
            |
            {this.props.date}
          </div>
          <div className='game-item--top--favorite'>
            <div className={'game-item--top--heart ' + (
              this.props.favorited
              ? ' filled'
              : '')
            }
            onClick={() => this.update({
              favorited: !this.props.favorited
            })}
          />
        </div>
      </div>
      <div className='game-item--main'>
        <div className='game-item--main--title'>
          <Link to={`/puzzle/${this.props.pid}`}>
            { this.props.title }
          </Link>
        </div>
        <div className='game-item--main--rating'>
          { this.renderStars() }
        </div>
      </div>
    </div>
    );
  }
}
