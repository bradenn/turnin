let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `Workspace` database collection
let WorkspaceSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    last_edit: String,
    date: String
});

// Load plugin to automatically populate nested queries
WorkspaceSchema.plugin(autopopulate);

let Workspace = mongoose.model('Workspace', WorkspaceSchema);

module.exports = Workspace;
