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
    passed: Boolean,
    date: String
});

// Load plugin to automatically populate nested queries
ResultSchema.plugin(autopopulate);

let Result = mongoose.model('Result', ResultSchema);

module.exports = Result;
