let express = require('express');
let User = require('../models/user');
let router = express.Router();

router.use('/', require('./home.js'));
router.use('/courses', authenticate);
router.use('/courses', require('./course.js'));
router.use('/user', require('./user.js'));
router.use('/editor', require('./editor.js'));
router.use('/workspace', require('./workspace.js'));
router.use('/assignments', authenticate);
router.use('/assignments', require('./assignments.js'));
router.use('/response', require('./response.js'));
router.use('/test', require('./test.js'));
router.use('/manage', adminAuth);
router.use('/manage', require('./manage.js'));
router.use('/template', require('./template.js'));
router.use('/file', require('./file.js'));
router.use('/submit', require('./submit.js'));
router.use('/profile', require('./profile.js'));

function authenticate(req, res, next) {
    if (!req.user.type >= 1) {
        req.session.error = "No, you cannot do that.";
        res.redirect('back');
    } else {
        next();
    }
}

function adminAuth(req, res, next) {
    if (!req.user.type >= 2) {
        req.session.error = "No, you cannot do that.";
        res.redirect('back');
    } else {
        next();
    }
}

router.get('/toggledarkmode', async (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, {darkmode: !req.user.darkmode}, (err, usr) => {
        req.session.info = `Switched to ${!usr.darkmode ? 'dark mode' : 'light mode'}.`;
        res.redirect('back');
    });
});

router.get('/logout', function (req, res, next) {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                next(err);
            } else {
                res.redirect('/');
            }
        });
    }
});

module.exports = router;
