const config = require("../config.json");
let mongoose = require('mongoose');

let MessageSchema = new mongoose.Schema({
  text: String,
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: String
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
