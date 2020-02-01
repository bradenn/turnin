var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');
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
                for (let i = 0; i < out.output.length; i++) {
                    diff.push(diffJs.diffWords((out.output[i] !== null) ? out.output[i] : "", (typeof out.test != 'undefined') ? out.test.outputs[i] : ""));
                }
                if(out.test) out.passed = (out.test.outputs.toString() === out.output.toString());
                out.diff = JSON.stringify(diff);
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
            res.render("response", {user: user, result: resu});
        });
    }).populate(["assignment", "files"]);
});

utils.getRouteWithUser('/output/:output', router, (req, res, user) => {
    Output.findById(req.params.output, (err, output) => {

        res.render("output", {user: user, output: output});
    });
});

let request = require('request');


module.exports = router;
