import './compose.css';
import actions, { db } from '../actions';
import React, { Component } from 'react';
import Editor from '../components/editor';

export default class Compose extends Component {
  constructor() {
    super();
    this.state = {
      pid: undefined
    };
  }

  listPuzzles() {
    return [
      {
        pid: 5,
        info: {
          title: 'abc',
          autho: 'steve'
        },
        dims: {
          rows: 5,
          cols: 5
        }
      }
    ];
  }

  selectPuzzle(pid) {
    this.setState({pid: pid});
  }

  render() {
    return (
      <div className='compose'>
        <div className='compose--left'>
          <h2> Your Puzzles </h2>
          <div className='compose--left--list'>
            {
              this.listPuzzles().slice().map((entry, i) =>
                <div
                  key={i}
                  onClick={this.selectPuzzle.bind(this, entry.pid)}
                >
                  <div className='welcome--browse--puzzlelist--entry'>
                    <div>
                      { entry.info.title } ({ entry.dims.rows } x { entry.dims.cols })
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
        <div className='compose--main'>
          <h2> Main content </h2>
          <div className='compose--main--info'>
            <div className='compose--main--info--pid'>
            </div>
            <div className='compose--main--info--title'>
            </div>
            <div className='compose--main--info--title'>
            </div>
          </div>
          <Editor
            pid={this.state.pid}
          />
        </div>
        <div className='compose--right'>
          <h2> Right sidebar </h2>
        </div>

      </div>
    );
  }
};
