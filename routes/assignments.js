let router = require('express').Router();
let User = require('../models/user');
let Course = require('../models/course');
let Test = require('../models/test');
let Assignment = require('../models/assignment');
let Output = require('../models/output');
let Result = require('../models/result');
let utils = require('../services/utils');
let File = require('../models/file');

router.get('/', async (req, res, next) => {
    if (utils.authenticateUser(req.user)) return res.redirect("/");
    let courses = await Course.find({instructor: req.user._id}).exec();
    res.render("assignments", {user: req.user, courses: courses});
});

router.get('/new', async (req, res, next) => {
    if (utils.authenticateUser(req.user)) return res.redirect("/");
    let courses = await Course.find({instructor: req.user._id}).exec();
    res.render("newassignment", {user: req.user, courses: courses});
});

router.get('/:assignment', function (req, res, next) {
    User.findById(req.session.userId, function (userError, user) {
        Assignment.findById(req.params.assignment, function (err, assignment) {
            Output.find({test: {$in: assignment.tests.map((test) => test._id)}}, function (err, outputs) {
                res.render('assignment', {
                    user: user,
                    assignment: assignment,
                    outputs: outputs,
                    back: req.back,
                    error: req.query.error
                });
            });
        }).populate("tests").populate("shared_files", "name");
    });
});

router.get('/:assignment/delete', async (req, res, next) => {
    if (utils.authenticateUser(req.user)) return res.redirect("/");
    let assignment = await Assignment.findOne({_id: req.params.assignment}).exec();
    Test.deleteMany({_id: {$in: assignment.tests.map(test => test._id)}}, (err) => {
        File.deleteMany({_id: {$in: assignment.shared_files}}, (err) => {
            Output.deleteMany({_id: {$in: assignment.responses.outputs}}, (err) => {
                File.deleteMany({_id: {$in: assignment.responses.files}}, (err) => {
                    Result.deleteMany({_id: {$in: assignment.responses}}, (err) => {
                        Assignment.deleteOne({_id: req.params.assignment}, (err) => {
                            res.redirect("/assignments");
                        });
                    });
                });
            });
        });
    });
});

router.get('/grades/:assignment', function (req, res) {
    User.findById(req.session.userId, function (userError, user) {
        Assignment.findById(req.params.assignment, function (err, assignment) {
            Course.findOne({assignments: assignment._id}, function (err, course) {
                res.render('grades', {
                    user: user,
                    assignment: assignment,
                    students: course.students,
                    course: course,
                    back: req.back
                });
            }).populate("students");
        }).populate("responses");
    });
});

router.get('/edit/:assignment/file/remove/:file', async (req, res, next) => {
    if (utils.authenticateUser(req.user)) return res.redirect("/");
    Assignment.findOneAndUpdate({_id: req.params.assignment}, {$pullAll: {shared_files: [req.params.file]}}, (err, assignment) => {
        File.findOneAndDelete({_id: req.params.file}, (err, file) => {
            res.redirect("back");
        });
    });
});

utils.postRouteWithUserAndFiles('/edit/:assignment/file/add', router, (req, res, user) => {
    if (utils.authenticateUser(req.user)) return res.redirect("/");
    Assignment.findById(req.params.assignment, function (err, assignment) {
        let dbFiles = [];
        for (let i = 0; i < req.files.length; i++) {
            dbFiles.push({
                name: req.files[i].originalname,
                date: new Date(),
                student: user._id,
                content: String(req.files[i].buffer).split("\n")
            });
        }

        File.create(dbFiles, (err, filesM) => {
            filesM.forEach((file) => assignment.shared_files.push(file._id));
            assignment.save((err, assignment) => {
                res.redirect("back");
            });
        });

    });

});

utils.postRouteWithUserAndFiles('/edit/:assignment/single', router, function (req, res, user) {
    Assignment.findById(req.params.assignment, function (err, assignment) {
        Test.create({
            name: req.body.testName,
            inputs: String(req.files[0].buffer).split("\n"),
            outputs: String(req.files[1].buffer).split("\n")
        }, (err, test) => {
            assignment.tests.push(test._id);
            test.save(dd => {
                assignment.save((assignment) => {
                    res.redirect(req.get('referer'));
                });
            });
        });

    });
});

utils.getRouteWithUser('/edit/:assignment/assign/:assign', router, (req, res, user) => {
    Assignment.findById(req.params.assignment, function (err, assignment) {
        if (user.type >= 1) {
            assignment.assigned = req.params.assign;
            assignment.save((err, assignment) => {
                res.redirect(req.get('referer'));
            });
        }
    });
});

let tar = require('tar-stream');
let fs = require("fs");
utils.postRouteWithUserAndTar('/edit/:assignment/tar', router, function (req, res, next, user) {
    Assignment.findById(req.params.assignment, function (err, assignment) {
        utils.unpackTar("./uploads/" + req.files[0].filename, req.files[0].originalname, (error, files) => {
            if (error) {
                res.redirect(req.get('referer') + "?error=" + error.code);
            }
            let formattedData = [];
            // {name: 't00', files: [{name: "t01.in", lines: [""]}]}
            files.forEach(test => {
                let inputs = [];
                let outputs = [];
                let errors = [];
                let cmd = "";
                let code = 0;
                test.files.forEach(file => {
                    const ln = utils.readFile(`${req.files[0].originalname.replace(".tar", "")}/tests/${file}`);
                    switch (file.split(".")[1]) {
                        case "in":
                            inputs = ln.lines;
                            break;
                        case "out":
                            outputs = ln.lines;
                            break;
                        case "err":
                            errors = ln.lines;
                            break;
                        case "cmd":
                            cmd = ln.lines[0];
                            break;
                        case "code":
                            code = ln.lines[0];
                            break;
                        default:
                            break;
                    }
                });
                formattedData.push({
                    name: test.name,
                    outputs: outputs,
                    inputs: inputs,
                    error: errors,
                    cmd: cmd,
                    code: code
                });
            });
            Test.create(formattedData, (err, tests) => {
                tests.forEach(test => assignment.tests.push(test._id));
                assignment.save((err, save) => {
                    res.redirect(req.get('referer'));
                });
            });
        });
    });
});

// Handle post requests for creating a new assignment
router.post('/new', function (req, res, next) {
    // Query USER primaily to check permissions
    User.findById(req.session.userId, function (userError, user) {
        // Query for all classes taught by said instructor
        Course.findById(req.body.assignmentClass, function (classError, classes) {
            // Check to see if the usconsole.log(classError);
            if (user != null && user.type > 0) {
                let e = {
                    name: req.body.assignmentName,
                    files: req.body.assignmentFiles.split(", "),
                    duedate: req.body.assignmentDueDate,
                    late: req.body.assignmentLateDueDate,
                    command: req.body.makeCommand,
                    date: new Date()
                };
                Assignment.create(e, (error, assignment) => {
                    classes.assignments.push(assignment);
                    classes.save((err, classes) => {

                        res.redirect('/assignments/' + assignment._id);
                    });

                });
            } else {
                // to login if not logged in or allowed
                res.redirect("/login");
            }
        });
    });
});


module.exports = router;
