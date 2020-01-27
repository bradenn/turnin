let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `Submission` database collection
let SubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        autopopulate: true
    }

});

// Load plugin to automatically populate nested queries
SubmissionSchema.plugin(autopopulate);

let Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = Submission;
