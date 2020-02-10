var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/course');
let Result = require('../models/result');
let Output = require('../models/output');
let Test = require('../models/test');
let diffJs = require('diff');

let utils = require('../services/utils');
let rest = require('../services/rest');

utils.getRouteWithUser('/grade/:response', router, (req, res, user) => {
    Result.findById(req.params.response, (err, result) => {
        result.outputs.forEach((outputSchema) => {
            Output.findById(outputSchema._id, (err, out) => {
                let diff = [];
                let errorDiff = [];
                for (let i = 0; i < out.stderr.length; i++) {
                    errorDiff.push(diffJs.diffWords((out.stderr[i] !== null) ? out.stderr[i] : "", (typeof out.test != 'undefined') ? out.test.error[i] : ""));
                }
                for (let i = 0; i < out.output.length; i++) {
                    diff.push(diffJs.diffWords((out.output[i] !== null) ? out.output[i] : "", (typeof out.test != 'undefined') ? out.test.outputs[i] : ""));
                }
                let outMatch = (out.test.outputs.toString() === out.output.toString());
                let errMatch = (out.test.error.toString() === out.stderr.toString());
                let exitMatch = out.code === out.test.code;

                if (!outMatch) out.error_type.push('stdout');
                if (!errMatch) out.error_type.push('stderr');
                if (!exitMatch) out.error_type.push('exit');
                if (out.signal === "SIGTERM") out.error_type.push('loop');
                out.passed = outMatch && errMatch && exitMatch;
                out.diff = JSON.stringify(diff);
                out.error_diff = JSON.stringify(errorDiff);
                out.save((err, o) => {

                });
            });
        });
    });
    res.redirect('/response/' + req.params.response);
});

utils.getRouteWithUser('/:response', router, (req, res, user) => {
    Result.findById(req.params.response, (err, result) => {
        if (result.outputs.filter((output) => (!output.passed)).length >= 1) result.passed = false;
        result.save((err, resu) => {
            res.render("response", {user: user, result: resu, back: req.back});
        });
    }).populate(["assignment", "files"]);
});

utils.getRouteWithUser('/output/:output', router, (req, res, user) => {
    Output.findById(req.params.output, (err, output) => {
        Result.findOne({outputs: {$in: [output._id]}}, (err, resp) => {
            res.render("output", {user: user, output: output, response: resp});
        }).populate("assignment");
    });
});

let request = require('request');


module.exports = router;
