var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');
let Result = require('../models/result');
let Output = require('../models/output');
let Test = require('../models/test');
let diffJs = require('diff');


let utils = require('../services/utils');
let rest = require('../services/rest');

utils.getRouteWithUser('/:response', router, (req, res, user) => {
    Result.findById(req.params.response, (err, result) => {
        result.outputs.forEach((outputSchema) => {
            Output.findById(outputSchema._id, (err, out) => {
                if (out.diff == null) {
                    let diff = [];
                    for (let i = 0; i < out.test.outputs.length; i++) {
                        diff.push(diffJs.diffWords((out.output[i] !== null) ? out.output[i] : "", out.test.outputs[i]));
                    }
                    out.diff = JSON.stringify(diff);
                    out.save((err, o) => {
                    });
                }
            });
        });
        result.outputs.forEach((test) => {
            if (typeof test.passed == 'undefined') {
                let passed = true;
                Output.findById(test._id, (err, out) => {
                    out.passed = (test.test.outputs.toString() === test.output.toString());
                    if (test.test.outputs.toString() !== test.output.toString()) passed = false;
                    out.save((err, o) => {
                    });
                });
            }
        });
        let passed = true;
        result.outputs.forEach((test) => {
            if (test.passed == false) passed = false;
        });
        result.passed = passed;
        result.save((err, result) => {

            res.render("response", {user: user, result: result});
        });


    });
});

utils.getRouteWithUser('/output/:output', router, (req, res, user) => {
    Output.findById(req.params.output, (err, output) => {

        res.render("output", {user: user, output: output});
    });
});

let request = require('request');


module.exports = router;
