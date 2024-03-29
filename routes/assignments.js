let router = require('express').Router();
let User = require('../models/user');
let Course = require('../models/course');
let Test = require('../models/test');
let Assignment = require('../models/assignment');
let Output = require('../models/output');
let Result = require('../models/result');
let utils = require('../services/utils');
let File = require('../models/file');

router.get('/', async (req, res) => {

    let courses = await Course.find({instructor: req.user._id}).populate("assignments", "tests").exec();
    res.render("assignments", {courses: courses});
});

router.get('/new', async (req, res) => {
    let courses = await Course.find({instructor: req.user._id}).exec();
    res.render("newassignment", {user: req.user, courses: courses});
});

router.get('/:assignment', async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignment,).populate("tests").populate("shared_files", "name").exec();
    return res.render('assignment', {
        assignment: assignment
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

router.post('/:assignment/update', async (req, res, next) => {
    if (!req.user.type > 0) return next(new Error("Authentication Error."));
    const validKeys = ["workspaces", "quick_edits", "timeout", "duedate", "late"];
    let body = req.body;
    if (Object.keys(body).every(a => validKeys.includes(a))) return next(new Error("Insufficient keys provided."));
    body.workspaces = (body.workspaces === "on");
    body.quick_edits = (body.quick_edits === "on");
    Assignment.findOneAndUpdate({_id: req.params.assignment}, body, (error, doc) => {
        if (error) return next(new Error(`Fatal Error: ${error}`));
        req.session.info = `Successfully updated assignment.`;
        return res.redirect("back");
    });
});

router.get('/:assignment/grades', async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignment).populate("responses").exec();
    const course = await Course.findOne({assignments: assignment._id}).populate("students").exec();
    res.render('grades', {
        assignment: assignment,
        course: course
    });
});

router.get('/edit/:assignment/file/remove/:file', async (req, res, next) => {
    Assignment.findOneAndUpdate({_id: req.params.assignment}, {$pullAll: {shared_files: [req.params.file]}}, (err, assignment) => {
        File.findOneAndDelete({_id: req.params.file}, (err, file) => {
            req.session.info = `Successfully removed shared file.`;
            res.redirect("back");
        });
    });
});

router.get('/edit/:assignment/files/:file/remove/', async (req, res, next) => {
    Assignment.findOneAndUpdate({_id: req.params.assignment}, {$pullAll: {files: [req.params.file]}}, (err, assignment) => {
        req.session.info = "Successfully removed file.";
        res.redirect("back");
    });
});

router.get('/edit/:assignment/test/:test/remove/', async (req, res, next) => {
    Assignment.findOneAndUpdate({_id: req.params.assignment}, {$pullAll: {tests: [req.params.test]}}, (err, assignment) => {
        req.session.info = `Successfully removed test.`;
        res.redirect("back");
    });
});

router.post('/edit/:assignment/files/add', async (req, res, next) => {
    let input = req.body.name.replace(' ', "").split(",");
    Assignment.findOneAndUpdate({_id: req.params.assignment}, {$push: {files: input}}, (err, assignment) => {
        req.session.info = `Successfully added file${(input.length > 1) ? "s" : ""} '${input.join(", ")}'.`;
        res.redirect("back");
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
            if (assignment.files.length >= 1 && assignment.tests.length >= 1) {
                assignment.assigned = req.params.assign;
                assignment.save((err, assignment) => {
                    req.session.info = `Successfully ${(assignment.assigned) ? "assigned" : "unassigned"} ${assignment.name}.`;
                    res.redirect(req.get('referer'));
                });
            }else{
                req.session.error = "You must have at least one required file and one test to assign.";
                res.redirect('back');
            }
        }
    });
});

let tests = require('../services/tests');

let multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

router.post('/edit/:assignment/tar', upload.any(), async (req, res, next) => {
    let tarFile = req.files[0];
    if (!tarFile.originalname.endsWith(".tar.gz")) {
        req.session.error = `Only .tar.gz files are accepted; unable to process '${tarFile.originalname}'`;
        res.redirect('back');
    }
    Assignment.findById(req.params.assignment, (error, assignment) => {
        tests.untar(tarFile.buffer).then(files => {
            let tests = [];
            files.forEach(file => {
                let b = false;
                for (let i = 0; i < tests.length; i++) {
                    if (file.name.includes(tests[i].name)) {
                        tests[i].files.push(file);
                        b = true;
                    }
                }
                if (!b) {
                    tests.push({name: file.name.split(".")[0], files: [file]});
                }
            });
            let formattedData = [];
            // {name: 't00', files: [{name: "t01.in", lines: [""]}]}
            tests.forEach(test => {
                let inputs = [];
                let outputs = [];
                let errors = [];
                let cmd = "";
                let code = 0;
                let timeout = 2500;
                let provided = [];
                let hidden = false;
                test.files.forEach(file => {
                    let ln = file.content;
                    switch (file.name.split(".")[1]) {
                        case "in":
                            inputs = ln;
                            break;
                        case "hide":
                            inputs = ln;
                            hidden = true;
                            break;
                        case "out":
                            outputs = ln;
                            provided.push('out');
                            break;
                        case "err":
                            errors = ln;
                            provided.push('err');
                            break;
                        case "timeout":
                            timeout = ln[0];
                            provided.push('timeout');
                            break;
                        case "cmd":
                            cmd = ln.join(" ");
                            provided.push('cmd');
                            break;
                        case "exit":
                            code = ln[0];
                            provided.push('exit');
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
                    timeout: timeout,
                    arguments: cmd,
                    code: code,
                    provided: provided,
                    hidden: hidden
                });
            });
            Test.create(formattedData, (err, tests) => {
                tests.forEach(test => assignment.tests.push(test._id));
                assignment.save((err, save) => {
                    req.session.info = `Successfully added ${tests.length} test${(tests.length > 1) ? "s" : ""}.`;
                    res.redirect(req.get('referer'));
                });
            });
        }).catch(error => {
            let err = new Error(error);
            req.session.error = err;
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
                    files: [],
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
