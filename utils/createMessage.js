const moment = require('moment');

const messageFormater = (username, message) => {
  return {
    username,
    message,
    time: moment().format('h:mm a'),
  };
};

module.exports = messageFormater;
