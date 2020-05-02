let express = require('express');
let router = express.Router();
let utils = require('../services/utils');
let User = require('../models/user');
let Course = require('../models/course');
let database = require('../services/database');

router.get('/', async (req, res, next) => {
    let courses = await Course.find({instructor: req.session.userId}).exec();
    res.render("courses", {user: req.user, courses: courses});
});

router.post('/', async (req, res, next) => {
    let user = await User.findById(req.session.userId).exec();
    if (utils.authenticateUser(user)) return res.redirect("/");
    await Course.create({
        name: req.body.name,
        section: req.body.section,
        instructor: user._id,
        code: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    }, (err, course) => {
        return res.redirect(`/courses`);
    });
});

router.get('/:course', async (req, res) => {
    let course = await Course.findById(req.params.course).populate("students").exec();
    res.render("course", {course: course});
});

router.get('/:course/delete', async (req, res, next) => {
    if (utils.authenticateUser(req.user)) return res.redirect("/");
    database.deleteCourse(req.params.course);
    res.redirect("/courses");
});


router.delete('/:course', async (req, res, next) => {

});


module.exports = router;