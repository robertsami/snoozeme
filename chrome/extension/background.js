import _ from 'underscore';

/*
Storage data should be of the form:
{
  alarms: {
    [url]: timeToFire,
  },
  lastShownAlarm: time,
}
*/

const initializeAlarms = () => {
  // Read storage on first load and trigger any alarms
  fetchAlarms((alarmData) => {
    if (!alarmData) {
      writeAlarms({alarms: {}, lastShownAlarm: 0});
      return;
    }
    chrome.alarms.getAll((alreadySetAlarms) => {
      const alreadySetUrls = _.pluck(alreadySetAlarms, 'name');
      for (const url of Object.keys(alarmData.alarms)) {
        const timeToFire = alarmData.alarms[url];
        if (alreadySetUrls.indexOf(url) != -1 || timeToFire < alarmData.lastShownAlarm) {
          continue;
        }
        chrome.alarms.create(url, {when: timeToFire});
      }
    });
  });
};
chrome.runtime.onStartup.addListener(initializeAlarms);

const fetchAlarms = (callback) => {
  chrome.storage.sync.get('alarmData', ({alarmData}) => callback(alarmData));
};

const writeAlarms = (alarmData) => {
  chrome.storage.sync.set({alarmData})
};

const setAndPersistTabAlarm = (url, delayMs) => {
  const timeToFire = new Date().getTime() + delayMs;
  chrome.alarms.create(url, {when: timeToFire});
  fetchAlarms((alarmData) => {
    alarmData.alarms[url] = timeToFire
    writeAlarms(alarmData);
  });
};

const updateLastShownAlarmToNow = () => {
  fetchAlarms((alarmData) => {
    const now = new Date().getTime();
    if (alarmData.lastShownAlarm < now) {
      alarmData.lastShownAlarm = now;
      writeAlarms(alarmData);
    }
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const {tab, delayMs, notifMsg} = message;
  setAndPersistTabAlarm(tab.url, delayMs);
  chrome.notifications.create({
    type: 'basic',
    title: 'SnoozeMe',
    message: notifMsg,
    iconUrl: 'img/icon-128.png',
  });
  sendResponse({
    msg: 'thanksDude',
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.tabs.create({url: alarm.name, active: false}, (tab) => {
    updateLastShownAlarmToNow();
  });
});
