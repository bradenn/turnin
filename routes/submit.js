let router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/course');
let Test = require('../models/test');
let Assignment = require('../models/assignment');
let Result = require('../models/result');
let config = require('../env/config.json');
let Output = require('../models/output');
let File = require('../models/file');
let {Submission} = require('../services/submission');
let multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

router.get('/:assignment', async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignment).exec();
    return res.render("submit", {assignment: assignment});
});

router.post('/:assignment', upload.any(), async (req, res, next) => {
    const assignment = await Assignment.findById(req.params.assignment).populate(["shared_files", "tests"]).exec();
    const submission = new Submission();
    const files = req.files;
    // If the wrong number of files is uploaded, throw the error to the next router
    if (assignment.files.length !== files.length) next(new Error("Incorrect number of files."));
    // Take uploaded files and match them with required by name
    assignment.files.forEach(fileName => {
        let target = files.find(file => file.originalname === fileName);
        submission.addFile(fileName, String(target.buffer).split('\n'));
    });
    // Add all shared files to the upload (Makefile, etc)
    assignment.shared_files.forEach(file => submission.addFile(file.name, file.content));
    // Add all tests from the assignment
    assignment.tests.forEach(test => submission.addTest(test));
    // Set the make command from the assignment
    submission.setMake(assignment.command);
    //
    return res.redirect(`/response/${await submission.testSubmission(req.user, assignment._id)}`);
});


module.exports = router;
