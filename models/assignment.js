let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `assignment` database collection
let AssignmentSchema = new mongoose.Schema({
  name: String,
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    autopopulate: 1
  }],
  responses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
    autopopulate: 1
  }],
  command: String,
  files: [String],
  duedate: String,
  late: String,
  assigned: {
    type: Boolean,
    default: false
  },
  date: String
});

AssignmentSchema.plugin(autopopulate);

let Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;
