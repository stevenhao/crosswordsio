import './quickplay.styl';
import moment from 'moment';

import _ from 'lodash';
import actions from '../actions';
import React, { Component } from 'react';

export default class Quickplay extends Component {
  constructor() {
    super();
    this.state = {
      puzzles: null,
      loadingPuzzles: true
    };
    this.cache = {};
    this.puzzles = {};
  }

  getMonthData(month, cbk) {
    if (!this.cache[month]) {
      this.cache[month] = {
        loading: true
      };

      const date_start = moment(month);
      const date_end = moment(month).endOf('month');

      actions.listPuzzles(
        date_start.format('YYYY-MM-DD'),
        date_end.format('YYYY-MM-DD'),
        puzzles => {
          this.cache[month].data = puzzles;
          cbk(this.cache[month]);
        }
      );
    }

    if (this.cache[month]) {
      cbk(this.cache[month]);
    }
  }

  setMonth(month) {
    console.log('setMonth', month);
    this.setState({ month: month });
    this.getMonthData(month, ({loading, data}) => {
      if (loading) {
        this.setState({
          loading: true
        });
      } else {
        puzzles.forEach(({ print_date, solved, star, author }) => {
          date = moment(print_date).format('YYYY-MM-DD');
          this.puzzles[date] = {
            solved: solved,
            star: star,
            author: author
          };
        });

        this.setState({
          loading: false
        });
      }
    });
  }

  componentDidMount() {
    const month = moment().startOf('month').format('YYYY-MM');
    this.setMonth(month);
  }

  renderPuzzleItem(date) {
    const day = date.format('D');
    const puzzle = this.puzzles[date.toString()];
    if (puzzle) {
      return (
        <div className='puzzle-item'>
          <div className={
            'puzzle-item--icon'
              + ( puzzle.solved
                ? ' solved'
                : '' )
              + ( puzzle.star
                ? ' star'
                : '' )
          }>
        </div>
        <div className='puzzle-item--info'>
          {day}
        </div>
      </div>
      );
    } else {
      return (
        <div className='puzzle-item unavailable'>
          Unavailable Puzzle
          <div className='puzzle-item--icon'>
          </div>
          <div className='puzzle-item--info'>
            {day}
          </div>
        </div>
      );
    }
  }

  renderCalendar(month) {
    if (!month) return null;
    console.log(month);
    month = moment(month);
    console.log('renderCalendar', month, month.format('MMMM YYYY'));
    const dates = _.range(month.daysInMonth()).map(n => moment(month).add(n, 'days'));
    console.log(dates);
    const weeks = _.groupBy(dates, day => moment(day).startOf('week'));
    return (
      <div className='calendar'>
        <div className='calendar--title'>
          {month.format('MMMM YYYY')}
        </div>
        <div className='calendar--main'>
          {Object.keys(weeks).map(week => (
            <div className='calendar--week'>
              {weeks[week].map(date => (
                <div className='calendar--day'>
                  {this.renderPuzzleItem(date)}
                </div>
              )) }
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='quickplay'>
        <div className='quickplay--quick'>
          <div className='quickplay--quick--title'>
            Play latest unsolved
          </div>
          <div className='quickplay--quick--main'>
            <div className='quickplay--quick--day'> Monday </div>
            <div className='quickplay--quick--day'> Tuesday </div>
            <div className='quickplay--quick--day'> Wednesday </div>
          </div>
        </div>
        <div className='quickplay--calendar'>
          {this.renderCalendar(this.state.month)}

        </div>
      </div>
    );
  }
};