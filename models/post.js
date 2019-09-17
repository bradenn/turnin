const config = require("../config.json");
let mongoose = require('mongoose');

// Define schema for `user` database collection
let PostSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'other'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  content: String,
  image: String,
  date: String
});


var Post = mongoose.model('Post', PostSchema);

module.exports = Post;
