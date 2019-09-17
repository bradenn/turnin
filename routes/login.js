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

function getRand(t) {
  var c = t.length;
  var z = Math.floor(Math.random() * c);
  return t[z];
}

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
        picture: "https://bn-media-aws.s3.us-west-2.amazonaws.com/1564603161391",
        account: "user",
        date: new Date()
      }
      User.create(userData, function(error, user) {
        if (error) {
          return res.render("login", {
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
      return res.render("login", {
        title: "Login",
        user: null,
        error: {
          type: "register",
          message: "You fucking bafoon! Who the fuck puts a god damn space in their fucking username!? Try again."
        }
      });
    }
  } else if (req.body.logUser && req.body.logPassword) {
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
  } else {
    User.findById(req.session.userId)
      .exec(function(error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render("login", {
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

router.get('/faker', function(req, res, next) {
  var userData = {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    password: faker.internet.password(),
    picture: "https://bn-media-aws.s3.us-west-2.amazonaws.com/1564603161391",
    account: "user",
    date: new Date()
  }
  User.create(userData, function(error, user) {
    if (error) {
      return res.render("login", {
        title: "Login",
        user: user,
        error: {
          type: "register",
          message: "This username or email is taken."
        }
      });
    } else {
      req.session.userId = user._id;
      return res.send('wow');
    }
  });
});

module.exports = router;
