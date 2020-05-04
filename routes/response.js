let router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/course');
let Result = require('../models/result');
let Output = require('../models/output');
let Test = require('../models/test');
let diffJs = require('diff');

let utils = require('../services/utils');
let rest = require('../services/rest');


router.get('/grade/:response', async (req, res, next) => {
    let result = await Result.findById(req.params.response).exec();
    let passed = true;
    result.outputs.forEach((outputSchema) => {
        Output.findById(outputSchema._id, (err, out) => {

            out.error_diff = JSON.stringify(diffJs.diffArrays(out.stderr, out.test.error));
            out.diff = JSON.stringify(diffJs.diffArrays(out.output, out.test.outputs));

            let outMatch = (out.test.outputs.toString() === out.output.toString());
            let errMatch = (out.test.error.toString() === out.stderr.toString());
            let exitMatch = (out.exit === out.test.code);
            let execError = (out.exit === 127);

            out.error_type = [];
            if (!outMatch && out.test.provided.includes("out")) out.error_type.push('stdout');
            if (!errMatch && out.test.provided.includes("err")) out.error_type.push('stderr');
            if (!exitMatch && out.test.provided.includes("exit")) out.error_type.push('exit');
            if (execError) out.error_type.push('exec');

            if (out.signal === "SIGTERM") out.error_type.push('loop');

            out.passed = (out.error_type.length < 1);
            if (!out.passed) {
                passed = false;
            }

            out.save((err, o) => {

            });
        });
    });
    Result.findById(req.params.response, (err, resul) => {
        resul.compiled = (resul.exit === 0);
        resul.passed = passed;

        resul.save((err, o) => {

        });
    });
    res.redirect('/response/' + req.params.response);
});

router.get('/:response', (req, res) => {
    Result.findById(req.params.response, (err, result) => {
        res.render("response", {result: result});
    }).populate(["assignment", "files", "outputs"]);
});

utils.getRouteWithUser('/output/:output', router, (req, res, user) => {
    Output.findById(req.params.output, (err, output) => {
        Result.findOne({outputs: {$in: [output._id]}}, (err, resp) => {
            res.render("output", {user: user, output: output, response: resp, back: req.back});
        }).populate("assignment");
    });
});

let request = require('request');


module.exports = router;
