let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

let OutputSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        autopopulate: 1
    },
    signal: String,
    stderr: [String],
    stdout: [String],
    exit: Number,
    message: String,
    passed: Boolean,
    diff: String,
    time: Number,
    error_diff: String,
    error_type: [{
        type: String,
        enum: ['stdout', 'stderr', 'exit', 'loop', 'exec', 'none'],
        default: 'none'
    }],
    hidden: Boolean,
    output: [String]
});

// Load plugin to automatically populate nested queries
OutputSchema.plugin(autopopulate);

let Output = mongoose.model('Output', OutputSchema);

module.exports = Output;
