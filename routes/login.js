let router = require('express').Router();
let User = require('../models/user');
let faker = require('faker');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (user != null) return res.redirect("/");
    return res.render("login", {
      title: "Login",
      user: user
    });
  });
});

router.post('/', function(req, res, next) {
  if (req.body.logUser && req.body.logPassword) {
    User.authenticate(req.body.logUser, req.body.logPassword, function(error, user) {
      if (error || !user) {
        User.findById(req.session.userId)
          .exec(function(error, user) {
            if (error) {
              return next(error);
            } else {
              return res.render("login", {
                title: "Login",
                user: user,
                error: {
                  type: "login",
                  message: "Incorrect username or password"
                }
              });
            }
          });
      } else {
        if (user.account == 'banned') {
          return res.redirect('/banned');
        } else {
          req.session.userId = user._id;
          return res.redirect('/');
        }

      }
    });
  }
});


module.exports = router;
