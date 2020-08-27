let express = require('express');
let router = express.Router();
let User = require('../models/user');
let Assignment = require('../models/assignment');
let File = require('../models/file');
let Course = require('../models/course');
let faker = require('faker');

router.get('/', (req, res, next) => {
    return res.redirect('/manage/students');
});

router.get('/purge/:user', (req, res, next) => {
    if (req.params.user.toString() === req.user._id.toString() && req.user.type === 2) {
        Assignment.deleteMany({}).exec().then(() => {
            File.deleteMany({}).exec().then(() => {
                Course.deleteMany({}).exec().then(() => {
                    req.params.info = "Purged Mutables";
                    res.redirect('back');
                }).catch(err => res.send(err));
            }).catch(err => res.send(err));
        }).catch(err => res.send(err));
    }
});


router.get('/:section', async (req, res, next) => {
    if (req.user.type <= 1) next(new Error("Authentication Error."));
    let courses = await Course.find({}).populate("instructor").exec();
    let assignments = await Assignment.find({}).populate("instructor").exec();
    let files = await File.find({}).populate("student").exec();
    let users = await User.find({}).exec();
    let instructors = await User.find({type: 1}).exec();
    let students = await User.find({type: 0}).exec();
    res.render("manage", {
        section: req.params.section,
        courses: courses,
        users: users,
        instructors: instructors,
        assignments: assignments,
        students: students,
        files: files
    });
});

router.get('/user/:userid/delete', async (req, res, next) => {
    if (req.user.type <= 1) {
        req.session.error = "You do not have permission to do that."
        return res.redirect('back');
    } else {
        await User.findOneAndDelete({_id: req.params.userid}).exec();
        req.session.info = "User deleted."
        res.redirect('back');
    }

});

router.get('/add', (req, res) => {
    const user = {
        username: faker.internet.userName(),
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: faker.internet.email(),
        github: faker.internet.url(),
        password: faker.internet.password(),
        type: Math.floor(Math.random() * 3)
    };
    User.create(user);
    res.json(user)

});


module.exports = router;