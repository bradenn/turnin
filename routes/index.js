let express = require('express');
let User = require('../models/user');
let router = express.Router();

router.use('/', require('./home.js'));
router.use('/courses', require('./course.js'));
router.use('/user', require('./user.js'));
router.use('/editor', require('./editor.js'));
router.use('/workspace', require('./workspace.js'));
router.use('/assignments', require('./assignments.js'));
router.use('/response', require('./response.js'));
router.use('/test', require('./test.js'));
router.use('/manage', require('./manage.js'));
router.use('/file', require('./file.js'));
router.use('/submit', require('./submit.js'));
router.use('/profile', require('./profile.js'));

router.get('/toggledarkmode', async (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, {darkmode: !req.user.darkmode}, (err, usr) =>{
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
