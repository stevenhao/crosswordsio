import './puzzles.styl';

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import Modal from 'react-modal';

import actions, { db } from '../actions';
import { valuesOf, toArr } from '../jsUtils';
import Upload from '../components/upload'
import PuzzleItem from '../components/puzzleItem'
import Dropdown from '../components/dropdown';
import Quickplay from '../components/quickplay';
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
      const dims = info.dims || {width: 5, height: 5};
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
        },
        id: puzzle.id,
      };
    });
  }

  updatePuzzle(pid, update) {
    //db.transaction(, puzzle => (
    //Object.assign(puzzle, update)
    //));
  }

  render() {
    return (
      <div className='puzzles'>
        <Modal
          isOpen={this.state.showingModal}
          onAfterOpen={() => {}}
          onRequestClose={() => {this.setState({showingModal: false});}}
          closeTimeoutMS={100}
          style={{
          }}
          contentLabel="Modal"
        >
          <Quickplay/>
        </Modal>
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
            <button onClick={() => this.setState({showingModal: true})}>
              Quick Play
            </button>
          </div>
          <div className='puzzles--toolbar--sort-by'>
            <Dropdown
              options={[
                'Newest Added',
                'Lowest Difficulty',
                'Highest Rated'
              ]}/>
          </div>
          <div className='puzzles--toolbar--search'>
            <span className="fa fa-search"></span>
            <input placeholder='Search'>
            </input>
          </div>
        </div>
        <div className='puzzles--main'>
          <div className='puzzles--main--left'>
            <div className='puzzles--main--left--list'>
              {
                // filters
              }
              <div className='puzzles--main--left--header'>Source</div>
              {['NY Times', 'Custom']
                  .map(source => (
                    <div className='puzzles--main--left--option'>
                      <input type="checkbox"/>
                      <label>{source}</label>
                    </div>
                  ))
              }
              <div className='puzzles--main--left--header'>Size</div>
              {['Mini', 'Midi', 'Daily']
                  .map(size => (
                    <div className='puzzles--main--left--option'>
                      <input type="checkbox"/>
                      <label>{size}</label>
                    </div>
                  ))
              }
              <div className='puzzles--main--left--header'>Difficulty</div>
              {['Easy', 'Medium', 'Difficult']
                  .map(difficulty => (
                    <div className='puzzles--main--left--option'>
                      <input type="checkbox"/>
                      <label>{difficulty}</label>
                    </div>
                  ))
              }
              <div className='puzzles--main--left--header'>Rating</div>

              <div className='puzzles--main--left--slider'>
                <input type="range" value={0}/>
                <label>
                  1+
                </label>
              </div>

              <div className='puzzles--main--left--header'>Solved?</div>
              {['Unsolved', 'Solved']
                  .map(solved => (
                    <div className='puzzles--main--left--option'>
                      <input type="checkbox"/>
                      <label>{solved}</label>
                    </div>
                  ))
              }
            </div>
              </div>
            <div className='puzzles--main--right'>
              <div className='puzzles--main--right--puzzles'>
                { this.puzzleList.map((puzzle, i) => (
                  <div
                    key={i}
                    className='puzzles--main--right--puzzles--puzzle'>
                    <PuzzleItem
                      title={puzzle.info.title}
                      author={puzzle.info.author}
                      date={'Sun 5/28/2017'}
                      dims={puzzle.info.dims}
                      myRating={puzzle.ratings.me}
                      avgRating={puzzle.ratings.avg}
                      onUpdate={update => this.onUpdate(i, update)}
                    />
                  </div>
                )) }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

