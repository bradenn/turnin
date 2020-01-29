let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `Result` database collection
let ResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        autopopulate: 1
    },
    outputs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Output',
        autopopulate: 1
    }],
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    stderr: String,
    stdout: String,
    signal: String,
    exit: Number,
    passed: {
        type: Boolean,
        default: true
    },
    date: String
});

// Load plugin to automatically populate nested queries
ResultSchema.plugin(autopopulate);

let Result = mongoose.model('Result', ResultSchema);

module.exports = Result;
