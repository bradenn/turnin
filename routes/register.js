let router = require('express').Router();
let User = require('../models/user');
let faker = require('faker');

router.get('/', function (req, res, next) {
    User.findById(req.session.userId, function (err, user) {
        if (user != null) return res.redirect("/");
        return res.render("register", {
            user: user
        });
    });
});

router.post('/', function (req, res, next) {
    if (req.body.password !== req.body.confPassword) {
        return res.render("register", {
            err: "Passwords do not match..."
        });
    }


    if (req.body.email && req.body.user && req.body.firstname &&
        req.body.password && req.body.lastname && req.body.confPassword) {
        let userNameString = req.body.user;
        if (userNameString.includes(" ") == false) {
            let userData = {
                email: req.body.email,
                username: req.body.user,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                password: req.body.password,
                date: new Date()
            };
            User.create(userData, function (error, user) {
                if (error) {
                    return res.render("register", {
                        err: "This username or email is already in use."
                    });
                } else {
                    req.session.userId = user._id;
                    res.redirect('/');
                    next();
                }
            });
        } else {
            return res.render("register", {
               err: "Since when is it okay to put a space in your username? Try again..."
            });
        }
    } else {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    next();
                } else {
                    return res.render("register", {
                       err: "All fields must be complete"
                    });
                }
            });

    }
});

module.exports = router;
