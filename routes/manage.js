var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    Class.find({
      instructor: req.session.userId
    }, function(err, classes) {
      if (user != null && user.type == "instructor") {
        return res.render("manage", {
          user: user,
          classes: classes
        });
      } else {
        return res.redirect("/login");
      }
    });
  });
});

router.post('/new/class', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (user != null && user.type == "instructor") {
      var classData = {
        name: req.body.classname,
        section: req.body.classsection,
        instructor: user._id
      }
      Class.create(classData, function(error, clas) {
        if (error) {
          res.send("Whoopsies... Get braden.. or try again..");
        } else {
          res.redirect(req.get('referer'));
        }
      });
    }else{
      return res.redirect("/");
    }
  });
});

module.exports = router;
