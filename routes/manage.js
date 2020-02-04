let router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    Class.find({
      instructor: req.session.userId
    }, function(err, classes) {
      if (user != null && user.type > 0) {
        res.render("manage", {
          user: user,
          classes: classes
        });
      } else {
        res.redirect("/login");
      }
    });
  });
});

router.post('/new/class', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (user != null && user.type > 0) {
      console.log(req.body);
      let classData = {
        name: req.body.name,
        section: req.body.section,
        instructor: user._id,
        code: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
      };
      Class.create(classData, function(error, clas) {
        if (error) {
          res.send("Whoopsies... Get braden.. or try again..");
        } else {
          res.redirect(req.get('referer'));
        }
      });
    }else{
      res.redirect("/");
    }
  });
});

module.exports = router;
