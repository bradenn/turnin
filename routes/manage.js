let express = require('express');
let router = express.Router();
let User = require('../models/user');
let Assignment = require('../models/assignment');
let File = require('../models/file');
let Course = require('../models/course');

router.get('/', async (req, res, next) => {
    if(req.user.type <= 1) next(new Error("Authentication Error."));
    let courses = await Course.find({}).populate("instructor").exec();
    let assignments = await Assignment.find({}).populate("instructor").exec();
    let files = await File.find({}).populate("student").exec();
    let users = await User.find({}).exec();
    let instructors = await User.find({type: 1}).exec();
    let students = await User.find({type: 0}).exec();
    res.render("manage", {
        courses: courses,
        users: users,
        instructors: instructors,
        assignments: assignments,
        students: students,
        files: files
    });
});


module.exports = router;