const config = require("../config.json");
let mongoose = require('mongoose');

let BlogSchema = new mongoose.Schema({
  title: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  picture: String,
  header: String,
  pages: [{
    name: String,
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page'
    }
  }],
  description: String
});

var Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
