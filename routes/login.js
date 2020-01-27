let router = require('express').Router();
let User = require('../models/user');
let faker = require('faker');

router.get('/', function (req, res, next) {
    User.findById(req.session.userId, function (err, user) {
        if (user != null) res.redirect("/");
        res.render("login", {
            title: "Login",
            user: user
        });
    });
});

router.post('/', function (req, res, next) {
    if (req.body.logUser && req.body.logPassword) {
        User.authenticate(req.body.logUser, req.body.logPassword, function (error, user) {
            if (error || !user) {
                //res.redirect('/login');
              console.log(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/');
            }
        });
    }
});


module.exports = router;
