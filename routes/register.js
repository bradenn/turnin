let router = require('express').Router();
let User = require('../models/user');
let faker = require('faker');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (user != null) return res.redirect("/");
    return res.render("register", {
      user: user
    });
  });
});

router.post('/', function(req, res, next) {
  if (req.body.password !== req.body.confPassword) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }


  if (req.body.email && req.body.user && req.body.firstname &&
    req.body.password && req.body.lastname && req.body.confPassword) {
    var userNameString = req.body.user;
    if (userNameString.includes(" ") == false) {
      var userData = {
        email: req.body.email,
        username: req.body.user,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        date: new Date()
      }
      User.create(userData, function(error, user) {
        if (error) {
          return res.render("register", {
            title: "Login",
            user: user,
            error: {
              type: "register",
              message: "This username or email is taken."
            }
          });
        } else {
          req.session.userId = user._id;
          return res.redirect('/');
        }
      });
    } else {
      return res.render("register", {
        title: "Login",
        user: null,
        error: {
          type: "register",
          message: "You fucking bafoon! Who the fuck puts a god damn space in their fucking username!? Try again."
        }
      });
    }
  } else {
    User.findById(req.session.userId)
      .exec(function(error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render("register", {
            title: "Login",
            user: user,
            error: {
              type: "register",
              message: "All fields must be complete"
            }
          });
        }
      });

  }
});

module.exports = router;
