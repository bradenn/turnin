let mongoose = require('mongoose');

let TemplateSchema = new mongoose.Schema({
    name: String,
    course: String,
    command: String,
    timeout: Number,
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: String
});

let Template = mongoose.model('Template', TemplateSchema);

module.exports = Template;