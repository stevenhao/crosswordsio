import React, { Component } from 'react';

export default class Clock extends Component {
  constructor() {
    super();
    this.state = {
      clock: '00:00'
    };
  }

  componentDidMount() {
    if (this.intvl) clearInterval(this.intvl);
    this.intvl = setInterval(this.updateClock.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intvl);
  }

  updateClock() {
    function pad2(num) {
      let s = '' + 100 + num;
      s = s.substr(s.length - 2);
      return s;
    }
    const stopTime = this.props.stopTime;
    const now = stopTime || new Date().getTime();
    const start = this.props.startTime;
    const duration = now - start;
    let secs = Math.floor(duration / 1000);
    let mins = Math.floor(secs / 60);
    secs = secs % 60;
    let hrs = Math.floor(mins / 60);
    mins = mins % 60;
    const str = start ? (hrs ? (hrs + ':'):'') + pad2(mins) + ':' + pad2(secs) : '00:00';
    this.setState({
      clock: str
    });
  }

  render() {
    return <div className='clock'>
      {this.state.clock}
    </div>
  }
};
