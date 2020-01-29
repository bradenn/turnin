let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `Output` database collection
let OutputSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        autopopulate: 1
    },
    signal: String,
    stderr: [String],
    stdout: [String],
    code: String,
    message: String,
    passed: Boolean,
    diff: String,
    output: {
        type: [String],
        default: [""]
    }
});

// Load plugin to automatically populate nested queries
OutputSchema.plugin(autopopulate);

let Output = mongoose.model('Output', OutputSchema);

module.exports = Output;
