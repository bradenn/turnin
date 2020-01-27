var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');
let Test = require('../models/test');
let Assignment = require('../models/assignment');
let Result = require('../models/result');
let Output = require('../models/output');


let utils = require('../services/utils');
let rest = require('../services/rest');

utils.getRouteWithUser('/:assignment', router, (req, res, user) => {
    Assignment.findById(req.params.assignment, (err, assignment) => {
        res.render("submit", {user: user, assignment: assignment});
    });
});

let request = require('request');

utils.postRouteWithUserAndFiles('/:assignment', router, (req, res, user) => {
    Assignment.findById(req.params.assignment, (err, assignment) => {
        let files = [];
        for (let i = 0; i < assignment.files.length; i++) {
            files.push({name: assignment.files[i], contents: String(req.files[i].buffer).split("\n")});
        }
        let tests = [];
        assignment.tests.forEach((test) => {
            tests.push({name: test.name, _id: test._id, input: test.inputs, output: test.outputs});
        });
        let re = request({
            url: "http://localhost:5555/api/test",
            method: "POST",
            json: {
                make: assignment.command,
                files: {files},
                tests: {tests}
            }
        });
        console.log(JSON.stringify({
            make: assignment.command,
            files: {files},
            tests: {tests}
        }));
        re.on('response', function (response) {
            let body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('end', function () {
                Result.create({student: user._id, assignment: assignment._id, date: new Date}, (err, resp) => {
                    let results = JSON.parse(body).output.results;
                    let testResults = [];
                    results.forEach(result => {
                        testResults.push({test: result._id, output: result.output.lines});
                    });
                    Output.create(testResults, (err, tst) => {
                        if (err) console.log(err);
                        console.log(err);
                        tst.forEach((ts) => {
                            resp.outputs.push(ts);
                        });
                        resp.save((err, r) => {
                            console.log(r);
                        });
                        assignment.responses.push(resp);
                        assignment.save((assignment) => {
                            res.redirect('/response/' + resp._id);
                        });
                    });

                });
            });
        });
    });
});


module.exports = router;
