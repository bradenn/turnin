let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `File` database collection
let FileSchema = new mongoose.Schema({
    name: String,
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: 1
    },
    content: [String],
    date: String
});

// Load plugin to automatically populate nested queries
FileSchema.plugin(autopopulate);

let File = mongoose.model('File', FileSchema);

module.exports = File;
