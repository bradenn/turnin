let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `Test` database collection
let TestSchema = new mongoose.Schema({
    name: String,
    inputs: [String],
    outputs: [String],
    error: [String],
    arguments: String,
    cmd: String,
    hidden: Boolean,
    provided: [{
        type: String,
        enum: ['out', 'err', 'cmd', 'timeout', 'exit']
    }],
    code: Number
});

// Load plugin to automatically populate nested queries
TestSchema.plugin(autopopulate);

let Test = mongoose.model('Test', TestSchema);

module.exports = Test;
