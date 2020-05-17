let router = require('express').Router();
let Assignment = require('../models/assignment');
let {Submission} = require('../services/submission');
let multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

router.get('/:assignment', async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignment).exec();
    return res.render("submit", {assignment: assignment});
});

router.post('/:assignment', upload.any(), async (req, res, next) => {
    const assignment = await Assignment.findById(req.params.assignment).populate(["shared_files", "tests"]).exec();
    // Since we construct our submission in parts, a class is used to keep things organized
    const submission = new Submission();
    // The file array from multer is defined as req.files, it is reassigned here to avoid cross call conflict
    const files = req.files;
    // If the wrong number of files is uploaded, throw the error to the next router
    if (assignment.files.length !== files.length) {
        req.session.error = "Incorrect number of files submitted.";
        return res.redirect('back');
    }
    // Take uploaded files and match them with required by name
    assignment.files.forEach(fileName => {
        let target = files.find(file => file.originalname === fileName);
        submission.addFile(fileName, String(target.buffer).split('\n'));
    });
    // Add all shared files to the upload (Makefile, etc)
    assignment.shared_files.forEach(file => submission.addSharedFile(file.name, file.content));
    // Add all tests from the assignment
    assignment.tests.forEach(test => submission.addTest(test));
    // Set the make command from the assignment
    submission.setMake(assignment.command);
    // Once the submission completes, it redirects the user to the submission page
    await submission.testSubmission(req.user, assignment._id).then(doc => {
        return res.redirect(`/response/${doc}`);
    }).catch(err => {
        req.session.error = `Failed to grade assignment: ${err}`;
        return res.redirect('back');
    });
});


module.exports = router;
