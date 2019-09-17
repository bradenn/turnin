const config = require("../config.json");
let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

let CommentSchema = new mongoose.Schema({
  text: String,
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true
  },
  date: String
});

CommentSchema.plugin(autopopulate);

var Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
