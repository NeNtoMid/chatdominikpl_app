const User = require('../models/userM');
const { model } = require('mongoose');

const createUser = async (username, room) => {
  const user = new User({ username, room });
  return await user.save();
};

module.exports = createUser;
