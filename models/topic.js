const config = require("../config.json");
let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `topic` database collection
let TopicSchema = new mongoose.Schema({
  title: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    autopopulate: true
  },
  body: String,
  picture: String,
  section: {
    type: String,
    enum: ['us', 'world', 'politics', 'business', 'tech', 'health', 'entertainment', 'opinion', 'history'],
    default: 'us'
  },
  tags: [String],
  desc: String,
  views: {
    type: Number,
    default: "0"
  },
  standing: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: false
  },
  nsfw: {
    type: Boolean,
    default: false
  },
  date: String
});

TopicSchema.plugin(autopopulate);

var Topic = mongoose.model('Topic', TopicSchema);

module.exports = Topic;
