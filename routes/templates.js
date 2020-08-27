let express = require('express');
let router = express.Router();
let Templates = require('../services/template.service');
let TemplateSchema = require('../models/template.model');
const Assignment = require('../models/assignment');
const Course = require('../models/course');
const Test = require('../models/test');
const File = require('../models/file');

router.get('/', (req, res, next) => {
    TemplateSchema.find({instructor: req.user._id}).exec().then(doc => {
        res.render('templates', {templates: doc})
    }).catch(err => {
        next();
    });
});

router.get('/:template', (req, res, next) => {
    TemplateSchema.findById(req.params.template).exec().then(doc => {
        Course.find({instructor: req.user._id}).exec().then(courses => {
            res.render('template', {template: doc, courses: courses});
        }).catch(err => {
            next(err);
        });
    }).catch(err => {
        next(err);
    });
});

router.post('/:template/assignment', (req, res, next) => {
    TemplateSchema.findById(req.params.template).exec().then(doc => {
        Course.findOne({_id: req.body.course}).exec().then(course => {

                let templateObject = JSON.parse(doc.content);

            let templateTests = templateObject.tests;
            let formattedTests = templateTests.map(test => {
                return {
                    name: test.name,
                    inputs: test.stdin,
                    outputs: test.stdout,
                    error: test.stderr,
                    arguments: test.arguments,
                    timeout: test.timeout,
                    cmd: test.arguments,
                    hidden: test.hidden,
                    provided: test.provided,
                    code: test.exit
                }
            });

            Promise.all(formattedTests.map(test => Test.create(test))).then(tests => {
                let templateSharedFiles = templateObject.shared_files;
                let formattedFiles = templateSharedFiles.map(file => {
                    return {
                        name: file.name,
                        student: req.user._id,
                        content: file.content
                    }
                });
                Promise.all(formattedFiles.map(file => File.create(file))).then(shared_files => {
                    let assignmentData = {
                        name: doc.name,
                        course: course._id,
                        command: doc.command,
                        timeout: doc.timeout,
                        duedate: new Date(req.body.assignmentDueDate),
                        late: new Date(req.body.assignmentLateDueDate),
                        files: templateObject.files,
                        tests: tests.map(test => test._id),
                        shared_files: shared_files
                    };
                    Assignment.create(assignmentData).then(assignment => {
                        Course.findOneAndUpdate({_id: course._id}, {$push: {assignments: assignment._id}}).then(cose => {
                        req.session.info = `Successfully created assignment '${assignment.name}'.`;
                        res.redirect(`/assignments/${assignment._id}`);
                        }).catch(err => next(new Error("Failed to update Course." + err)));
                    }).catch(err => next(new Error("Failed to generate Assignment." + err)));
                }).catch(err => next(new Error("Failed to generate Files." + err)));
            }).catch(err => next(new Error("Failed to generate Tests." + err)));
        }).catch(err => {
            req.session.error = "Invalid course selected." + err;
            res.redirect('back');
        });
    }).catch(err => {
        req.session.error = "Template not found." + err;
        res.redirect('back');
    });
});

router.get('/:template/delete', (req, res, next) => {
    TemplateSchema.findOneAndDelete({_id: req.params.template}).exec().then(doc => {
        req.session.info = `Successfully deleted template '${doc.name}'.`
        res.redirect('back');
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
        Course.findOne({assignments: req.params.assignmentId}).exec().then(course => {
            let template = new Templates();
            doc.files.forEach(file => template.addFile(file));
            doc.shared_files.forEach(file => template.addSharedFile(file));
            doc.tests.forEach(test => template.addTest(test));
            template.setName(doc.name);
            template.setCommand(doc.command);
            template.setTimeout(doc.timeout);
            template.setCourse(course.name);
            template.save(req.user._id).then(doc => {
                req.session.info = "Template successfully created.";
                return res.redirect(`/templates/${doc}`);
            }).catch(err => {
                req.session.error = "An error occurred while generating this template.";
                return res.redirect('back');
            });
        }).catch(err => {
            req.session.error = "Failed to lookup course to generate template.";
            return res.redirect('back');
        });
    }).catch(err => {
        req.session.error = "Failed to lookup assignment to generate template.";
        return res.redirect('back');
    });
});

module.exports = router;