import _ from 'underscore';

import React, { Component } from 'react';
import style from './App.css';

const MILLIS_PER_MINUTE = 1000 * 60;
const MILLIS_PER_HOUR = 60 * MILLIS_PER_MINUTE;

export default class App extends Component {
  _getSuccessMessage(tab, timeOption) {
    return `Snoozed ${tab.title} for ${timeOption.text}!`;
  }

  _setTabTimeout(timeOption) {
    chrome.tabs.getSelected(null, (tab) => {
      chrome.runtime.sendMessage(null, {
        tab,
        delayMs: timeOption.ms,
        notifMsg: this._getSuccessMessage(tab, timeOption)
      }, null, (response) => {
        chrome.tabs.remove(tab.id, _.noop);
      });
    });
    
  }

  _getTimeOptions() {
    return [
      {text: '1 minute', ms: 1 * MILLIS_PER_MINUTE},
      {text: '1 Hour',   ms: 1 * MILLIS_PER_HOUR},
      {text: '5 Hours',  ms: 5 * MILLIS_PER_HOUR},
      {text: '1 Day',    ms: 24 * MILLIS_PER_HOUR},
    ];
  }

  render() {
    return (
      <div className={style.container}>
        <div className={style.snoozeMessage}>Snooze for...</div>
        {this._getTimeOptions().map((timeOption) => (
          <div key={timeOption.text} className={style.timeOption} onClick={() => this._setTabTimeout(timeOption)}>
            <span>{timeOption.text}</span>
          </div>
        ))}
      </div>
    );
  }
}
