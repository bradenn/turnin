var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');
let Test = require('../models/test');
let Assignment = require('../models/assignment');
let Output = require('../models/output');


// Handle /assignments requests
router.get('/', function (req, res, next) {
    // Query USER, CLASS, and ASSIGNMENTS
    User.findById(req.session.userId, function (userError, user) {
        Class.find({
            instructor: req.session.userId
        }, function (classError, classes) {
            // Check user status
            if (user != null && user.type > 0) {
                // Render assignments page
                res.render("assignments", {
                    user: user,
                    classes: classes
                });
            } else {
                // to login if user isnt logged in or allowed
                res.redirect("/login");
            }
        });
    });
});

// Handle requests for creating a new assignment
router.get('/new', function (req, res, next) {
    // Query USER primaily to check permissions
    User.findById(req.session.userId, function (userError, user) {
        // Query for all classes taught by said instructor
        Class.find({
            instructor: req.session.userId
        }, function (classError, classes) {
            // Check to see if the user is allowed to make a new assignment
            if (user != null && user.type > 0) {
                // Render new assignment page with relivant data
                res.render("newassignment", {
                    user: user,
                    classes: classes
                });
            } else {
                // to login if not logged in or allowed
                res.redirect("/login");
            }
        });
    });
});

router.get('/edit/:assignment', function (req, res, next) {
    User.findById(req.session.userId, function (userError, user) {
        Assignment.findById(req.params.assignment, function (err, assignment) {
            Output.find({test: {$in: assignment.tests.map((test) => test._id)}}, function (err, outputs) {
                res.render('assignment', {user: user, assignment: assignment, outputs: outputs});
            });
        });
    });
});

router.get('/grades/:assignment', function (req, res) {
    User.findById(req.session.userId, function (userError, user) {
        Assignment.findById(req.params.assignment, function (err, assignment) {
            Class.findOne({assignments: assignment._id}, function (err, lecture) {
                res.render('grades', {user: user, assignment: assignment, students: lecture.students});
            }).populate("students");
        });
    });
});

let utils = require('../services/utils');

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
let tar = require('tar-stream');
let fs = require("fs");
utils.postRouteWithUserAndTar('/edit/:assignment/tar', router, function (req, res, user) {
    Assignment.findById(req.params.assignment, function (err, assignment) {
        utils.unpackTar(req.files[0].filename, (fss) => {
            console.log(fss);
        });
        Test.create({
            name: req.body.testName,
            inputs: String("").split("\n"),
            outputs: String("").split("\n")
        }, (err, test) => {

            assignment.tests.push(test._id);
            // test.save(dd => {
            //   assignment.save((assignment) => {
           // res.redirect(req.get('referer'));
            //   });
            // });
        });

    });
});

// Handle post requests for creating a new assignment
router.post('/new', function (req, res, next) {
    // Query USER primaily to check permissions
    User.findById(req.session.userId, function (userError, user) {
        // Query for all classes taught by said instructor
        Class.findById(req.body.assignmentClass, function (classError, classes) {
            // Check to see if the usconsole.log(classError);
            if (user != null && user.type > 0) {
                let e = {
                    name: req.body.assignmentName,
                    files: req.body.assignmentFiles.split(", "),
                    duedate: req.body.assignmentDueDate,
                    command: req.body.makeCommand,
                    date: new Date()
                };
                Assignment.create(e, (error, assignment) => {
                    classes.assignments.push(assignment);
                    classes.save((err, classes) => {

                        res.redirect('/assignments/edit/' + assignment._id);
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
