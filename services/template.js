const Assignment = require('../models/assignment');
const TemplateSchema = require('../models/template.model');

class Template {
    constructor() {
        this.tests = [];
        this.files = [];
        this.shared_files = [];
        this.name = "";
        this.course = "";
        this.command = "";
        this.timeout = 5000;
    }

    addTest(test) {
        this.tests.push({
            name: test.name,
            stdout: test.outputs,
            stdin: test.inputs,
            stderr: test.error,
            timeout: test.timeout,
            provided: test.provided,
            arguments: test.arguments,
            exit: test.code,
            hidden: test.hidden
        });
    }

    addFile(file) {
        this.files.push(file);
    }

    addSharedFile(file) {
        this.shared_files.push({name: file.name, content: file.content});
    }

    setName(name) {
        this.name = name;
    }

    setCourse(name) {
        this.course = name;
    }

    setCommand(command) {
        this.command = command;
    }

    setTimeout(timeout) {
        this.timeout = timeout;
    }

    save() {
        return new Promise((resolve, reject) => {
            TemplateSchema.create({
                name: this.name, course: this.course, timeout: this.timeout, command: this.command, content: JSON.stringify({
                    tests: this.tests,
                    files: this.files,
                    shared_files: this.shared_files,
                })
            }, (err, doc) => {
                if (err) reject(err);
                resolve(doc._id);
            });
        });
    }

    generateJson() {
        console.log({
            tests: this.tests,
            files: this.files,
            shared_files: this.shared_files,
            name: this.name,
            course: this.course
        });
    }
}

module.exports = Template;