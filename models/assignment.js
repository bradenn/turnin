let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `assignment` database collection
let AssignmentSchema = new mongoose.Schema({
  name: String,
  checks: String,
  files: [String],
  duedate: String,
  date: String
});

AssignmentSchema.plugin(autopopulate);

var Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;
