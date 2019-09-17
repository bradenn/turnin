var router = require('express').Router();
let User = require('../models/user');
let Topic = require('../models/topic');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    User.find({}, function(err, users) {
      User.findOne({
        username: req.query.target
      }, function(err, target) {
        return res.render("admin", {
          title: "Admin",
          user: user,
          users: users,
          target: target,
          state: "users"
        });
      });
    });
  });
});

router.get('/articles', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    User.findOne({
      username: req.query.target
    }, function(err, target) {
      var e = {};
      Topic.find(e, function(err, topics) {
        return res.render("articleadmin", {
          title: "Admin : Articles",
          user: user,
          topics: topics,
          state: "articles"
        });
      }).sort({
        _id: -1
      });
    });
  });
});

router.post('/account/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    User.findById(req.params.id, function(err, target) {
      if (user.account.toString() == "admin" || user.account.toString() == "superadmin") {
        target.account = req.body.type;
        target.save(function(err) {
          res.redirect(req.get('referer'));
        });
      }

    });
  });
});

module.exports = router;
