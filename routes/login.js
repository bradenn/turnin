let router = require('express').Router();
let User = require('../models/user');

router.get('/', (req, res) => {
    if (req.user != null) res.redirect("/");
    return res.render("login");
});

router.post('/', (req, res) => {
    if (req.body.logUser && req.body.logPassword) {
        User.authenticate(req.body.logUser, req.body.logPassword).then(user => {
            req.session.userId = user._id;
            return res.redirect('/');
        }).catch((error) => {
            return res.render("login", {err: error});
        });
    }
});


module.exports = router;
