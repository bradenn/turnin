const config = require("../config.json");
let crypto = require('crypto');
let mongoose = require('mongoose');

// Define schema for `user` database collection
let NotificationSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['message', 'interaction', 'error'],
    default: 'interaction'
  },
  message: String,
  redict: String,
  date: String
});


var Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
