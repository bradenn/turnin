let router = require('express').Router();
let User = require('../models/user');
let Course = require('../models/course');
let Assignments = require('../models/assignment');
let Workspace = require('../models/workspace');

router.get('/', async (req, res, next) => {
    let courses = await Course.find({_id: {$in: req.user.courses}});
    let workspaces = await Workspace.find({student: req.user._id}).exec();
    return res.render("home", {
        user: req.user,
        courses: courses,
        workspaces: workspaces
    });
});

router.post('/', async (req, res, next) => {
    let course = await Course.findOne({code: req.body.code.toLowerCase()});
    if (!course) return res.redirect("/");
    User.findOneAndUpdate({_id: req.user._id}, {$addToSet: {courses: course._id}}, (err, user) => {
        Course.findOneAndUpdate({code: req.body.code.toLowerCase()}, {$addToSet: {students: user._id}}, (err, course) => {
            return res.redirect("back")
        });
    });
});

module.exports = router;
