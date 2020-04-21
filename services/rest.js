let request = require('request');
let Assignment = require('../models/assignment');
let Result = require('../models/result');
let config = require('../env/config.json');
let Output = require('../models/output');
let Workspace = require('../models/workspace');
let File = require('../models/file');

let compileProgram = (workspaceId) => {
    return new Promise(async (resolve) => {
        let workspace = await Workspace.findById(workspaceId).populate('files').exec();
        let assignment = await Assignment.findById(workspace.assignment._id).populate('shared_files').exec();
        let files = [];
        workspace.files.forEach(file => files.push({name: file.name, contents: file.content}));
        assignment.shared_files.forEach(file => files.push({name: file.name, contents: file.content}));
        let tests = [];
        assignment.tests.forEach((test) => {
            tests.push({
                name: test.name,
                _id: test._id,
                input: test.inputs,
                arguments: test.arguments,
                output: test.outputs
            });
        });
        let postRequest = request({
            url: config.worker,
            method: "POST",
            json: {
                make: assignment.command,
                files,
                tests
            }
        });
        postRequest.on('error', (err) => {
            resolve({err: err, data: null});
        });
        postRequest.on('response', (response) => {
            let body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('end', () => {
                resolve({data: JSON.parse(body), err: null});
            });
        });
    });
};

let diffJs = require('diff');

function getDifferenceForAssignment(input, test) {

    let error_diff = JSON.stringify(diffJs.diffArrays(input.stderr, test.error));
    let diff = JSON.stringify(diffJs.diffArrays(input.stdout, test.outputs));

    let outMatch = (test.outputs.toString() === input.stdout.toString());
    let errMatch = (test.error.toString() === input.stderr.toString());
    let exitMatch = (input.exit === test.code);
    let execError = (input.exit === 127);

    let error_type = [];
    if (!outMatch && test.provided.includes("out")) error_type.push('stdout');
    if (!errMatch && test.provided.includes("err")) error_type.push('stderr');
    if (!exitMatch && test.provided.includes("exit")) error_type.push('exit');
    if (execError) error_type.push('exec');

    if (input.signal === "SIGTERM") error_type.push('loop');

    return {error_diff: error_diff, diff: diff, error_type: error_type, test: test};

}

function getJson(target, data, cb) {
    request.post(target, {form: data}).on('response', function (response) {
        let body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            cb(body);
        });
    });
}

let getAuthenticatedPost = (target, data, cb) => {
    getJson(target, data, body => {
        cb(body);
    });
};

module.exports.getAuthenticatedPost = getAuthenticatedPost;
module.exports.compileProgram = compileProgram;
module.exports.getDifferenceForAssignment = getDifferenceForAssignment;