let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `assignment` database collection
let AssignmentSchema = new mongoose.Schema({
  name: String,
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  shared_files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  responses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
    autopopulate: 1
  }],
  type: {
    type: String,
    enum: ['assignment', 'test'],
    default: 'assignment'
  },
  workspaces: {
    type: Boolean,
    default: true
  },
  quick_edits: {
    type: Boolean,
    default: true
  },
  timeout: {
    type: Number,
    default: 5000
  },
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
