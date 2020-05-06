let Assignment = require('../models/assignment');
let Workspace = require('../models/workspace');
let Result = require('../models/result');
let Output = require('../models/output');
let File = require('../models/file');
let Test = require('../models/test');
const config = require("../env/env.js");
let diffJs = require('diff');
const https = require('https')

class Submission {
    constructor() {
        this.make = "";
        this.files = [];
        this.tests = [];
    }

    setMake(make) {
        this.make = make;
    }

    addFile(name, contents) {
        this.files.push({name: name, contents: contents, shared: false});
    }

    addSharedFile(name, contents) {
        this.files.push({name: name, contents: contents, shared: true});
    }

    addTest(test) {
        this.tests.push({
            name: test.name,
            _id: test._id,
            input: test.inputs,
            max_stdout: test.outputs.toString().length,
            max_stderr: test.error.toString().length,
            arguments: test.arguments,
            output: test.outputs
        });
    }

    getElements() {
        return {
            make: this.make,
            files: this.files,
            tests: this.tests
        };
    }

    async formatSubmission() {
        let results = await fetchResponse(this);
        let response = {tests: [], compile: results.compile, debug: results.debug};
        for (const test of results.tests) {
            response.tests.push(getDifference(test, await Test.findById(test._id).exec()));
        }
        return response;
    }

    async testSubmission(user, assignment) {
        // Store all uploaded files to the database for later review
        const files = await Promise.all(this.files.filter(file => !file.shared).map(file =>
            File.create({
                name: file.name,
                student: user,
                date: new Date(),
                content: file.contents
            })));
        // Send the objects to be tested by turnin-worker
        const results = await this.formatSubmission();
        // Load the individual responses to each test
        const outputs = await Promise.all(results.tests.map(test => Output.create({
            test: test.test,
            output: test.stdout,
            diff: test.diff,
            error_diff: test.error_diff,
            error_type: test.error_type,
            passed: test.passed,
            exit: test.exit,
            stdout: test.stdout,
            stderr: test.stderr,
            signal: test.signal,
            time: test.time
        })));
        // Here the result container is made, holding info for about the compile, debug, files, and tests
        const result = await Result.create({
            student: user,
            assignment: assignment,
            outputs: outputs.map(output => output._id),
            stderr: results.compile.stderr,
            stdout: results.compile.stdout,
            signal: results.compile.signal,
            passed: outputs.reduce((acc, next) => acc && next.passed, true),
            exit: results.compile.code,
            compile_time: results.compile.time,
            compiled: (results.compile.code === 0),
            debug_server: results.debug.server,
            debug_node: results.debug.node,
            debug_instance: results.debug.instance,
            files: files.map(file => file._id),
            date: new Date()
        });
        await Assignment.findOneAndUpdate({_id: assignment}, {$push: {responses: result._id}}).exec();
        return result._id;
    }
}

exports.Submission = Submission;

// Compare a formatted test result with a Test Schema

function getDifference(input, test) {

    let passed;
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

    passed = (error_type.length < 1);

    return {
        error_diff: error_diff,
        passed: passed,
        diff: diff,
        error_type: error_type,
        stderr: input.stderr,
        signal: input.signal,
        exit: input.exit,
        time: input.time,
        output: input.stdout,
        stdout: input.stdout,
        test: test._id
    };

}

let parseWorkspace = async (workspaceId) => {
    const submission = new Submission();
    let workspace = await Workspace.findById(workspaceId).populate('files').exec();
    let assignment = await Assignment.findById(workspace.assignment._id).populate(['shared_files', 'tests']).exec();
    submission.setMake(assignment.command);
    workspace.files.forEach(file => submission.addFile(file.name, file.content));
    assignment.shared_files.forEach(file => submission.addSharedFile(file.name, file.contents));
    assignment.tests.forEach((test) => submission.addTest(test));
    return submission;
};

exports.evaluateFromWorkspace = async (workspaceId) => {
    const workspace = await parseWorkspace(workspaceId);
    return workspace.formatSubmission();
};

exports.submitWorkspace = async (workspaceId) => {
    const workspace = await Workspace.findById(workspaceId).exec();
    const preparedWorkspace = await parseWorkspace(workspaceId);
    return preparedWorkspace.testSubmission(workspace.student, workspace.assignment);
}


const fetchResponse = (submission) => new Promise((resolve, reject) => {
    const data = JSON.stringify({
        make: submission.make,
        files: submission.files,
        tests: submission.tests
    });

    const options = {
        hostname: config.WORKER,
        port: 443,
        path: '/api/test',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = https.request(options, res => {
        let chunk = '';
        res.on('data', d => {
            chunk += d;
        });
        res.on('end', d => {
            resolve(JSON.parse(String(chunk)));
        });
    })

    req.on('error', error => {
        reject(new Error(error));
    });

    req.write(data)
    req.end()
});
