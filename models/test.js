let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `Test` database collection
let TestSchema = new mongoose.Schema({
    name: String,
    inputs: [String],
    outputs: [String],
    error: [String],
    cmd: String,
    code: {
        type: Number,
        default: 0
    }
});

// Load plugin to automatically populate nested queries
TestSchema.plugin(autopopulate);

let Test = mongoose.model('Test', TestSchema);

module.exports = Test;
