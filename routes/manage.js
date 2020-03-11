let express = require('express');
let router = express.Router();
let utils = require('../services/utils');
let User = require('../models/user');
let Course = require('../models/course');

router.get('/', async (req, res, next) => {
    if (utils.authenticateUser(req.user)) return res.redirect("/");
    let courses = await Course.find({instructor: req.session.userId}).exec();
    let users = await User.find({}).exec();
    let instructors = await User.find({type: 1}).exec();
    let students = await User.find({type: 0}).exec();
    res.render("manage", {
        user: req.user,
        courses: courses,
        users: users,
        instructors: instructors,
        students: students
    });
});


module.exports = router;