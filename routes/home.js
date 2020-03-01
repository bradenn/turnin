let router = require('express').Router();
let User = require('../models/user');
let Course = require('../models/course');
let Assignments = require('../models/assignment');

router.get('/', async (req, res, next) => {
    if (!req.user) return res.redirect("/login");
    let courses = await Course.find({_id: {$in: req.user.courses}});
    return res.render("home", {
        user: req.user,
        courses: courses
    });
});

router.post('/', async (req, res, next) => {
    let course = await Course.findOne({code: req.body.code.toLowerCase()});
    if (!course) return res.redirect("/");
    User.findOneAndUpdate({_id: req.user._id}, {$addToSet: {courses: course._id}}, (err, user) => {
        return res.redirect("back")
    });
});

module.exports = router;
