let express = require('express');
let router = express.Router();
let utils = require('../services/utils');
let User = require('../models/user');
let Course = require('../models/course');

router.get('/', async (req, res, next) => {
    let user = await User.findById(req.session.userId).exec();
    if (utils.authenticateUser(user)) return res.redirect("/");
    let courses = await Course.find({instructor: req.session.userId}).exec();
    res.render("courses", {user: user, courses: courses});
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
        return res.redirect(`/courses/${course._id}`);
    });
});

router.get('/:course', async (req, res, next) => {
    let user = await User.findById(req.session.userId).exec();
    if (utils.authenticateUser(user)) return res.redirect("/");
    let course = await Course.findById(req.params.course).exec();
    res.render("course", {user: user, course: course});
});

router.put('/:course', async (req, res, next) => {

});

router.delete('/:course', async (req, res, next) => {

});



module.exports = router;