import './puzzles.css';

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import actions, { db } from '../actions';
import { valuesOf, toArr } from '../jsUtils';
import Upload from '../components/upload'
import PuzzleItem from '../components/puzzleItem'
import me from '../localAuth';

export default class Puzzles extends Component {
  constructor() {
    super();
    this.state = {
      puzzleList: [],
      selected: null, // an element of state.puzzleList
      // todo: filters, sortby
    };
  }

  componentDidMount() {
    this.puzzleListRef = db.ref('puzzlelist');
    this.puzzleListRef.on('value', v => {
      this.setState({
        puzzleList: toArr(v.val())
      })
    });
    this.setState({
      puzzleList: [
        {
          info: {
            type: 'Mini Puzzle',
            author: 'steve',
            title: 'monday'
          },
          pid: 1,
          private: false,
        },
      ]
    });
  }

  componentWillUnmount() {
  }

  select(selected) {
    this.setState({
      selected: selected
    });
  }

  get puzzleList() {
    return this.state.puzzleList.filter(puzzle => (
      !puzzle.private
    )).map(puzzle => {
      const info = puzzle.info || {};
      const dims = info.dims || {};
      const ratings = puzzle.ratings || {};
      //const ratingValues = valuesOf(ratings);
      const ratingValues = [];
      return {
        ratings: {
          me: ratings[me()] || 0,
          avg: 0,
          count: valuesOf(ratings)
        },
        info: {
          title: info.title,
          author: info.author,
          createdAt: info.createdAt,
          dims: {
            width: dims.width,
            height: dims.height
          },
        }
      };
    });
  }

  render() {
    return (
      <div className='puzzles'>
        <div className='puzzles--nav'>
          <div className='puzzles--nav--left'>
            <div className='puzzles--nav--title'>
              <Link to='/puzzles'>
                DownForACross
              </Link>
            </div>
            <div className='puzzles--nav--play'>
              <Link to='/puzzles'>
                Play
              </Link>
            </div>
            <div className='puzzles--nav--compose'>
              <Link to='/compose'>
                Compose
              </Link>
            </div>
          </div>

          <div className='puzzles--nav--right'>
            <Link to='/puzzles'>
              Log in/Sign up
            </Link>
          </div>
        </div>
        <div className='puzzles--toolbar'>
          <div className='puzzles--toolbar--quick-play'>
            <button>
              Quick Play
            </button>
          </div>
          <div className='puzzles--toolbar--sort-by'>
            <select>
              <option>Newest Added</option>
            </select>
          </div>
          <div className='puzzles--toolbar--search'>
            <input placeholder='Search'>
            </input>
          </div>
        </div>
        <div className='puzzles--main'>
          <div className='puzzles--main--left'>
            {
              // filters
            }
            <b>Source</b>
            <b>Size</b>
            <b>Difficulty</b>
            <b>Rating</b>
            <b>Solved?</b>
          </div>
          <div className='puzzles--main--right'>
            <div className='puzzles--main--right--puzzles'>
              { this.puzzleList.map(puzzle => (
                <PuzzleItem
                  dims={puzzle.info.dims}
                  myRating={puzzle.ratings.me}
                  avgRating={puzzle.ratings.avg}
                />
              )) }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

