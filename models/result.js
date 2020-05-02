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
        ref: 'Assignment'
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    },
    outputs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Output'
    }],
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    stderr: [String],
    stdout: [String],
    signal: String,
    exit: Number,
    debug_server: String,
    debug_node: String,
    debug_instance: String,
    passed: Boolean,
    compiled: Boolean,
    date: String
});

// Load plugin to automatically populate nested queries
ResultSchema.plugin(autopopulate);

let Result = mongoose.model('Result', ResultSchema);

module.exports = Result;
