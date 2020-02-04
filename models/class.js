let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `class` database collection
let ClassSchema = new mongoose.Schema({
  name: String,
  section: Number,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: 1
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: false
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    autopopulate: true
  }],
  code: String
});

// Load plugin to automatically populate nested queries
ClassSchema.plugin(autopopulate);

let Class = mongoose.model('Class', ClassSchema);

module.exports = Class;
