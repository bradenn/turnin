let router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');
let Test = require('../models/test');
let Assignment = require('../models/assignment');
let Result = require('../models/result');
let config = require('../config.json');
let Output = require('../models/output');
let File = require('../models/file');


let utils = require('../services/utils');
let rest = require('../services/rest');

utils.getRouteWithUser('/:assignment', router, (req, res, user) => {
    Assignment.findById(req.params.assignment, (err, assignment) => {
        res.render("submit", {user: user, assignment: assignment});
    });
});

let request = require('request');

utils.postRouteWithUserAndFiles('/:assignment', router, (req, res, user, next) => {
    Assignment.findById(req.params.assignment, (err, assignment) => {
        if(req.files.length === assignment.files.length) {
            let files = [];
            let dbFiles = [];
            for (let i = 0; i < assignment.files.length; i++) {
                dbFiles.push({
                    name: assignment.files[i],
                    date: new Date(),
                    student: user._id,
                    content: String(req.files[i].buffer).split("\n")
                });
                files.push({name: assignment.files[i], contents: String(req.files[i].buffer).split("\n")});
            }

            File.create(dbFiles, (err, filesM) => {
                let tests = [];
                assignment.tests.forEach((test) => {
                    tests.push({name: test.name, _id: test._id, input: test.inputs, output: test.outputs});
                });
                let re = request({
                    url: config.worker,
                    method: "POST",
                    json: {
                        make: assignment.command,
                        files,
                        tests
                    }
                });
                process.on("uncaughtException", (err) => {
                    res.render("submit", {user: user, assignment: assignment, error: "largefile"});
                });
                re.on('error', function (err) {
                    res.render("submit", {user: user, assignment: assignment, error: "noserver"});
                });
                re.on('response', function (response) {
                    let body = '';
                    response.on('data', function (chunk) {
                        body += chunk;
                    });
                    response.on('end', function () {
                        let compile = JSON.parse(body).compile;
                        let debug = JSON.parse(body).debug;
                        console.log(debug);
                        Result.create({
                            student: user._id,
                            assignment: assignment._id,
                            stderr: compile.stderr,
                            stdout: compile.stdout,
                            exit: compile.code,
                            debug_server: debug.server,
                            debug_node: debug.node,
                            debug_instance: debug.instance,
                            files: filesM.map(file => file._id),
                            date: new Date
                        }, (err, resp) => {
                            let results = JSON.parse(body).tests;

                            let testResults = [];
                            if (results) results.forEach(result => {
                                testResults.push({
                                    test: result._id,
                                    output: result.stdout.lines,
                                    exit: result.code,
                                    stdout: [""],
                                    stderr: result.stderr.lines,
                                    signal: result.signal
                                });
                            });
                            Output.create(testResults, (err, tst) => {

                                tst.forEach((ts) => {
                                    resp.outputs.push(ts);
                                });
                                resp.save((err, r) => {
                                });
                                assignment.responses.push(resp);
                                assignment.save((assignment) => {
                                    res.redirect('/response/grade/' + resp._id);

                                });
                            });

                        });
                    });
                });

            });
        }else{
            return res.render("submit", {user: user, assignment: assignment, error: "nofile"});
        }
    });
});


module.exports = router;
