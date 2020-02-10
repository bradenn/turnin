let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `class` database collection
let CourseSchema = new mongoose.Schema({
    name: String,
    section: Number,
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        autopopulate: 1
    }],
    code: String
});

// Load plugin to automatically populate nested queries
CourseSchema.plugin(autopopulate);

CourseSchema.virtual('link').get(() => {
    return `/courses/${this._id}`;
});

let Course = mongoose.model('Course', CourseSchema);

module.exports = Course;
