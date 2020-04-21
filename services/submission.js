let config = require("../env/config.json");
let request = require('request');
let Assignment = require('../models/assignment');
let Workspace = require('../models/workspace');

let evaluateFromWorkspace = async (workspaceId, cb) => {
    let workspace = await Workspace.findById(workspaceId).populate('files').exec();
    let assignment = await Assignment.findById(workspace.assignment._id).populate('shared_files').exec();
    let files = [];
    let tests = [];
    workspace.files.forEach(file => files.push({name: file.name, contents: file.content}));
    assignment.shared_files.forEach(file => files.push({name: file.name, contents: file.content}));
    assignment.tests.forEach((test) => {
        tests.push({
            name: test.name,
            _id: test._id,
            input: test.inputs,
            arguments: test.arguments,
            output: test.outputs
        });
    });
    evaluateAndGetJson(assignment.command, files, tests, cb);
};

let evaluateAndGetJson = (make, files, tests, cb) => {
    request({
        url: config.worker,
        method: "POST",
        json: {
            make: make,
            files: files,
            tests: tests
        }
    }).on('error', (err) => {
        cb(null, err);s
    }).on('response', (response) => {
        let body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', () => {
            cb(JSON.parse(body), null);
        });
    });
};

module.exports.evaluateFromWorkspace = evaluateFromWorkspace;
module.exports.evaluateAndGetJson = evaluateAndGetJson;