let express = require('express');
let router = express.Router();

router.use('/', require('./home.js'));
router.use('/courses', require('./course.js'));
router.use('/assignments', require('./assignments.js'));
router.use('/response', require('./response.js'));
router.use('/test', require('./test.js'));
router.use('/manage', require('./manage.js'));
router.use('/file', require('./file.js'));
router.use('/submit', require('./submit.js'));
router.use('/profile', require('./profile.js'));

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
