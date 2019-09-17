const config = require("../config.json");
let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `Team` database collection
let TeamSchema = new mongoose.Schema({
  name: String,
  description: String,
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true
  }]
});

TeamSchema.plugin(autopopulate);

var Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
