let express = require('express');
let router = express.Router();
let Template = require('../services/template');
let TemplateSchema = require('../models/template.model');
const Assignment = require('../models/assignment');
const Course = require('../models/course');

router.get('/:template', (req, res, next) => {
    TemplateSchema.findById(req.params.template).exec().then(doc => {
        res.render('template', {template: doc})
    }).catch(err => {
        next();
    });
});

router.get('/:template/download/json', (req, res, next) => {
    TemplateSchema.findById(req.params.template).exec().then(doc => {
        const fileData = JSON.stringify(doc);
        const fileName = `${doc.name.replace(' ', '_')}_template.json`;
        const fileType = 'text/json';
        res.writeHead(200, {
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Type': fileType,
        });
        const download = Buffer.from(fileData, 'utf-8')
        res.end(download)
    }).catch(err => {
        next();
    });
});

router.get('/generate/:assignmentId', async (req, res, next) => {
    Assignment.findById(req.params.assignmentId).populate(['tests', 'shared_files']).exec().then(doc => {
        let template = new Template();
        doc.files.forEach(file => template.addFile(file));
        doc.shared_files.forEach(file => template.addSharedFile(file));
        doc.tests.forEach(test => template.addTest(test));
        template.setName(doc.name);
        template.setCommand(doc.command);
        template.setTimeout(doc.timeout);
        template.save(req.user._id).then(doc => {
            req.session.info = "Template successfully created.";
            return res.redirect(`/template/${doc}`);
        }).catch(err => {
            req.session.error = "An error occurred while generating this template.";
            return res.redirect('back');
        });
    }).catch(err => {
        req.session.error = "Failed to lookup assignment to generate template.";
        return res.redirect('back');
    });
});

module.exports = router;