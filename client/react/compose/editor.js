import actions, { db } from '../actions';
import React, { Component } from 'react';

export default class Editor extends Component {
  constructor() {
    super();
    this.state = {
      puzzle: undefined
    };
    this.puzzleRef = undefined;
  }

  setPuzzleRef(ref) {
    if (this.puzzleRef) {
      this.puzzleRef.off();
    }
    this.puzzleRef = ref;
    this.puzzleRef.on('value', puzzle => {
      this.setState({puzzle: puzzle.val()});
    });
  }

  componentWillReceiveProps(props) {
    if (!this.props || props.pid !== this.props.pid) {
      this.setState(puzzleRef, db.ref(`/puzzle/${props.pid}`));
    }
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
    const size = 35 * 15 / this.state.size;
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
