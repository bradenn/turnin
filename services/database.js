let Course = require('../models/course');
let Assignment = require('../models/assignment');
let Test = require('../models/test');
let Response = require('../models/result');
let Output = require('../models/output');
let File = require('../models/file');

let deleteCourse = async (id) => {
    let course = await Course.findById(id).exec();
    let assignments = course.assignments;
    assignments.forEach((assignment) => deleteAssignment(assignment._id));
    Course.findOneAndRemove({_id: id}, (err) => {

    });
};

let deleteAssignment = async (id) => {
    let assignment = await Assignment.findById(id).populate("shared_files").exec();
    assignment.tests.forEach((test) => deleteTest(test._id));
    assignment.shared_files.forEach((file) => deleteFile(file._id));
    assignment.responses.forEach((response) => deleteResponse(response._id));
    Assignment.findOneAndRemove({_id: id}, (err) => {

    });
};

let deleteTest = (id) => {
    Test.findOneAndRemove({_id: id}, (err) => {

    });
};

let deleteFile = (id) => {
    File.findOneAndRemove({_id: id}, (err) => {

    });
};

let deleteResponse = async (id) => {
    let response = await Response.findById(id).exec();
    response.files.forEach((file) => deleteFile(file._id));
    response.outputs.forEach((output) => deleteOutput(output._id));
    Response.findOneAndRemove({_id: id}, (err) => {

    });
};

let deleteOutput = (id) => {
    Output.findOneAndRemove({_id: id}, (err) => {

    });
};

module.exports.deleteCourse = deleteCourse;

