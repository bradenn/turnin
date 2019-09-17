var router = require('express').Router();
let User = require('../models/user');
let Topic = require('../models/topic');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    var e = {};
    Topic.find(e, function(err, topics) {
      return res.render("moderate", {
        title: "Moderation",
        user: user,
        topics: topics
      });
    }).sort({
      _id: -1
    });
  });
});

router.get('/flag/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    Topic.findById(req.params.id, function(err, topic) {
      topic.standing += 1;
      topic.save(function(err) {
        res.redirect(req.get('referer'));
      });
    });
  });
});

router.get('/publish/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    Topic.findById(req.params.id, function(err, topic) {
      topic.published = true;
      topic.save(function(err) {
        res.redirect(req.get('referer'));
      });
    });
  });
});

router.get('/unpublish/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    Topic.findById(req.params.id, function(err, topic) {
      topic.published = false;
      topic.save(function(err) {
        res.redirect(req.get('referer'));
      });
    });
  });
});

router.get('/delete/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (user.account == "admin" || user.account == "superadmin") {
      Topic.deleteOne({
        _id: req.params.id
      }, function(err) {
        res.redirect(req.get('referer'));
      });
    } else {
      var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
      res.send("<b>You have attempted to breach security.</b> Your IP address [" + ip + "] has been logged and forwarded to IC3. Any further tampering will result in your client being blacklisted.");
    }
  });
});

module.exports = router;
