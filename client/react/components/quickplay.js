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
      loading: true
    };
    this.cache = {};
    this.puzzles = {};
  }

  getMonthData(month, cbk) {
    if (!this.cache[month]) {
      console.log('getMonthData', month);
      this.cache[month] = {
        loading: true
      };

      const date_start = moment(month).startOf('month');
      const date_end = moment(month).endOf('month');

      actions.listPuzzles(
        date_start.format('YYYY-MM-DD'),
        date_end.format('YYYY-MM-DD'),
        puzzles => {
          this.cache[month].data = puzzles;
          this.cache[month].loading = false;
          cbk(this.cache[month]);
        }
      );
    } else {
      if (this.cache[month]) {
        cbk(this.cache[month]);
      }
    }
  }

  loadMonth(month) {
    if (typeof month !== 'string') {
      if (month.format) {
        month = month.format('YYYY-MM');
      } else {
        console.error('invalid month', month);
        return;
      }
    }

    this.getMonthData(month, ({loading, data}) => {
      if (loading) {
      } else {
        let changed = false;
        data.forEach(({ print_date, solved, star, author }) => {
          const date = moment(print_date).format('YYYY-MM-DD');
          if (!this.puzzles[date]) changed = true;
          this.puzzles[date] = {
            solved: solved,
            star: star,
            author: author
          };
        });
        if (changed) {
          this.forceUpdate();
        }
      }
    });
  }

  setMonth(month) {
    if (typeof month !== 'string') {
      if (month.format) {
        month = month.format('YYYY-MM');
      } else {
        console.error('invalid month', month);
      }
    }
    this.setState({ month: month });
    this.loadMonth(month);
  }

  componentDidMount() {
    const month = moment().startOf('month');
    this.setMonth(month);
  }

  renderPuzzleSquare(date, options = {}) {
    const day = date.format('D');
    const puzzle = this.puzzles[date.format('YYYY-MM-DD')];
    if (puzzle) {
      return (
        <a className='puzzle-square' href={`/puzzle/nyt/${date.format('YYYYMMDD')}`}>
          <div className={
            'puzzle-square--icon'
              + ( puzzle.solved
                ? ' solved'
                : '' )
              + ( puzzle.star
                ? ' star'
                : '' )
          }>
        </div>
        {options.date
            ? (
              <div className='puzzle-square--info long'>
                <div className='puzzle-square--info--day'>
                  { date.format('dddd') }
                </div>
                <div className='puzzle-square--info--date'>
                  { date.format('MMMM DD YYYY') }
                </div>
              </div>
            )
            : (
              <div className='puzzle-square--info'>
                {day}
              </div>
            )
        }
      </a>
      );
    } else {
      return (
        <div className='puzzle-square unavailable'>
          <div className='puzzle-square--icon'>
          </div>
          <div className='puzzle-square--info'>
            {day}
          </div>
        </div>
      );
    }
  }

  renderCalendarControls(currentMonth) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const latestYear = moment().year();
    const years = _.range(latestYear, 1993 - 1, -1);
    const currentMonthNumber = currentMonth.month();
    const currentYearNumber = currentMonth.year();
    return (
      <div className='controls'>
        <button
          className='controls--month-back'
          onClick={() => this.setMonth(moment(currentMonth).subtract(1, 'months'))}
          disabled={
            moment(currentMonth).subtract(1, 'months') < moment('1993-11-01')
          }
        >
          {'<'}
        </button>
        <div className='controls--selects'>
          <select
            className='controls--month-select'
            value={currentMonthNumber}
            onChange={ev => {
              const month = moment(currentMonth).month(ev.target.value);
              this.setMonth(month);
            }}
          >
            {months.map((month, i) => (
              <option
                key={i} value={i}
                disabled={
                  moment(currentMonth).month(i) > moment()
                } >
                {month}
              </option>
            ))}
          </select>
          <select
            className='controls--year-select'
            value={currentYearNumber}
            onChange={ev => {
              const month = moment(currentMonth).year(ev.target.value);
              this.setMonth(month);
            }}
          >
            {years.map((year, i) => (
              <option key={i} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className='controls--right'>
          <button
            className='controls--today'
            onClick={() => this.setMonth(moment().startOf('month'))}
            disabled={
              moment(currentMonth).add(1, 'months') > moment()
            }
          >
            Today
          </button>
          <button
            className='controls--month-forward'
            onClick={() => this.setMonth(moment(currentMonth).add(1, 'months'))}
            disabled={
              moment(currentMonth).add(1, 'months') > moment()
            }
          >
            {'>'}
          </button>
        </div>
      </div>
    );
  }

  renderCalendar(month) {
    if (!month) return null;
    month = moment(month);
    console.log('renderCalendar', month, month.format('MMMM YYYY'));
    const dates = _.range(month.daysInMonth()).map(n => moment(month).add(n, 'days'));
    const weeks = _.groupBy(dates, day => moment(day).startOf('week'));
    return (
      <div className='calendar'>
        <div className='calendar--controls'>
          {this.renderCalendarControls(month)}
        </div>
        <div className='calendar--title'>
          {month.format('MMMM YYYY')}
        </div>
        <div className='calendar--subtitle'>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((text, i) => (
            <div key={i} className='calendar--subtitle--item'>
              {text}
            </div>

          ))}
        </div>
        <div className='calendar--main'>
          {Object.keys(weeks).map((week, i) => (
            <div key={i} className='calendar--week'>
              {weeks[week].map((date, i) => (
                <div key={i} className='calendar--day'>
                  {this.renderPuzzleSquare(date)}
                </div>
              )) }
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderQuick() {
    this.loadMonth(moment().subtract(1, 'year').startOf('month'));
    return (
      <div className='quick'>
        <div className='quick--title'>
          Quick Play
        </div>
        <div className='quick--main'>
          {_.range(7).map(i => (
            <div className='quick--day'>
              { this.renderPuzzleSquare(moment().subtract(1, 'year').day(i), {
                date: true
              })}
            </div>
          )) }
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='quickplay'>
        <div className='quickplay--quick'>
          {this.renderQuick()}
        </div>
        <div className='quickplay--calendar'>
          {this.renderCalendar(this.state.month)}
        </div>
      </div>
    );
  }
};
